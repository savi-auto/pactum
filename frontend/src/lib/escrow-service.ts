/**
 * Pactum Escrow Service
 * 
 * Handles all interactions with the escrow smart contracts
 * using @stacks/connect for wallet transactions and
 * @stacks/transactions for read-only calls.
 */

import { request } from "@stacks/connect";
import type { TransactionResult } from "@stacks/connect/dist/types/methods";
import { 
  Cl, 
  Pc,
  fetchCallReadOnlyFunction,
  cvToValue,
  ClarityValue,
} from "@stacks/transactions";

// Type helper for contract principal format
type ContractPrincipal = `${string}.${string}`;
import { 
  CONTRACTS, 
  NETWORK_CONFIG, 
  ESCROW_FUNCTIONS,
  ERROR_CODES,
  type Escrow,
  type EscrowStatus,
  parseContractPrincipal,
  stxToMicro,
} from "./contracts";

type Network = "mainnet" | "testnet";

/**
 * Parse Clarity escrow response to TypeScript object
 */
function parseEscrowResponse(data: Record<string, unknown>, escrowId: number): Escrow {
  return {
    id: escrowId,
    client: String(data.client || ""),
    freelancer: String(data.freelancer || ""),
    amount: BigInt(data.amount as number || 0),
    status: (data.status as EscrowStatus) || "created",
    invoiceHash: data["invoice-hash"] ? String(data["invoice-hash"]) : null,
    createdAt: Number(data["created-at"] || 0),
    fundedAt: data["funded-at"] ? Number(data["funded-at"]) : null,
    deliveredAt: data["delivered-at"] ? Number(data["delivered-at"]) : null,
    reviewDeadline: data["review-deadline"] ? Number(data["review-deadline"]) : null,
    completedAt: data["completed-at"] ? Number(data["completed-at"]) : null,
  };
}

/**
 * Get human-readable error message from contract error code
 */
export function getErrorMessage(errorCode: number): string {
  return ERROR_CODES[errorCode] || `Unknown error (code: ${errorCode})`;
}

/**
 * Create a new escrow agreement
 */
export async function createEscrow(
  freelancerAddress: string,
  amountStx: number,
  invoiceHash: string | null,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;
  
  const functionArgs = [
    Cl.principal(freelancerAddress),
    Cl.uint(stxToMicro(amountStx)),
    invoiceHash ? Cl.some(Cl.buffer(Buffer.from(invoiceHash, 'hex'))) : Cl.none(),
  ];

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.createEscrow,
    functionArgs,
    network,
  });

  return result;
}

/**
 * Fund an existing escrow (transfers STX to contract)
 */
export async function fundEscrow(
  escrowId: number,
  amount: bigint,
  senderAddress: string,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;
  const { address: contractAddress } = parseContractPrincipal(contract);

  // Post condition: sender will send exactly the escrow amount
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(amount)
    .ustx();

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.fundEscrow,
    functionArgs: [Cl.uint(escrowId)],
    network,
    postConditions: [postCondition],
    postConditionMode: "deny",
  });

  return result;
}

/**
 * Cancel an unfunded escrow
 */
export async function cancelEscrow(
  escrowId: number,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.cancelEscrow,
    functionArgs: [Cl.uint(escrowId)],
    network,
  });

  return result;
}

/**
 * Mark work as delivered (freelancer action)
 */
export async function markDelivered(
  escrowId: number,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.markDelivered,
    functionArgs: [Cl.uint(escrowId)],
    network,
  });

  return result;
}

/**
 * Release payment to freelancer (client action or auto after deadline)
 */
export async function releasePayment(
  escrowId: number,
  amount: bigint,
  freelancerAddress: string,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;
  const { address: contractAddress } = parseContractPrincipal(contract);

  // Post condition: freelancer will receive the payment
  const postCondition = Pc.principal(contractAddress)
    .willSendEq(amount)
    .ustx();

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.releasePayment,
    functionArgs: [Cl.uint(escrowId)],
    network,
    postConditions: [postCondition],
    postConditionMode: "deny",
  });

  return result;
}

/**
 * Request revision (client action during review period)
 */
export async function requestRevision(
  escrowId: number,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.requestRevision,
    functionArgs: [Cl.uint(escrowId)],
    network,
  });

  return result;
}

/**
 * Initiate dispute (either party)
 */
export async function initiateDispute(
  escrowId: number,
  network: Network
): Promise<TransactionResult> {
  const contract = CONTRACTS[network].escrowLogic as ContractPrincipal;

  const result = await request("stx_callContract", {
    contract,
    functionName: ESCROW_FUNCTIONS.initiateDispute,
    functionArgs: [Cl.uint(escrowId)],
    network,
  });

  return result;
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get escrow details by ID
 */
export async function getEscrow(
  escrowId: number,
  senderAddress: string,
  network: Network
): Promise<Escrow | null> {
  const { address: contractAddress, name: contractName } = parseContractPrincipal(
    CONTRACTS[network].escrowLogic
  );

  try {
    const response = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: ESCROW_FUNCTIONS.getEscrow,
      functionArgs: [Cl.uint(escrowId)],
      senderAddress,
      network,
    });

    const value = cvToValue(response);
    if (value === null) return null;
    
    return parseEscrowResponse(value as Record<string, unknown>, escrowId);
  } catch (error) {
    console.error("Failed to fetch escrow:", error);
    return null;
  }
}

/**
 * Get total escrow count
 */
export async function getEscrowCount(
  senderAddress: string,
  network: Network
): Promise<number> {
  const { address: contractAddress, name: contractName } = parseContractPrincipal(
    CONTRACTS[network].escrowLogic
  );

  try {
    const response = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: ESCROW_FUNCTIONS.getEscrowCount,
      functionArgs: [],
      senderAddress,
      network,
    });

    return Number(cvToValue(response)) || 0;
  } catch (error) {
    console.error("Failed to fetch escrow count:", error);
    return 0;
  }
}

/**
 * Check if review period has expired
 */
export async function isReviewPeriodExpired(
  escrowId: number,
  senderAddress: string,
  network: Network
): Promise<boolean> {
  const { address: contractAddress, name: contractName } = parseContractPrincipal(
    CONTRACTS[network].escrowLogic
  );

  try {
    const response = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: ESCROW_FUNCTIONS.isReviewPeriodExpired,
      functionArgs: [Cl.uint(escrowId)],
      senderAddress,
      network,
    });

    return Boolean(cvToValue(response));
  } catch (error) {
    console.error("Failed to check review period:", error);
    return false;
  }
}

/**
 * Fetch multiple escrows by iterating through IDs
 */
export async function fetchEscrows(
  senderAddress: string,
  network: Network,
  limit: number = 50
): Promise<Escrow[]> {
  const count = await getEscrowCount(senderAddress, network);
  const escrows: Escrow[] = [];

  // Fetch in reverse order (newest first)
  const startId = Math.max(0, count - 1);
  const endId = Math.max(0, count - limit);

  for (let id = startId; id >= endId; id--) {
    const escrow = await getEscrow(id, senderAddress, network);
    if (escrow) {
      escrows.push(escrow);
    }
  }

  return escrows;
}

/**
 * Fetch escrows where user is client or freelancer
 */
export async function fetchUserEscrows(
  userAddress: string,
  network: Network,
  limit: number = 50
): Promise<Escrow[]> {
  const allEscrows = await fetchEscrows(userAddress, network, limit * 2);
  
  return allEscrows.filter(
    escrow => escrow.client === userAddress || escrow.freelancer === userAddress
  ).slice(0, limit);
}

/**
 * Build explorer URL for transaction
 */
export function getExplorerTxUrl(txId: string, network: Network): string {
  const baseUrl = NETWORK_CONFIG[network].explorerUrl;
  const chain = NETWORK_CONFIG[network].chain;
  return `${baseUrl}/txid/${txId}?chain=${chain}`;
}

/**
 * Build explorer URL for address
 */
export function getExplorerAddressUrl(address: string, network: Network): string {
  const baseUrl = NETWORK_CONFIG[network].explorerUrl;
  const chain = NETWORK_CONFIG[network].chain;
  return `${baseUrl}/address/${address}?chain=${chain}`;
}
