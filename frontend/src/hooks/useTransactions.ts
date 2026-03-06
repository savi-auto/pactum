import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import { NETWORK_CONFIG } from "@/lib/contracts";

export type TransactionType = "sent" | "received" | "contract_call" | "token_transfer";
export type TransactionStatus = "pending" | "success" | "failed";

export interface Transaction {
  id: string;
  txId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // in STX
  fee: number; // in STX
  counterparty: string;
  memo?: string;
  timestamp: string;
  blockHeight?: number;
  contractName?: string;
  functionName?: string;
}

interface StacksTransaction {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  fee_rate: string;
  sender_address: string;
  block_height?: number;
  burn_block_time?: number;
  burn_block_time_iso?: string;
  token_transfer?: {
    recipient_address: string;
    amount: string;
    memo?: string;
  };
  contract_call?: {
    contract_id: string;
    function_name: string;
  };
  stx_sent?: string;
  stx_received?: string;
}

interface TransactionsResponse {
  results: StacksTransaction[];
  total: number;
  limit: number;
  offset: number;
}

function parseTransaction(tx: StacksTransaction, userAddress: string): Transaction {
  const isSender = tx.sender_address === userAddress;
  
  let type: TransactionType = "contract_call";
  let counterparty = tx.sender_address;
  let amount = 0;
  let memo: string | undefined;

  if (tx.tx_type === "token_transfer" && tx.token_transfer) {
    type = isSender ? "sent" : "received";
    counterparty = isSender ? tx.token_transfer.recipient_address : tx.sender_address;
    amount = Number(tx.token_transfer.amount) / 1_000_000;
    if (tx.token_transfer.memo) {
      // Decode hex memo to string
      try {
        const hexMemo = tx.token_transfer.memo.replace(/^0x/, "");
        memo = Buffer.from(hexMemo, "hex").toString("utf8").replace(/\0/g, "").trim();
        if (!memo) memo = undefined;
      } catch {
        memo = undefined;
      }
    }
  } else if (tx.tx_type === "contract_call") {
    type = "contract_call";
    counterparty = tx.contract_call?.contract_id || tx.sender_address;
  }

  const status: TransactionStatus = 
    tx.tx_status === "success" ? "success" :
    tx.tx_status === "pending" ? "pending" : "failed";

  return {
    id: tx.tx_id,
    txId: tx.tx_id,
    type,
    status,
    amount,
    fee: Number(tx.fee_rate) / 1_000_000,
    counterparty,
    memo,
    timestamp: tx.burn_block_time_iso || new Date().toISOString(),
    blockHeight: tx.block_height,
    contractName: tx.contract_call?.contract_id?.split(".")[1],
    functionName: tx.contract_call?.function_name,
  };
}

async function fetchTransactions(
  address: string,
  network: "mainnet" | "testnet",
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: Transaction[]; total: number }> {
  const apiUrl = NETWORK_CONFIG[network].apiUrl;
  const response = await fetch(
    `${apiUrl}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  const data: TransactionsResponse = await response.json();
  
  return {
    transactions: data.results.map((tx) => parseTransaction(tx, address)),
    total: data.total,
  };
}

export function useTransactions(limit: number = 50, offset: number = 0) {
  const { address, network, isConnected } = useWallet();

  return useQuery({
    queryKey: ["transactions", address, network, limit, offset],
    queryFn: () => fetchTransactions(address!, network, limit, offset),
    enabled: isConnected && !!address,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
}

export function useTransactionCount() {
  const { data } = useTransactions(1, 0);
  return data?.total ?? 0;
}
