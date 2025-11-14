import { useState, useCallback } from 'react';
import { ContractPromise } from '@polkadot/api-contract';
import { useWallet } from './useWallet';
import { getSigner } from '@/lib/polkadot';
import {
  CONTRACTS,
  CONSULTATION_ESCROW_ABI,
  type Consultation,
  ConsultationStatus,
  parseContractError,
} from '@/lib/contracts';

export function useConsultationEscrow() {
  const { api, selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get contract instance
  const getContract = useCallback(() => {
    if (!api) throw new Error('API not initialized');
    return new ContractPromise(api, CONSULTATION_ESCROW_ABI, CONTRACTS.consultationEscrow);
  }, [api]);

  // Read-only queries

  /**
   * Get consultation details
   */
  const getConsultation = useCallback(
    async (consultationId: number): Promise<Consultation | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = getContract();
        const { result, output } = await contract.query.getConsultation(
          selectedAccount?.address || '',
          { gasLimit: { refTime: 1000000000, proofSize: 1000000 }as any },
          consultationId
        );

        if (result.isOk && output) {
          return output.toHuman() as any;
        }
        return null;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to get consultation:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Get platform fee percentage
   */
  const getPlatformFeePercent = useCallback(async (): Promise<number> => {
    try {
      const contract = getContract();
      const { result, output } = await contract.query.getPlatformFeePercent(
        selectedAccount?.address || '',
        { gasLimit: { refTime: 1000000000, proofSize: 1000000 }as any }
      );

      if (result.isOk && output) {
        return parseInt(output.toString());
      }
      return 3; // Default 3%
    } catch (err: any) {
      console.error('Failed to get platform fee:', parseContractError(err));
      return 3;
    }
  }, [api, selectedAccount, getContract]);

  // Transactions

  /**
   * Book a consultation (requires payment)
   */
  const bookConsultation = useCallback(
    async (doctorAddress: string, scheduledTime: number, amount: bigint): Promise<number | null> => {
      if (!selectedAccount) {
        setError('No account selected');
        return null;
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

        let consultationId: number | null = null;

        await contract.tx
          .bookConsultation(
            { gasLimit, storageDepositLimit: null, value: amount }as any,
            doctorAddress,
            scheduledTime
          )
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              // Extract consultation ID from events
              result.events.forEach(({ event }) => {
                if (event.method === 'ConsultationBooked') {
                  consultationId = parseInt(event.data[0].toString());
                }
              });
              
              console.log('✅ Consultation booked successfully, ID:', consultationId);
              setIsLoading(false);
            }
          });

        return consultationId;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to book consultation:', errorMsg);
        setIsLoading(false);
        return null;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Start a consultation (doctor only)
   */
  const startConsultation = useCallback(
    async (consultationId: number): Promise<boolean> => {
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
          .startConsultation({ gasLimit, storageDepositLimit: null }as any, consultationId)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Consultation started successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to start consultation:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Mark consultation as completed (doctor only)
   */
  const markCompleted = useCallback(
    async (consultationId: number, notesIpfsHash: string): Promise<boolean> => {
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
          .markCompleted({ gasLimit, storageDepositLimit: null }as any, consultationId, notesIpfsHash)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Consultation marked as completed');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to mark completed:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Release payment to doctor
   */
  const releasePayment = useCallback(
    async (consultationId: number): Promise<boolean> => {
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
          .releasePayment({ gasLimit, storageDepositLimit: null }as any, consultationId)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Payment released successfully');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to release payment:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Dispute a consultation (patient only)
   */
  const disputeConsultation = useCallback(
    async (consultationId: number): Promise<boolean> => {
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
          .disputeConsultation({ gasLimit, storageDepositLimit: null }as any, consultationId)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Consultation disputed');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to dispute consultation:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Cancel a consultation
   */
  const cancelConsultation = useCallback(
    async (consultationId: number): Promise<boolean> => {
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
          .cancelConsultation({ gasLimit, storageDepositLimit: null }as any, consultationId)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ Consultation cancelled');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to cancel consultation:', errorMsg);
        setIsLoading(false);
        return false;
      }
    },
    [api, selectedAccount, getContract]
  );

  /**
   * Report doctor no-show (patient only)
   */
  const reportNoShow = useCallback(
    async (consultationId: number): Promise<boolean> => {
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
          .reportNoShow({ gasLimit, storageDepositLimit: null }as any, consultationId)
          .signAndSend(selectedAccount.address, { signer }, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
              console.log('✅ No-show reported');
              setIsLoading(false);
            }
          });

        return true;
      } catch (err: any) {
        const errorMsg = parseContractError(err);
        setError(errorMsg);
        console.error('Failed to report no-show:', errorMsg);
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
    getConsultation,
    getPlatformFeePercent,
    
    // Write operations
    bookConsultation,
    startConsultation,
    markCompleted,
    releasePayment,
    disputeConsultation,
    cancelConsultation,
    reportNoShow,
  };
}