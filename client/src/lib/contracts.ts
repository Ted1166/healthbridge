import { Abi } from '@polkadot/api-contract';
import { ApiPromise } from '@polkadot/api';
import { CONTRACT_ADDRESSES } from './polkadot';

// Contract ABI metadata files will be imported here
// After building contracts with `cargo contract build`, copy the .json files from target/ink/

// Type definitions for contract interactions
export interface DoctorProfile {
  name: string;
  specialty: string;
  license_number: string;
  license_ipfs_hash: string;
  consultation_fee: bigint;
  verified: boolean;
  rating: number;
  total_consultations: number;
  completed_consultations: number;
  cancelled_consultations: number;
  no_show_count: number;
}

export interface PatientProfile {
  name_hash: Uint8Array;
  medical_records_ipfs: string;
  emergency_contact_hash: Uint8Array;
  created_at: number;
}

export interface TimeSlot {
  start_time: number;
  end_time: number;
  is_booked: boolean;
}

export interface DoctorStats {
  total_consultations: number;
  completed_consultations: number;
  cancelled_consultations: number;
  no_show_count: number;
  rating: number;
  completion_rate: number;
  verified: boolean;
}

export interface Consultation {
  id: number;
  patient: string;
  doctor: string;
  amount: bigint;
  status: ConsultationStatus;
  scheduled_time: number;
  created_at: number;
  completed_at: number | null;
  notes_ipfs_hash: string | null;
}

export const ConsultationStatus = {
  Pending: 'Pending',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Disputed: 'Disputed',
  Refunded: 'Refunded',
  Released: 'Released',
  Cancelled: 'Cancelled',
  NoShow: 'NoShow',
} as const;

export type ConsultationStatus = typeof ConsultationStatus[keyof typeof ConsultationStatus];

export interface AccessGrant {
  record_hash: Uint8Array;
  granted_to: string;
  granted_by: string;
  access_level: AccessLevel;
  granted_at: number;
  expires_at: number | null;
  revoked: boolean;
}

export const AccessLevel = {
  View: 'View',
  ViewAndComment: 'ViewAndComment',
  Emergency: 'Emergency',
} as const;

export type AccessLevel = typeof AccessLevel[keyof typeof AccessLevel];

export interface AccessLog {
  accessor: string;
  access_level: AccessLevel;
  accessed_at: number;
  action: AccessAction;
}

export const AccessAction = {
  Granted: 'Granted',
  Revoked: 'Revoked',
  Viewed: 'Viewed',
  EmergencyAccess: 'EmergencyAccess',
} as const;

export type AccessAction = typeof AccessAction[keyof typeof AccessAction];

// Helper function to create contract instance
export async function getContractInstance(
  api: ApiPromise,
  address: string,
  abi: any
) {
  const contractAbi = new Abi(abi);
  return { api, address, abi: contractAbi };
}

// Export contract addresses for easy access
export const CONTRACTS = CONTRACT_ADDRESSES;

// Placeholder ABIs - these will be replaced with actual ABIs after contract compilation
// To get the actual ABIs:
// 1. Build your contracts: cargo contract build
// 2. Copy the .json files from contracts/{contract_name}/target/ink/{contract_name}.json
// 3. Import them here

export const HEALTH_REGISTRY_ABI = {
  // Placeholder - will be replaced with actual ABI
  source: {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    language: 'ink! 5.1.1',
    compiler: 'rustc 1.78.0',
  },
  contract: {
    name: 'health_registry',
    version: '0.1.0',
  },
  spec: {
    constructors: [],
    messages: [],
    events: [],
  },
};

export const CONSULTATION_ESCROW_ABI = {
  // Placeholder - will be replaced with actual ABI
  source: {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    language: 'ink! 5.1.1',
    compiler: 'rustc 1.78.0',
  },
  contract: {
    name: 'consultation_escrow',
    version: '0.1.0',
  },
  spec: {
    constructors: [],
    messages: [],
    events: [],
  },
};

export const MEDICAL_RECORDS_ACCESS_ABI = {
  // Placeholder - will be replaced with actual ABI
  source: {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    language: 'ink! 5.1.1',
    compiler: 'rustc 1.78.0',
  },
  contract: {
    name: 'medical_records_access',
    version: '0.1.0',
  },
  spec: {
    constructors: [],
    messages: [],
    events: [],
  },
};

// Helper to convert error responses
export function parseContractError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return 'Unknown contract error';
}