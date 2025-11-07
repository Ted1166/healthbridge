#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod health_registry {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    /// Storage for the HealthRegistry contract
    #[ink(storage)]
    pub struct HealthRegistry {
        owner: AccountId,
        doctors: Mapping<AccountId, DoctorProfile>,
        patients: Mapping<AccountId, PatientProfile>,
        verified_doctors: Mapping<AccountId, bool>,
        /// Doctor availability schedules
        doctor_availability: Mapping<AccountId, AvailabilitySchedule>,
        total_doctors: u32,
        total_patients: u32,
    }

    /// Doctor profile structure
    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct DoctorProfile {
        pub name: String,
        pub specialty: String,
        pub license_number: String,
        pub license_ipfs_hash: String,
        pub consultation_fee: Balance,
        pub verified: bool,
        pub rating: u8,
        pub total_consultations: u32,
        pub completed_consultations: u32,
        pub cancelled_consultations: u32,
        pub no_show_count: u32,
    }

    /// Patient profile structure
    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct PatientProfile {
        pub name_hash: [u8; 32],
        pub medical_records_ipfs: String,
        pub emergency_contact_hash: [u8; 32],
        pub created_at: u64,
    }

    /// Time slot structure for availability
    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct TimeSlot {
        pub start_time: u64,  // Unix timestamp
        pub end_time: u64,    // Unix timestamp
        pub is_booked: bool,
    }

    /// Availability schedule (max 20 slots per doctor)
    #[derive(Debug, Clone, PartialEq, Eq, Default)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct AvailabilitySchedule {
        pub slots: Vec<TimeSlot>,
    }

    /// Doctor statistics for reputation
    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct DoctorStats {
        pub total_consultations: u32,
        pub completed_consultations: u32,
        pub cancelled_consultations: u32,
        pub no_show_count: u32,
        pub rating: u8,
        pub completion_rate: u8,  // Percentage
        pub verified: bool,
    }

    /// Events
    #[ink(event)]
    pub struct DoctorRegistered {
        #[ink(topic)]
        doctor: AccountId,
        specialty: String,
    }

    #[ink(event)]
    pub struct PatientRegistered {
        #[ink(topic)]
        patient: AccountId,
    }

    #[ink(event)]
    pub struct DoctorVerified {
        #[ink(topic)]
        doctor: AccountId,
    }

    #[ink(event)]
    pub struct AvailabilityUpdated {
        #[ink(topic)]
        doctor: AccountId,
        slots_count: u32,
    }

    /// Errors
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        NotOwner,
        DoctorAlreadyRegistered,
        PatientAlreadyRegistered,
        DoctorNotFound,
        PatientNotFound,
        Overflow,
        TooManySlots,
        InvalidTimeSlot,
        Unauthorized,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for HealthRegistry {
        fn default() -> Self {
            Self::new()
        }
    }

    impl HealthRegistry {
        /// Constructor - initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                doctors: Mapping::default(),
                patients: Mapping::default(),
                verified_doctors: Mapping::default(),
                doctor_availability: Mapping::default(),
                total_doctors: 0,
                total_patients: 0,
            }
        }

        /// Register a new doctor
        #[ink(message)]
        pub fn register_doctor(
            &mut self,
            name: String,
            specialty: String,
            license_number: String,
            license_ipfs_hash: String,
            consultation_fee: Balance,
        ) -> Result<()> {
            let caller = self.env().caller();
            
            if self.doctors.contains(caller) {
                return Err(Error::DoctorAlreadyRegistered);
            }

            let profile = DoctorProfile {
                name,
                specialty: specialty.clone(),
                license_number,
                license_ipfs_hash,
                consultation_fee,
                verified: false,
                rating: 0,
                total_consultations: 0,
                completed_consultations: 0,
                cancelled_consultations: 0,
                no_show_count: 0,
            };

            self.doctors.insert(caller, &profile);
            
            self.total_doctors = self.total_doctors
                .checked_add(1)
                .ok_or(Error::Overflow)?;

            self.env().emit_event(DoctorRegistered {
                doctor: caller,
                specialty,
            });

            Ok(())
        }

        /// Register a new patient
        #[ink(message)]
        pub fn register_patient(
            &mut self,
            name_hash: [u8; 32],
            medical_records_ipfs: String,
            emergency_contact_hash: [u8; 32],
        ) -> Result<()> {
            let caller = self.env().caller();
            
            if self.patients.contains(caller) {
                return Err(Error::PatientAlreadyRegistered);
            }

            let profile = PatientProfile {
                name_hash,
                medical_records_ipfs,
                emergency_contact_hash,
                created_at: self.env().block_timestamp(),
            };

            self.patients.insert(caller, &profile);
            
            self.total_patients = self.total_patients
                .checked_add(1)
                .ok_or(Error::Overflow)?;

            self.env().emit_event(PatientRegistered {
                patient: caller,
            });

            Ok(())
        }

        /// Verify a doctor (admin only)
        #[ink(message)]
        pub fn verify_doctor(&mut self, doctor: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }

            let mut profile = self.doctors.get(doctor).ok_or(Error::DoctorNotFound)?;
            
            profile.verified = true;
            self.doctors.insert(doctor, &profile);
            self.verified_doctors.insert(doctor, &true);

            self.env().emit_event(DoctorVerified { doctor });

            Ok(())
        }

        #[ink(message)]
        pub fn set_availability(&mut self, time_slots: Vec<TimeSlot>) -> Result<()> {
            let caller = self.env().caller();

            if !self.doctors.contains(caller) {
                return Err(Error::DoctorNotFound);
            }

            if time_slots.len() > 20 {
                return Err(Error::TooManySlots);
            }

            for slot in &time_slots {
                if slot.start_time >= slot.end_time {
                    return Err(Error::InvalidTimeSlot);
                }
            }

            let schedule = AvailabilitySchedule {
                slots: time_slots.clone(),
            };

            self.doctor_availability.insert(caller, &schedule);

            self.env().emit_event(AvailabilityUpdated {
                doctor: caller,
                slots_count: u32::try_from(time_slots.len()).unwrap_or(u32::MAX),
            });

            Ok(())
        }

        #[ink(message)]
        pub fn get_available_slots(&self, doctor: AccountId) -> Vec<TimeSlot> {
            self.doctor_availability
                .get(doctor)
                .map(|schedule| schedule.slots)
                .unwrap_or_default()
        }

        #[ink(message)]
        pub fn mark_slot_booked(&mut self, doctor: AccountId, start_time: u64) -> Result<()> {
            let mut schedule = self.doctor_availability
                .get(doctor)
                .ok_or(Error::DoctorNotFound)?;

            // Find and mark the slot as booked
            let mut found = false;
            for slot in &mut schedule.slots {
                if slot.start_time == start_time && !slot.is_booked {
                    slot.is_booked = true;
                    found = true;
                    break;
                }
            }

            if !found {
                return Err(Error::InvalidTimeSlot);
            }

            self.doctor_availability.insert(doctor, &schedule);
            Ok(())
        }

        /// Mark a time slot as available again (cancellation)
        #[ink(message)]
        pub fn mark_slot_available(&mut self, doctor: AccountId, start_time: u64) -> Result<()> {
            let mut schedule = self.doctor_availability
                .get(doctor)
                .ok_or(Error::DoctorNotFound)?;

            // Find and mark the slot as available
            for slot in &mut schedule.slots {
                if slot.start_time == start_time {
                    slot.is_booked = false;
                    break;
                }
            }

            self.doctor_availability.insert(doctor, &schedule);
            Ok(())
        }

        /// Get doctor statistics for reputation
        #[ink(message)]
        pub fn get_doctor_stats(&self, doctor: AccountId) -> Option<DoctorStats> {
            let profile = self.doctors.get(doctor)?;

            // Calculate completion rate
            let completion_rate = if profile.total_consultations > 0 {
                let rate = profile.completed_consultations
                    .checked_mul(100)
                    .and_then(|r| r.checked_div(profile.total_consultations))
                    .unwrap_or(0);
                rate.min(100) as u8
            } else {
                0
            };

            Some(DoctorStats {
                total_consultations: profile.total_consultations,
                completed_consultations: profile.completed_consultations,
                cancelled_consultations: profile.cancelled_consultations,
                no_show_count: profile.no_show_count,
                rating: profile.rating,
                completion_rate,
                verified: profile.verified,
            })
        }

        /// Update consultation stats (called by escrow contract)
        #[ink(message)]
        pub fn increment_completed(&mut self, doctor: AccountId) -> Result<()> {
            let mut profile = self.doctors.get(doctor).ok_or(Error::DoctorNotFound)?;
            
            profile.total_consultations = profile.total_consultations
                .checked_add(1)
                .ok_or(Error::Overflow)?;
            
            profile.completed_consultations = profile.completed_consultations
                .checked_add(1)
                .ok_or(Error::Overflow)?;
            
            self.doctors.insert(doctor, &profile);
            Ok(())
        }

        /// Increment cancelled consultations
        #[ink(message)]
        pub fn increment_cancelled(&mut self, doctor: AccountId) -> Result<()> {
            let mut profile = self.doctors.get(doctor).ok_or(Error::DoctorNotFound)?;
            
            profile.cancelled_consultations = profile.cancelled_consultations
                .checked_add(1)
                .ok_or(Error::Overflow)?;
            
            self.doctors.insert(doctor, &profile);
            Ok(())
        }

        /// Increment no-show count
        #[ink(message)]
        pub fn increment_no_show(&mut self, doctor: AccountId) -> Result<()> {
            let mut profile = self.doctors.get(doctor).ok_or(Error::DoctorNotFound)?;
            
            profile.no_show_count = profile.no_show_count
                .checked_add(1)
                .ok_or(Error::Overflow)?;
            
            self.doctors.insert(doctor, &profile);
            Ok(())
        }

        /// Get doctor profile
        #[ink(message)]
        pub fn get_doctor(&self, doctor: AccountId) -> Option<DoctorProfile> {
            self.doctors.get(doctor)
        }

        /// Get patient profile
        #[ink(message)]
        pub fn get_patient(&self, patient: AccountId) -> Option<PatientProfile> {
            self.patients.get(patient)
        }

        /// Check if doctor is verified (FOR CROSS-CONTRACT CALLS)
        #[ink(message)]
        pub fn is_doctor_verified(&self, doctor: AccountId) -> bool {
            self.verified_doctors.get(doctor).unwrap_or(false)
        }

        /// Get total number of doctors
        #[ink(message)]
        pub fn get_total_doctors(&self) -> u32 {
            self.total_doctors
        }

        /// Get total number of patients
        #[ink(message)]
        pub fn get_total_patients(&self) -> u32 {
            self.total_patients
        }

        /// Get contract owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Update doctor rating (called after consultation)
        #[ink(message)]
        pub fn update_doctor_rating(&mut self, doctor: AccountId, new_rating: u8) -> Result<()> {
            let mut profile = self.doctors.get(doctor).ok_or(Error::DoctorNotFound)?;
            
            // Average the new rating with existing (simple moving average)
            if profile.rating == 0 {
                profile.rating = new_rating;
            } else {
                let old_rating = profile.rating as u16;
                let new_rating_u16 = new_rating as u16;
                let total_rating = old_rating
                    .checked_add(new_rating_u16)
                    .and_then(|sum| sum.checked_div(2))
                    .unwrap_or(profile.rating as u16);
                profile.rating = u8::try_from(total_rating).unwrap_or(100).min(100);
            }
            
            self.doctors.insert(doctor, &profile);
            Ok(())
        }
    }

    /// Unit tests
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let contract = HealthRegistry::new();
            assert_eq!(contract.get_total_doctors(), 0);
            assert_eq!(contract.get_total_patients(), 0);
        }

        #[ink::test]
        fn register_doctor_works() {
            let mut contract = HealthRegistry::new();
            let result = contract.register_doctor(
                "Dr. John Doe".to_string(),
                "Rheumatology".to_string(),
                "LIC12345".to_string(),
                "QmHash123".to_string(),
                1000000000000,
            );
            assert!(result.is_ok());
            assert_eq!(contract.get_total_doctors(), 1);
        }

        #[ink::test]
        fn set_availability_works() {
            let mut contract = HealthRegistry::new();
            
            // Register doctor first
            contract.register_doctor(
                "Dr. Test".to_string(),
                "Cardiology".to_string(),
                "LIC999".to_string(),
                "QmHash".to_string(),
                500000000000,
            ).unwrap();

            let slots = ink::prelude::vec![
                TimeSlot {
                    start_time: 1000000,
                    end_time: 1003600,
                    is_booked: false,
                },
                TimeSlot {
                    start_time: 1010000,
                    end_time: 1013600,
                    is_booked: false,
                },
            ];

            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let result = contract.set_availability(slots.clone());
            assert!(result.is_ok());

            let saved_slots = contract.get_available_slots(accounts.alice);
            assert_eq!(saved_slots.len(), 2);
        }

        #[ink::test]
        fn get_doctor_stats_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = HealthRegistry::new();
            
            contract.register_doctor(
                "Dr. Stats".to_string(),
                "Oncology".to_string(),
                "LIC888".to_string(),
                "QmHash888".to_string(),
                750000000000,
            ).unwrap();

            contract.increment_completed(accounts.alice).unwrap();
            contract.increment_completed(accounts.alice).unwrap();
            contract.increment_cancelled(accounts.alice).unwrap();

            let stats = contract.get_doctor_stats(accounts.alice);
            assert!(stats.is_some());
            
            let stats = stats.unwrap();
            assert_eq!(stats.completed_consultations, 2);
            assert_eq!(stats.cancelled_consultations, 1);
            assert_eq!(stats.completion_rate, 100); 
        }

        #[ink::test]
        fn mark_slot_booked_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = HealthRegistry::new();
            
            contract.register_doctor(
                "Dr. Busy".to_string(),
                "Pediatrics".to_string(),
                "LIC777".to_string(),
                "QmHash777".to_string(),
                600000000000,
            ).unwrap();

            let slots = ink::prelude::vec![
                TimeSlot {
                    start_time: 2000000,
                    end_time: 2003600,
                    is_booked: false,
                },
            ];
            contract.set_availability(slots).unwrap();

            let result = contract.mark_slot_booked(accounts.alice, 2000000);
            assert!(result.is_ok());

            let updated_slots = contract.get_available_slots(accounts.alice);
            assert_eq!(updated_slots[0].is_booked, true);
        }
    }
}