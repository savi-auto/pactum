/**
 * useEscrow Hook
 * 
 * React hook for interacting with Pactum escrow contracts.
 * Uses React Query for data fetching, caching, and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import {
  createEscrow,
  fundEscrow,
  cancelEscrow,
  markDelivered,
  releasePayment,
  requestRevision,
  initiateDispute,
  getEscrow,
  getEscrowCount,
  fetchUserEscrows,
  isReviewPeriodExpired,
  getExplorerTxUrl,
  getErrorMessage,
} from "@/lib/escrow-service";
import type { Escrow } from "@/lib/contracts";

// Query keys for React Query
const QUERY_KEYS = {
  escrows: (address: string, network: string) => ["escrows", address, network],
  escrow: (id: number, network: string) => ["escrow", id, network],
  escrowCount: (network: string) => ["escrowCount", network],
};

/**
 * Hook to fetch user's escrows
 */
export function useUserEscrows() {
  const { address, network, isConnected } = useWallet();

  return useQuery({
    queryKey: QUERY_KEYS.escrows(address || "", network),
    queryFn: () => fetchUserEscrows(address!, network),
    enabled: isConnected && !!address,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
}

/**
 * Hook to fetch a single escrow by ID
 */
export function useEscrow(escrowId: number | null) {
  const { address, network, isConnected } = useWallet();

  return useQuery({
    queryKey: QUERY_KEYS.escrow(escrowId || 0, network),
    queryFn: () => getEscrow(escrowId!, address!, network),
    enabled: isConnected && !!address && escrowId !== null,
    staleTime: 30_000,
  });
}

/**
 * Hook to get total escrow count
 */
export function useEscrowCount() {
  const { address, network, isConnected } = useWallet();

  return useQuery({
    queryKey: QUERY_KEYS.escrowCount(network),
    queryFn: () => getEscrowCount(address!, network),
    enabled: isConnected && !!address,
    staleTime: 60_000,
  });
}

/**
 * Hook for creating a new escrow
 */
export function useCreateEscrow() {
  const { network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      freelancerAddress,
      amountStx,
      invoiceHash,
    }: {
      freelancerAddress: string;
      amountStx: number;
      invoiceHash?: string | null;
    }) => {
      return createEscrow(freelancerAddress, amountStx, invoiceHash || null, network);
    },
    onSuccess: (result) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      queryClient.invalidateQueries({ queryKey: ["escrowCount"] });

      toast({
        title: "Agreement Created",
        description: (
          <a 
            href={getExplorerTxUrl(result.txid, network)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction →
          </a>
        ),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create agreement",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for funding an escrow
 */
export function useFundEscrow() {
  const { address, network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      escrowId,
      amount,
    }: {
      escrowId: number;
      amount: bigint;
    }) => {
      if (!address) throw new Error("Wallet not connected");
      return fundEscrow(escrowId, amount, address, network);
    },
    onSuccess: (result, { escrowId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.escrow(escrowId, network) });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });

      toast({
        title: "Escrow Funded",
        description: (
          <a 
            href={getExplorerTxUrl(result.txid, network)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction →
          </a>
        ),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to fund escrow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for canceling an escrow
 */
export function useCancelEscrow() {
  const { network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (escrowId: number) => {
      return cancelEscrow(escrowId, network);
    },
    onSuccess: (result, escrowId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.escrow(escrowId, network) });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });

      toast({
        title: "Agreement Cancelled",
        description: "The escrow has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for marking work as delivered
 */
export function useMarkDelivered() {
  const { network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (escrowId: number) => {
      return markDelivered(escrowId, network);
    },
    onSuccess: (result, escrowId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.escrow(escrowId, network) });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });

      toast({
        title: "Work Delivered",
        description: "Review period has started. Client has 48 hours to review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark delivered",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for releasing payment
 */
export function useReleasePayment() {
  const { network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      escrowId,
      amount,
      freelancerAddress,
    }: {
      escrowId: number;
      amount: bigint;
      freelancerAddress: string;
    }) => {
      return releasePayment(escrowId, amount, freelancerAddress, network);
    },
    onSuccess: (result, { escrowId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.escrow(escrowId, network) });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });

      toast({
        title: "Payment Released",
        description: "Funds have been transferred to the freelancer.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to release payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for requesting revision
 */
export function useRequestRevision() {
  const { network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (escrowId: number) => {
      return requestRevision(escrowId, network);
    },
    onSuccess: (result, escrowId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.escrow(escrowId, network) });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });

      toast({
        title: "Revision Requested",
        description: "The freelancer has been notified to make revisions.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request revision",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for initiating dispute
 */
export function useInitiateDispute() {
  const { network } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (escrowId: number) => {
      return initiateDispute(escrowId, network);
    },
    onSuccess: (result, escrowId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.escrow(escrowId, network) });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });

      toast({
        title: "Dispute Initiated",
        description: "Funds are now locked pending resolution.",
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to initiate dispute",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Helper hook to check escrow review period status
 */
export function useReviewPeriodStatus(escrowId: number | null) {
  const { address, network, isConnected } = useWallet();

  return useQuery({
    queryKey: ["reviewPeriod", escrowId, network],
    queryFn: () => isReviewPeriodExpired(escrowId!, address!, network),
    enabled: isConnected && !!address && escrowId !== null,
    refetchInterval: 30_000, // Check every 30 seconds
  });
}

/**
 * Get escrow stats for dashboard
 */
export function useEscrowStats() {
  const { data: escrows, isLoading } = useUserEscrows();

  if (isLoading || !escrows) {
    return {
      isLoading,
      totalValue: 0n,
      activeCount: 0,
      pendingCount: 0,
      completedCount: 0,
      disputedCount: 0,
    };
  }

  const stats = escrows.reduce(
    (acc, escrow) => {
      if (["funded", "delivered"].includes(escrow.status)) {
        acc.totalValue += escrow.amount;
        acc.activeCount++;
      }
      if (escrow.status === "created") acc.pendingCount++;
      if (escrow.status === "completed") acc.completedCount++;
      if (escrow.status === "disputed") acc.disputedCount++;
      return acc;
    },
    {
      totalValue: 0n,
      activeCount: 0,
      pendingCount: 0,
      completedCount: 0,
      disputedCount: 0,
    }
  );

  return { isLoading, ...stats };
}
