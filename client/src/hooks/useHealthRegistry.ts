import { useState, useCallback } from 'react';
import { ContractPromise } from '@polkadot/api-contract';
import { useWallet } from './useWallet';
import { getSigner } from '@/lib/polkadot';
import {
  CONTRACTS,
  HEALTH_REGISTRY_ABI,
  type DoctorProfile,
  type PatientProfile,
  type TimeSlot,
  type DoctorStats,
  parseContractError,
} from '@/lib/contracts';

export function useHealthRegistry() {
  const { api, selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get contract instance
  const getContract = useCallback(() => {
    if (!api) throw new Error('API not initialized');
    return new ContractPromise(api, HEALTH_REGISTRY_ABI, CONTRACTS.healthRegistry);
  }, [api]);

  // Read-only queries (no gas fees)
  
  /**
   * Get doctor profile
   */
  const getDoctor = useCallback(
    async (doctorAddress: string): Promise<DoctorProfile | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const { result, output } = await contract.query.getDoctor(
          doctorAddress,
          { 
            gasLimit: {
                refTime: 1000000000, 
                proofSize: 1000000 }as any 
            },
          doctorAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as any;
        }
        return null;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get doctor:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [api, getContract]
  );

  /**
   * Get patient profile
   */
  const getPatient = useCallback(
    async (patientAddress: string): Promise<PatientProfile | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const { result, output } = await contract.query.getPatient(
          patientAddress,
          { 
            gasLimit: {
                refTime: 1000000000, 
                proofSize: 1000000 }as any
            },
          patientAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as any;
        }
        return null;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get patient:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [api, getContract]
  );

  /**
   * Check if doctor is verified
   */
  const isDoctorVerified = useCallback(
    async (doctorAddress: string): Promise<boolean> => {
      try {
        const contract = getContract();
        const { result, output } = await contract.query.isDoctorVerified(
          doctorAddress,
          { 
            gasLimit: {
                refTime: 1000000000, 
                proofSize: 1000000 }as any
            },
          doctorAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as boolean;
        }
        return false;
      } catch (err: any) {
        console.error('Failed to check verification:', parseContractError(err));
        return false;
      }
    },
    [api, getContract]
  );

  /**
   * Get doctor statistics
   */
  const getDoctorStats = useCallback(
    async (doctorAddress: string): Promise<DoctorStats | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const { result, output } = await contract.query.getDoctorStats(
          doctorAddress,
          { gasLimit: { refTime: 1000000000, proofSize: 1000000 } as any },
          doctorAddress
        );

        if (result.isOk && output) {
          return output.toHuman() as any;
        }
        return null;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get doctor stats:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [api, getContract]
  );

  /**
   * Get available time slots for a doctor
   */
  const getAvailableSlots = useCallback(
    async (doctorAddress: string): Promise<TimeSlot[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const { result, output } = await contract.query.getAvailableSlots(
          doctorAddress,
          { gasLimit: { refTime: 1000000000, proofSize: 1000000 } as any },
          doctorAddress
        );

        if (result.isOk && output) {
          return (output.toHuman() as any) || [];
        }
        return [];
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get available slots:', errorMsg);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [api, getContract]
  );

  /**
   * Get total number of doctors
   */
  const getTotalDoctors = useCallback(async (): Promise<number> => {
    try {
      const contract = getContract();
      const { result, output } = await contract.query.getTotalDoctors(
        selectedAccount?.address || '',
        { gasLimit: { refTime: 1000000000, proofSize: 1000000 }as any }
      );

      if (result.isOk && output) {
        return parseInt(output.toString());
      }
      return 0;
    } catch (err: any) {
      console.error('Failed to get total doctors:', parseContractError(err));
      return 0;
    }
  }, [api, getContract, selectedAccount]);

  /**
   * Get total number of patients
   */
  const getTotalPatients = useCallback(async (): Promise<number> => {
    try {
      const contract = getContract();
      const { result, output } = await contract.query.getTotalPatients(
        selectedAccount?.address || '',
        { gasLimit: { refTime: 1000000000, proofSize: 1000000 }as any }
      );

      if (result.isOk && output) {
        return parseInt(output.toString());
      }
      return 0;
    } catch (err: any) {
      console.error('Failed to get total patients:', parseContractError(err));
      return 0;
    }
  }, [api, getContract, selectedAccount]);

  // Transactions (require gas and signing)

  /**
   * Register as a doctor
   */
  const registerDoctor = useCallback(
    async (
      name: string,
      specialty: string,
      licenseNumber: string,
      licenseIpfsHash: string,
      consultationFee: bigint
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

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .registerDoctor(
            { gasLimit, storageDepositLimit: null }as any,
            name,
            specialty,
            licenseNumber,
            licenseIpfsHash,
            consultationFee
          )
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Doctor registered successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to register doctor:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Register as a patient
   */
  const registerPatient = useCallback(
    async (
      nameHash: Uint8Array,
      medicalRecordsIpfs: string,
      emergencyContactHash: Uint8Array
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

        const gasLimit = api!.registry.createType('WeightV2', {
          refTime: 3000000000,
          proofSize: 3000000,
        });

        await contract.tx
          .registerPatient(
            { gasLimit, storageDepositLimit: null }as any,
            nameHash,
            medicalRecordsIpfs,
            emergencyContactHash
          )
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Patient registered successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to register patient:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Set doctor availability
   */
  const setAvailability = useCallback(
    async (timeSlots: TimeSlot[]): Promise<boolean> => {
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
          .setAvailability({ gasLimit, storageDepositLimit: null }as any, timeSlots)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Availability set successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to set availability:', errorMsg);
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
    getDoctor,
    getPatient,
    isDoctorVerified,
    getDoctorStats,
    getAvailableSlots,
    getTotalDoctors,
    getTotalPatients,
    
    // Write operations
    registerDoctor,
    registerPatient,
    setAvailability,
  };
}