/**
 * Pactum Contract Configuration
 * 
 * Contains contract addresses and network configuration
 * for interacting with deployed Pactum escrow contracts.
 */

// Deployed contract addresses on testnet
export const CONTRACTS = {
  testnet: {
    deployer: 'ST3JADYQG02X9T85SWGWBKQ8Q2DKF075M9KZ7EEV1',
    escrowLogic: 'ST3JADYQG02X9T85SWGWBKQ8Q2DKF075M9KZ7EEV1.escrow-logic',
    escrowStorage: 'ST3JADYQG02X9T85SWGWBKQ8Q2DKF075M9KZ7EEV1.escrow-storage',
  },
  mainnet: {
    // Update these when deploying to mainnet
    deployer: '',
    escrowLogic: '',
    escrowStorage: '',
  },
} as const;

// Network API endpoints
export const NETWORK_CONFIG = {
  testnet: {
    apiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    chain: 'testnet',
  },
  mainnet: {
    apiUrl: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    chain: 'mainnet',
  },
} as const;

// Contract function names
export const ESCROW_FUNCTIONS = {
  // Write functions (require wallet signature)
  createEscrow: 'create-escrow',
  fundEscrow: 'fund-escrow',
  cancelEscrow: 'cancel-escrow',
  markDelivered: 'mark-delivered',
  releasePayment: 'release-payment',
  requestRevision: 'request-revision',
  initiateDispute: 'initiate-dispute',
  resolveDispute: 'resolve-dispute',
  
  // Read-only functions
  getEscrow: 'get-escrow',
  getEscrowCount: 'get-escrow-count',
  isReviewPeriodExpired: 'is-review-period-expired',
  getTreasury: 'get-treasury',
} as const;

// Error code mappings
export const ERROR_CODES: Record<number, string> = {
  200: 'Unauthorized action',
  201: 'Escrow not found',
  202: 'Escrow already funded',
  203: 'Escrow not funded',
  204: 'Work not delivered',
  205: 'Review period expired',
  206: 'Invalid amount',
  207: 'Escrow already completed',
  208: 'Escrow already disputed',
  209: 'Invalid escrow status',
  210: 'Cannot create escrow with yourself',
  211: 'Review period still active',
};

// Escrow status types
export type EscrowStatus = 
  | 'created' 
  | 'funded' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

// Escrow data structure (matches contract response)
export interface Escrow {
  id: number;
  client: string;
  freelancer: string;
  amount: bigint;
  status: EscrowStatus;
  invoiceHash: string | null;
  createdAt: number;
  fundedAt: number | null;
  deliveredAt: number | null;
  reviewDeadline: number | null;
  completedAt: number | null;
}

// Helper to get contract address based on network
export function getContractAddress(network: 'testnet' | 'mainnet') {
  return CONTRACTS[network].escrowLogic;
}

// Helper to parse contract principal
export function parseContractPrincipal(fullAddress: string) {
  const [address, name] = fullAddress.split('.');
  return { address, name };
}

// Convert microSTX to STX
export function microToStx(microStx: bigint | number): number {
  return Number(microStx) / 1_000_000;
}

// Convert STX to microSTX
export function stxToMicro(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000));
}
