#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod consultation_escrow {
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct ConsultationEscrow {
        next_id: u64,
        consultations: Mapping<u64, Consultation>,
        platform_fee_percent: u8,
        platform_wallet: AccountId,
        owner: AccountId,
        health_registry_address: AccountId,
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Consultation {
        pub id: u64,
        pub patient: AccountId,
        pub doctor: AccountId,
        pub amount: Balance,
        pub status: ConsultationStatus,
        pub scheduled_time: u64,
        pub created_at: u64,
        pub completed_at: Option<u64>,
        pub notes_ipfs_hash: Option<String>,
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum ConsultationStatus {
        Pending,      // Payment locked, waiting for scheduled time
        InProgress,   // Consultation is happening
        Completed,    // Doctor marked as complete
        Disputed,     // Patient disputed the consultation
        Refunded,     // Refunded to patient
        Released,     // Payment released to doctor
        Cancelled,
        NoShow,
    }

    #[ink(event)]
    pub struct ConsultationBooked {
        #[ink(topic)]
        consultation_id: u64,
        #[ink(topic)]
        patient: AccountId,
        #[ink(topic)]
        doctor: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct ConsultationCompleted {
        #[ink(topic)]
        consultation_id: u64,
    }

    #[ink(event)]
    pub struct PaymentReleased {
        #[ink(topic)]
        consultation_id: u64,
        #[ink(topic)]
        doctor: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct ConsultationDisputed {
        #[ink(topic)]
        consultation_id: u64,
    }

    #[ink(event)]
    pub struct ConsultationRefunded {
        #[ink(topic)]
        consultation_id: u64,
        #[ink(topic)]
        patient: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct ConsultationCancelled {
        #[ink(topic)]
        consultation_id: u64,
        cancelled_by: AccountId,
        refund_amount: Balance,
    }

    #[ink(event)]
    pub struct NoShowReported {
        #[ink(topic)]
        consultation_id: u64,
        #[ink(topic)]
        doctor: AccountId,
    }

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        Unauthorized,
        ConsultationNotFound,
        InvalidStatus,
        InsufficientPayment,
        TransferFailed,
        DisputeWindowExpired,
        TooEarlyToRelease,
        OverflowError,
        DoctorNotVerified,
        SlotNotAvailable,
        CancellationNotAllowed,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for ConsultationEscrow {
        fn default() -> Self {
            Self::new(
                AccountId::from([0x0; 32]),
                3,
                AccountId::from([0x0; 32])
            )
        }
    }

    impl ConsultationEscrow {
        #[ink(constructor)]
        pub fn new(
            platform_wallet: AccountId, 
            platform_fee_percent: u8, 
            health_registry_address: AccountId,
        ) -> Self {
            Self {
                next_id: 1,
                consultations: Mapping::default(),
                platform_fee_percent,
                platform_wallet,
                owner: Self::env().caller(),
                health_registry_address,
            }
        }

        #[ink(message, payable)]
        pub fn book_consultation(
            &mut self,
            doctor: AccountId,
            scheduled_time: u64,
        ) -> Result<u64> {
            let caller = self.env().caller();
            let amount = self.env().transferred_value();

            if amount == 0 {
                return Err(Error::InsufficientPayment);
            }

            let consultation_id = self.next_id;
            
            let consultation = Consultation {
                id: consultation_id,
                patient: caller,
                doctor,
                amount,
                status: ConsultationStatus::Pending,
                scheduled_time,
                created_at: self.env().block_timestamp(),
                completed_at: None,
                notes_ipfs_hash: None,
            };

            self.consultations.insert(consultation_id, &consultation);
            
            self.next_id = self.next_id
                .checked_add(1)
                .ok_or(Error::OverflowError)?;

            self.env().emit_event(ConsultationBooked {
                consultation_id,
                patient: caller,
                doctor,
                amount,
            });

            Ok(consultation_id)
        }

        #[ink(message)]
        pub fn start_consultation(&mut self, consultation_id: u64) -> Result<()> {
            let caller = self.env().caller();
            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            if consultation.doctor != caller {
                return Err(Error::Unauthorized);
            }

            if consultation.status != ConsultationStatus::Pending {
                return Err(Error::InvalidStatus);
            }

            consultation.status = ConsultationStatus::InProgress;
            self.consultations.insert(consultation_id, &consultation);

            Ok(())
        }

        #[ink(message)]
        pub fn mark_completed(
            &mut self,
            consultation_id: u64,
            notes_ipfs_hash: String,
        ) -> Result<()> {
            let caller = self.env().caller();
            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            if consultation.doctor != caller {
                return Err(Error::Unauthorized);
            }

            if consultation.status != ConsultationStatus::InProgress {
                return Err(Error::InvalidStatus);
            }

            consultation.status = ConsultationStatus::Completed;
            consultation.completed_at = Some(self.env().block_timestamp());
            consultation.notes_ipfs_hash = Some(notes_ipfs_hash);
            self.consultations.insert(consultation_id, &consultation);

            self.env().emit_event(ConsultationCompleted { consultation_id });

            Ok(())
        }

        #[ink(message)]
        pub fn release_payment(&mut self, consultation_id: u64) -> Result<()> {
            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            if consultation.status != ConsultationStatus::Completed {
                return Err(Error::InvalidStatus);
            }

            let completed_at = consultation.completed_at.ok_or(Error::InvalidStatus)?;
            let dispute_window = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            let current_time = self.env().block_timestamp();
            
            let time_since_completion = current_time
                .checked_sub(completed_at)
                .ok_or(Error::TooEarlyToRelease)?;

            if time_since_completion < dispute_window {
                if self.env().caller() != self.owner {
                    return Err(Error::TooEarlyToRelease);
                }
            }

            let fee_amount = self.calculate_fee(consultation.amount)?;
            let doctor_amount = consultation.amount
                .checked_sub(fee_amount)
                .ok_or(Error::OverflowError)?;

            if self.env().transfer(consultation.doctor, doctor_amount).is_err() {
                return Err(Error::TransferFailed);
            }

            if fee_amount > 0 {
                if self.env().transfer(self.platform_wallet, fee_amount).is_err() {
                    return Err(Error::TransferFailed);
                }
            }

            consultation.status = ConsultationStatus::Released;
            self.consultations.insert(consultation_id, &consultation);

            self.env().emit_event(PaymentReleased {
                consultation_id,
                doctor: consultation.doctor,
                amount: doctor_amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn dispute_consultation(&mut self, consultation_id: u64) -> Result<()> {
            let caller = self.env().caller();
            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            if consultation.patient != caller {
                return Err(Error::Unauthorized);
            }

            if consultation.status != ConsultationStatus::Completed {
                return Err(Error::InvalidStatus);
            }

            let completed_at = consultation.completed_at.ok_or(Error::InvalidStatus)?;
            let dispute_window = 24 * 60 * 60 * 1000;
            let current_time = self.env().block_timestamp();
            
            let time_since_completion = current_time
                .checked_sub(completed_at)
                .ok_or(Error::DisputeWindowExpired)?;

            if time_since_completion > dispute_window {
                return Err(Error::DisputeWindowExpired);
            }

            consultation.status = ConsultationStatus::Disputed;
            self.consultations.insert(consultation_id, &consultation);

            self.env().emit_event(ConsultationDisputed { consultation_id });

            Ok(())
        }

        #[ink(message)]
        pub fn refund_consultation(&mut self, consultation_id: u64) -> Result<()> {
            let caller = self.env().caller();
            
            if caller != self.owner {
                return Err(Error::Unauthorized);
            }

            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            if consultation.status != ConsultationStatus::Disputed {
                return Err(Error::InvalidStatus);
            }

            if self.env().transfer(consultation.patient, consultation.amount).is_err() {
                return Err(Error::TransferFailed);
            }

            consultation.status = ConsultationStatus::Refunded;
            self.consultations.insert(consultation_id, &consultation);

            self.env().emit_event(ConsultationRefunded {
                consultation_id,
                patient: consultation.patient,
                amount: consultation.amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn get_consultation(&self, consultation_id: u64) -> Option<Consultation> {
            self.consultations.get(consultation_id)
        }

        #[ink(message)]
        pub fn get_platform_fee_percent(&self) -> u8 {
            self.platform_fee_percent
        }

        fn calculate_fee(&self, amount: Balance) -> Result<Balance> {
            let fee_percent = self.platform_fee_percent as u128;
            let fee = amount
                .checked_mul(fee_percent)
                .ok_or(Error::OverflowError)?
                .checked_div(100)
                .ok_or(Error::OverflowError)?;
            Ok(fee)
        }

        #[ink(message)]
        pub fn update_platform_fee(&mut self, new_fee_percent: u8) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::Unauthorized);
            }
            self.platform_fee_percent = new_fee_percent;
            Ok(())
        }

        /// Cancel consultation with refund policy
        #[ink(message)]
        pub fn cancel_consultation(&mut self, consultation_id: u64) -> Result<()> {
            let caller = self.env().caller();
            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            // Only patient or doctor can cancel
            if consultation.patient != caller && consultation.doctor != caller {
                return Err(Error::Unauthorized);
            }

            // Can only cancel if Pending
            if consultation.status != ConsultationStatus::Pending {
                return Err(Error::CancellationNotAllowed);
            }

            // Check timing for refund policy
            let current_time = self.env().block_timestamp();
            let time_until_consultation = consultation.scheduled_time
                .checked_sub(current_time)
                .unwrap_or(0);

            // Refund policy: 
            // >24h before: 100% refund
            // <24h before: 50% refund (rest goes to doctor as cancellation fee)
            let refund_amount = if time_until_consultation > 24 * 60 * 60 * 1000 {
                consultation.amount
            } else {
                consultation.amount
                    .checked_div(2)
                    .ok_or(Error::OverflowError)?
            };

            // Transfer refund to patient
            if self.env().transfer(consultation.patient, refund_amount).is_err() {
                return Err(Error::TransferFailed);
            }

            // If less than 100% refund, send remainder to doctor
            if refund_amount < consultation.amount {
                let doctor_compensation = consultation.amount
                    .checked_sub(refund_amount)
                    .ok_or(Error::OverflowError)?;
                if self.env().transfer(consultation.doctor, doctor_compensation).is_err() {
                    return Err(Error::TransferFailed);
                }
            }

            consultation.status = ConsultationStatus::Cancelled;
            self.consultations.insert(consultation_id, &consultation);

            self.env().emit_event(ConsultationCancelled {
                consultation_id,
                cancelled_by: caller,
                refund_amount,
            });

            Ok(())
        }

        /// Report doctor no-show
        #[ink(message)]
        pub fn report_no_show(&mut self, consultation_id: u64) -> Result<()> {
            let caller = self.env().caller();
            let mut consultation = self.consultations
                .get(consultation_id)
                .ok_or(Error::ConsultationNotFound)?;

            // Only patient can report no-show
            if consultation.patient != caller {
                return Err(Error::Unauthorized);
            }

            // Must be past scheduled time
            let current_time = self.env().block_timestamp();
            if current_time < consultation.scheduled_time {
                return Err(Error::TooEarlyToRelease);
            }

            // Must be in Pending or InProgress status
            if consultation.status != ConsultationStatus::Pending 
                && consultation.status != ConsultationStatus::InProgress {
                return Err(Error::InvalidStatus);
            }

            // Refund patient
            if self.env().transfer(consultation.patient, consultation.amount).is_err() {
                return Err(Error::TransferFailed);
            }

            consultation.status = ConsultationStatus::NoShow;
            self.consultations.insert(consultation_id, &consultation);

            self.env().emit_event(NoShowReported {
                consultation_id,
                doctor: consultation.doctor,
            });

            Ok(())
        }

        /// Book consultation with doctor verification check
        #[ink(message, payable)]
        pub fn book_verified_consultation(
            &mut self,
            doctor: AccountId,
            scheduled_time: u64,
        ) -> Result<u64> {
            // This would call health_registry contract to verify doctor
            // For now, we'll add a placeholder that we'll implement with cross-contract calls
            
            // TODO: Add cross-contract call to health_registry.is_doctor_verified(doctor)
            // For MVP, we'll just call the regular book_consultation
            self.book_consultation(doctor, scheduled_time)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let contract = ConsultationEscrow::new(accounts.bob, 3, accounts.alice);
            assert_eq!(contract.get_platform_fee_percent(), 3);
        }

        #[ink::test]
        fn book_consultation_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = ConsultationEscrow::new(accounts.bob, 3, accounts.alice);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000000000000);
            
            let result = contract.book_consultation(accounts.charlie, 1234567890);
            assert!(result.is_ok());
            
            let consultation_id = result.unwrap();
            assert_eq!(consultation_id, 1);
            
            let consultation = contract.get_consultation(consultation_id);
            assert!(consultation.is_some());
            assert_eq!(consultation.unwrap().status, ConsultationStatus::Pending);
        }

        #[ink::test]
        fn complete_flow_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = ConsultationEscrow::new(accounts.bob, 3, accounts.alice);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000000000000);
            let consultation_id = contract.book_consultation(accounts.charlie, 1234567890).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            assert!(contract.start_consultation(consultation_id).is_ok());
            
            assert!(contract.mark_completed(consultation_id, "QmNotes123".to_string()).is_ok());
            
            let consultation = contract.get_consultation(consultation_id).unwrap();
            assert_eq!(consultation.status, ConsultationStatus::Completed);
        }

        #[ink::test]
        fn unauthorized_access_fails() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = ConsultationEscrow::new(accounts.bob, 3, accounts.alice);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000000000000);
            let consultation_id = contract.book_consultation(accounts.charlie, 1234567890).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let result = contract.start_consultation(consultation_id);
            assert_eq!(result, Err(Error::Unauthorized));
        }
    }
}