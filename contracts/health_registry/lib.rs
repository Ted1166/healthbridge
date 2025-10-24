#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod health_registry {
    use ink::prelude::string::String;  
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct HealthRegistry {
        owner: AccountId,
        doctors: Mapping<AccountId, DoctorProfile>,
        patients: Mapping<AccountId, PatientProfile>,
        verified_doctors: Mapping<AccountId, bool>,
        total_doctors: u32,
        total_patients: u32,
    }

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
        pub rating: u8,  // 0-100
        pub total_consultations: u32,
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct PatientProfile {
        pub name_hash: [u8; 32],  
        pub medical_records_ipfs: String,
        pub emergency_contact_hash: [u8; 32],
        pub created_at: u64,
    }

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

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        NotOwner,
        DoctorAlreadyRegistered,
        PatientAlreadyRegistered,
        DoctorNotFound,
        PatientNotFound,
        OverflowError,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for HealthRegistry {
        fn default() -> Self {
            Self::new()
        }
    }

    impl HealthRegistry {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                doctors: Mapping::default(),
                patients: Mapping::default(),
                verified_doctors: Mapping::default(),
                total_doctors: 0,
                total_patients: 0,
            }
        }

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
            };

            self.doctors.insert(caller, &profile);
            
            self.total_doctors = self.total_doctors
                .checked_add(1)
                .ok_or(Error::OverflowError)?;

            self.env().emit_event(DoctorRegistered {
                doctor: caller,
                specialty,
            });

            Ok(())
        }

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
                .ok_or(Error::OverflowError)?;

            self.env().emit_event(PatientRegistered {
                patient: caller,
            });

            Ok(())
        }

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
        pub fn get_doctor(&self, doctor: AccountId) -> Option<DoctorProfile> {
            self.doctors.get(doctor)
        }

        #[ink(message)]
        pub fn get_patient(&self, patient: AccountId) -> Option<PatientProfile> {
            self.patients.get(patient)
        }

        #[ink(message)]
        pub fn is_doctor_verified(&self, doctor: AccountId) -> bool {
            self.verified_doctors.get(doctor).unwrap_or(false)
        }

        #[ink(message)]
        pub fn get_total_doctors(&self) -> u32 {
            self.total_doctors
        }

        #[ink(message)]
        pub fn get_total_patients(&self) -> u32 {
            self.total_patients
        }

        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        #[ink(message)]
        pub fn update_doctor_rating(&mut self, doctor: AccountId, new_rating: u8) -> Result<()> {
            let mut profile = self.doctors.get(doctor).ok_or(Error::DoctorNotFound)?;
            profile.rating = new_rating;
            
            profile.total_consultations = profile.total_consultations
                .checked_add(1)
                .ok_or(Error::OverflowError)?;
            
            self.doctors.insert(doctor, &profile);
            Ok(())
        }
    }

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
        fn default_works() {
            let contract = HealthRegistry::default();
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
        fn register_patient_works() {
            let mut contract = HealthRegistry::new();
            let name_hash = [1u8; 32];
            let emergency_hash = [2u8; 32];
            
            let result = contract.register_patient(
                name_hash,
                "QmPatientRecords".to_string(),
                emergency_hash,
            );
            assert!(result.is_ok());
            assert_eq!(contract.get_total_patients(), 1);
        }

        #[ink::test]
        fn verify_doctor_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = HealthRegistry::new();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            
            contract.register_doctor(
                "Dr. Test".to_string(),
                "Cardiology".to_string(),
                "LIC999".to_string(),
                "QmHash".to_string(),
                500000000000,
            ).unwrap();
            
            let result = contract.verify_doctor(accounts.alice);
            assert!(result.is_ok());
            assert!(contract.is_doctor_verified(accounts.alice));
        }

        #[ink::test]
        fn duplicate_registration_fails() {
            let mut contract = HealthRegistry::new();
            
            contract.register_doctor(
                "Dr. Test".to_string(),
                "Cardiology".to_string(),
                "LIC999".to_string(),
                "QmHash".to_string(),
                500000000000,
            ).unwrap();
            
            let result = contract.register_doctor(
                "Dr. Test2".to_string(),
                "Cardiology".to_string(),
                "LIC998".to_string(),
                "QmHash2".to_string(),
                600000000000,
            );
            assert_eq!(result, Err(Error::DoctorAlreadyRegistered));
        }
    }
}