#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod medical_records_access {
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct MedicalRecordsAccess {
        record_owners: Mapping<Hash, AccountId>,
        access_grants: Mapping<(Hash, AccountId), AccessGrant>,
        emergency_contacts: Mapping<AccountId, EmergencyContactList>,
        owner: AccountId,
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct AccessGrant {
        pub record_hash: Hash,
        pub granted_to: AccountId,
        pub granted_by: AccountId,
        pub access_level: AccessLevel,
        pub granted_at: u64,
        pub expires_at: Option<u64>,
        pub revoked: bool,
    }

    #[derive(Debug, Clone, PartialEq, Eq, Default)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct EmergencyContactList {
        pub contacts: [Option<AccountId>; 3],
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum AccessLevel {
        View,           // Can only view
        ViewAndComment, // Can view and add notes
        Emergency,      // Emergency contact override
    }

    #[ink(event)]
    pub struct RecordRegistered {
        #[ink(topic)]
        record_hash: Hash,
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct AccessGranted {
        #[ink(topic)]
        record_hash: Hash,
        #[ink(topic)]
        granted_to: AccountId,
        access_level: AccessLevel,
    }

    #[ink(event)]
    pub struct AccessRevoked {
        #[ink(topic)]
        record_hash: Hash,
        #[ink(topic)]
        revoked_from: AccountId,
    }

    #[ink(event)]
    pub struct EmergencyAccessUsed {
        #[ink(topic)]
        record_hash: Hash,
        #[ink(topic)]
        emergency_contact: AccountId,
        #[ink(topic)]
        patient: AccountId,
    }

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        Unauthorized,
        RecordNotFound,
        AccessExpired,
        AccessRevoked,
        NoAccess,
        RecordAlreadyRegistered,
        NotEmergencyContact,
        EmergencyContactListFull,
        OverflowError,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for MedicalRecordsAccess {
        fn default() -> Self {
            Self::new()
        }
    }

    impl MedicalRecordsAccess {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                record_owners: Mapping::default(),
                access_grants: Mapping::default(),
                emergency_contacts: Mapping::default(),
                owner: Self::env().caller(),
            }
        }

        #[ink(message)]
        pub fn register_record(&mut self, record_hash: Hash) -> Result<()> {
            let caller = self.env().caller();

            if self.record_owners.contains(record_hash) {
                return Err(Error::RecordAlreadyRegistered);
            }

            self.record_owners.insert(record_hash, &caller);

            self.env().emit_event(RecordRegistered {
                record_hash,
                owner: caller,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn grant_access(
            &mut self,
            record_hash: Hash,
            granted_to: AccountId,
            access_level: AccessLevel,
            expires_at: Option<u64>,
        ) -> Result<()> {
            let caller = self.env().caller();

            let owner = self.record_owners.get(record_hash).ok_or(Error::RecordNotFound)?;
            if owner != caller {
                return Err(Error::Unauthorized);
            }

            let grant = AccessGrant {
                record_hash,
                granted_to,
                granted_by: caller,
                access_level,
                granted_at: self.env().block_timestamp(),
                expires_at,
                revoked: false,
            };

            self.access_grants.insert((record_hash, granted_to), &grant);

            self.env().emit_event(AccessGranted {
                record_hash,
                granted_to,
                access_level,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn revoke_access(
            &mut self,
            record_hash: Hash,
            revoke_from: AccountId,
        ) -> Result<()> {
            let caller = self.env().caller();

            let owner = self.record_owners.get(record_hash).ok_or(Error::RecordNotFound)?;
            if owner != caller {
                return Err(Error::Unauthorized);
            }

            let mut grant = self.access_grants
                .get((record_hash, revoke_from))
                .ok_or(Error::NoAccess)?;

            grant.revoked = true;
            self.access_grants.insert((record_hash, revoke_from), &grant);

            self.env().emit_event(AccessRevoked {
                record_hash,
                revoked_from: revoke_from,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn check_access(
            &self,
            record_hash: Hash,
            accessor: AccountId,
        ) -> bool {
            if let Some(owner) = self.record_owners.get(record_hash) {
                if owner == accessor {
                    return true;
                }
            }

            if let Some(grant) = self.access_grants.get((record_hash, accessor)) {
                if grant.revoked {
                    return false;
                }

                if let Some(expires_at) = grant.expires_at {
                    let current_time = self.env().block_timestamp();
                    if current_time > expires_at {
                        return false;
                    }
                }

                return true;
            }

            false
        }

        #[ink(message)]
        pub fn get_access_grant(
            &self,
            record_hash: Hash,
            accessor: AccountId,
        ) -> Option<AccessGrant> {
            self.access_grants.get((record_hash, accessor))
        }

        #[ink(message)]
        pub fn add_emergency_contact(&mut self, contact: AccountId) -> Result<()> {
            let caller = self.env().caller();
            
            let mut contact_list = self.emergency_contacts
                .get(caller)
                .unwrap_or_default();

            for slot in contact_list.contacts.iter_mut() {
                if slot.is_none() {
                    *slot = Some(contact);
                    self.emergency_contacts.insert(caller, &contact_list);
                    return Ok(());
                }
            }

            Err(Error::EmergencyContactListFull)
        }

        #[ink(message)]
        pub fn remove_emergency_contact(&mut self, contact: AccountId) -> Result<()> {
            let caller = self.env().caller();
            
            let mut contact_list = self.emergency_contacts
                .get(caller)
                .unwrap_or_default();

            for slot in contact_list.contacts.iter_mut() {
                if *slot == Some(contact) {
                    *slot = None;
                    self.emergency_contacts.insert(caller, &contact_list);
                    return Ok(());
                }
            }

            Ok(())
        }

        #[ink(message)]
        pub fn emergency_access(
            &mut self,
            patient: AccountId,
            record_hash: Hash,
        ) -> Result<bool> {
            let caller = self.env().caller();

            let owner = self.record_owners.get(record_hash).ok_or(Error::RecordNotFound)?;
            if owner != patient {
                return Err(Error::Unauthorized);
            }

            let contact_list = self.emergency_contacts
                .get(patient)
                .unwrap_or_default();

            let is_emergency_contact = contact_list.contacts
                .iter()
                .any(|&contact| contact == Some(caller));

            if !is_emergency_contact {
                return Err(Error::NotEmergencyContact);
            }

            let current_time = self.env().block_timestamp();
            let expiry = current_time
                .checked_add(24 * 60 * 60 * 1000) // 24 hours in milliseconds
                .ok_or(Error::OverflowError)?;

            let grant = AccessGrant {
                record_hash,
                granted_to: caller,
                granted_by: patient,
                access_level: AccessLevel::Emergency,
                granted_at: current_time,
                expires_at: Some(expiry),
                revoked: false,
            };

            self.access_grants.insert((record_hash, caller), &grant);

            self.env().emit_event(EmergencyAccessUsed {
                record_hash,
                emergency_contact: caller,
                patient,
            });

            Ok(true)
        }

        #[ink(message)]
        pub fn get_emergency_contacts(&self, patient: AccountId) -> EmergencyContactList {
            self.emergency_contacts.get(patient).unwrap_or_default()
        }

        #[ink(message)]
        pub fn is_emergency_contact(
            &self,
            patient: AccountId,
            contact: AccountId,
        ) -> bool {
            let contact_list = self.emergency_contacts.get(patient).unwrap_or_default();
            contact_list.contacts.iter().any(|&c| c == Some(contact))
        }

        #[ink(message)]
        pub fn get_record_owner(&self, record_hash: Hash) -> Option<AccountId> {
            self.record_owners.get(record_hash)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        fn create_test_hash(value: u8) -> Hash {
            Hash::from([value; 32])
        }

        #[ink::test]
        fn new_works() {
            let contract = MedicalRecordsAccess::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            assert_eq!(contract.owner, accounts.alice);
        }

        #[ink::test]
        fn register_record_works() {
            let mut contract = MedicalRecordsAccess::new();
            let record_hash = create_test_hash(1);
            
            let result = contract.register_record(record_hash);
            assert!(result.is_ok());
            
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            assert_eq!(contract.get_record_owner(record_hash), Some(accounts.alice));
        }

        #[ink::test]
        fn grant_and_check_access_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = MedicalRecordsAccess::new();
            let record_hash = create_test_hash(1);
            
            contract.register_record(record_hash).unwrap();
            
            let result = contract.grant_access(
                record_hash,
                accounts.bob,
                AccessLevel::View,
                None,
            );
            assert!(result.is_ok());
            
            assert!(contract.check_access(record_hash, accounts.bob));
            assert!(!contract.check_access(record_hash, accounts.charlie));
        }

        #[ink::test]
        fn revoke_access_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = MedicalRecordsAccess::new();
            let record_hash = create_test_hash(1);
            
            contract.register_record(record_hash).unwrap();
            contract.grant_access(
                record_hash,
                accounts.bob,
                AccessLevel::View,
                None,
            ).unwrap();
            
            assert!(contract.check_access(record_hash, accounts.bob));
            
            contract.revoke_access(record_hash, accounts.bob).unwrap();
            
            assert!(!contract.check_access(record_hash, accounts.bob));
        }

        #[ink::test]
        fn emergency_contact_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = MedicalRecordsAccess::new();
            
            let result = contract.add_emergency_contact(accounts.bob);
            assert!(result.is_ok());
            
            assert!(contract.is_emergency_contact(accounts.alice, accounts.bob));
            assert!(!contract.is_emergency_contact(accounts.alice, accounts.charlie));
        }

        #[ink::test]
        fn emergency_access_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = MedicalRecordsAccess::new();
            let record_hash = create_test_hash(1);
            
            contract.register_record(record_hash).unwrap();
            contract.add_emergency_contact(accounts.bob).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result = contract.emergency_access(accounts.alice, record_hash);
            assert!(result.is_ok());
            
            assert!(contract.check_access(record_hash, accounts.bob));
        }

        #[ink::test]
        fn unauthorized_access_fails() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = MedicalRecordsAccess::new();
            let record_hash = create_test_hash(1);
            
            contract.register_record(record_hash).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            let result = contract.grant_access(
                record_hash,
                accounts.bob,
                AccessLevel::View,
                None,
            );
            assert_eq!(result, Err(Error::Unauthorized));
        }

        #[ink::test]
        fn expired_access_fails() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = MedicalRecordsAccess::new();
            let record_hash = create_test_hash(1);
            
            contract.register_record(record_hash).unwrap();
            
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(1000000);
            
            contract.grant_access(
                record_hash,
                accounts.bob,
                AccessLevel::View,
                Some(500000), 
            ).unwrap();
            
            assert!(!contract.check_access(record_hash, accounts.bob));
        }
    }
}