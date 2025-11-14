import { useState, useCallback } from 'react';
import { ContractPromise } from '@polkadot/api-contract';
import { useWallet } from './useWallet';
import { getSigner } from '@/lib/polkadot';
import {
  CONTRACTS,
  MEDICAL_RECORDS_ACCESS_ABI,
  type AccessGrant,
  AccessLevel,
  type AccessLog,
  parseContractError,
} from '@/lib/contracts';

export function useMedicalRecords() {
  const { api, selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get contract instance
  const getContract = useCallback(() => {
    if (!api) throw new Error('API not initialized');
    return new ContractPromise(api, MEDICAL_RECORDS_ACCESS_ABI, CONTRACTS.medicalRecordsAccess);
  }, [api]);

  // Read-only queries

  /**
   * Check if an accessor has access to a record
   */
  const checkAccess = useCallback(
    async (recordHash: string, accessorAddress: string): Promise<boolean> => {
      try {
        const contract = getContract();
        
        // Convert hex string to bytes array
        const hashBytes = api!.createType('Hash', recordHash);

        const { result, output } = await contract.query.checkAccess(
          selectedAccount?.address || '',
          { 
            gasLimit: {
                refTime: 1000000000,
                proofSize: 1000000
            } as any
        },
          hashBytes,
          accessorAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as boolean;
        }
        return false;
      } catch (err: any) {
        console.error('Failed to check access:', parseContractError(err));
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Get access grant details
   */
  const getAccessGrant = useCallback(
    async (recordHash: string, accessorAddress: string): Promise<AccessGrant | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const hashBytes = api!.createType('Hash', recordHash);

        const { result, output } = await contract.query.getAccessGrant(
          selectedAccount?.address || '',
          { 
            gasLimit: {
                refTime: 1000000000,
                proofSize: 1000000
            } as any
           },
          hashBytes,
          accessorAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as any;
        }
        return null;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get access grant:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Get record owner
   */
  const getRecordOwner = useCallback(
    async (recordHash: string): Promise<string | null> => {
      try {
        const contract = getContract();
        const hashBytes = api!.createType('Hash', recordHash);

        const { result, output } = await contract.query.getRecordOwner(
          selectedAccount?.address || '',
          { 
            gasLimit: { 
                refTime: 1000000000, 
                proofSize: 1000000 
            } as any
         },
          hashBytes
        );

        if (result.isOk && output) {
          return output.toString();
        }
        return null;
      } catch (err: any) {
        console.error('Failed to get record owner:', parseContractError(err));
        return null;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Get access history for a record
   */
  const getAccessHistory = useCallback(
    async (recordHash: string): Promise<AccessLog[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const hashBytes = api!.createType('Hash', recordHash);

        const { result, output } = await contract.query.getAccessHistory(
          selectedAccount?.address || '',
          { 
          gasLimit: 
          { refTime: 1000000000, 
          proofSize: 1000000 
          }as any
          },
          hashBytes
        );

        if (result.isOk && output) {
          return (output.toHuman() as any) || [];
        }
        return [];
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get access history:', errorMsg);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Get emergency contacts
   */
  const getEmergencyContacts = useCallback(
    async (patientAddress: string): Promise<string[]> => {
      try {
        const contract = getContract();

        const { result, output } = await contract.query.getEmergencyContacts(
          selectedAccount?.address || '',
          { 
          gasLimit: {
           refTime: 1000000000, 
           proofSize: 1000000 
           } as any 
           },
          patientAddress
        );

        if (result.isOk && output) {
          const contacts = output.toHuman() as any;
          return contacts?.contacts?.filter((c: any) => c !== null) || [];
        }
        return [];
      } catch (err: any) {
        console.error('Failed to get emergency contacts:', parseContractError(err));
        return [];
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Check if someone is an emergency contact
   */
  const isEmergencyContact = useCallback(
    async (patientAddress: string, contactAddress: string): Promise<boolean> => {
      try {
        const contract = getContract();

        const { result, output } = await contract.query.isEmergencyContact(
          selectedAccount?.address || '',
          {
           gasLimit: {
            refTime: 1000000000, 
            proofSize: 1000000 
            } as any
        },
          patientAddress,
          contactAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as boolean;
        }
        return false;
      } catch (err: any) {
        console.error('Failed to check emergency contact:', parseContractError(err));
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  // Transactions

  /**
   * Register a new medical record
   */
  const registerRecord = useCallback(
    async (recordHash: string): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);
        const hashBytes = api!.createType('Hash', recordHash);

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .registerRecord({ gasLimit, storageDepositLimit: null }as any, hashBytes)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Record registered successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to register record:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Grant access to a record
   */
  const grantAccess = useCallback(
    async (
      recordHash: string,
      grantedTo: string,
      accessLevel: AccessLevel,
      expiresAt?: number
    ): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);
        const hashBytes = api!.createType('Hash', recordHash);

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .grantAccess(
            { gasLimit, storageDepositLimit: null }as any,
            hashBytes,
            grantedTo,
            accessLevel,
            expiresAt ? { Some: expiresAt } : { None: null }
          )
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Access granted successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to grant access:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Grant access to multiple records at once
   */
  const grantAccessBulk = useCallback(
    async (
      recordHashes: string[],
      grantedTo: string,
      accessLevel: AccessLevel,
      expiresAt?: number
    ): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);
        const hashesBytes = recordHashes.map(hash => api!.createType('Hash', hash));

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .grantAccessBulk(
            { gasLimit, storageDepositLimit: null }as any,
            hashesBytes,
            grantedTo,
            accessLevel,
            expiresAt ? { Some: expiresAt } : { None: null }
          )
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Bulk access granted successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to grant bulk access:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Revoke access to a record
   */
  const revokeAccess = useCallback(
    async (recordHash: string, revokeFrom: string): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);
        const hashBytes = api!.createType('Hash', recordHash);

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .revokeAccess({ gasLimit, storageDepositLimit: null }as any, hashBytes, revokeFrom)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Access revoked successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to revoke access:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Add emergency contact
   */
  const addEmergencyContact = useCallback(
    async (contactAddress: string): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .addEmergencyContact({ gasLimit, storageDepositLimit: null }as any, contactAddress)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Emergency contact added successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to add emergency contact:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Remove emergency contact
   */
  const removeEmergencyContact = useCallback(
    async (contactAddress: string): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .removeEmergencyContact({ gasLimit, storageDepositLimit: null }as any, contactAddress)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Emergency contact removed successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to remove emergency contact:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Use emergency access
   */
  const emergencyAccess = useCallback(
    async (patientAddress: string, recordHash: string): Promise<boolean> => {
      if (!selectedAccount) {
        setError('No account selected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const signer = await getSigner(selectedAccount.address);
        const hashBytes = api!.createType('Hash', recordHash);

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .emergencyAccess({ gasLimit, storageDepositLimit: null }as any, patientAddress, hashBytes)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Emergency access granted');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to use emergency access:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  return {
    // State
    isLoading,
    error,
    
    // Read operations
    checkAccess,
    getAccessGrant,
    getRecordOwner,
    getAccessHistory,
    getEmergencyContacts,
    isEmergencyContact,
    
    // Write operations
    registerRecord,
    grantAccess,
    grantAccessBulk,
    revokeAccess,
    addEmergencyContact,
    removeEmergencyContact,
    emergencyAccess,
  };
}