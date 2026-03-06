import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { STXAmount } from "@/components/shared/STXAmount";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { DetailPageSkeleton } from "@/components/shared/PageSkeletons";
import { useWallet } from "@/contexts/WalletContext";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, FileCode } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface StacksTransaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  sender_address: string;
  token_transfer?: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
  contract_call?: {
    contract_id: string;
    function_name: string;
  };
  burn_block_time_iso: string;
  fee_rate: string;
}

function useTransaction(txId: string | undefined) {
  const { isTestnet, apiUrl } = useWallet();
  
  return useQuery({
    queryKey: ["transaction", txId],
    queryFn: async (): Promise<StacksTransaction | null> => {
      if (!txId) return null;
      const res = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!txId,
    staleTime: 30000,
  });
}

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isTestnet } = useWallet();
  const { data: tx, isLoading } = useTransaction(id);

  if (isLoading) return <DetailPageSkeleton />;

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Transaction not found</p>
        <Button variant="ghost" onClick={() => navigate("/transactions")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const isContractCall = tx.tx_type === "contract_call";
  const isSent = tx.sender_address === address;
  const amount = tx.token_transfer ? Number(tx.token_transfer.amount) / 1_000_000 : 0;
  const counterparty = tx.token_transfer?.recipient_address || tx.contract_call?.contract_id || tx.sender_address;
  const memo = tx.token_transfer?.memo;
  const explorerUrl = `https://explorer.hiro.so/txid/${tx.tx_id}?chain=${isTestnet ? "testnet" : "mainnet"}`;

  const copyTxId = async () => {
    await navigator.clipboard.writeText(tx.tx_id);
    toast.success("Transaction ID copied to clipboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Transactions
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card className="border-2 bg-card">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isContractCall 
                    ? "bg-purple-500/10 text-purple-500"
                    : isSent ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  {isContractCall ? <FileCode className="h-5 w-5" /> : isSent ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">
                      {isContractCall ? "Contract Call" : isSent ? "Sent" : "Received"}
                    </h2>
                    <Badge variant={tx.tx_status === "success" ? "secondary" : "outline"}>
                      {tx.tx_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Amount */}
              {amount > 0 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Amount</p>
                    <div className={`font-mono text-2xl font-bold ${isSent ? "text-destructive" : "text-emerald-500"}`}>
                      {isSent ? "-" : "+"}<STXAmount amount={amount} size="lg" />
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                </>
              )}

              {/* Contract call details */}
              {isContractCall && tx.contract_call && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contract</p>
                    <p className="font-mono text-sm text-foreground break-all">{tx.contract_call.contract_id}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Function</p>
                    <p className="text-sm text-foreground">{tx.contract_call.function_name}</p>
                  </div>
                  <div className="h-px bg-border" />
                </>
              )}

              {/* Counterparty */}
              {!isContractCall && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {isSent ? "Sent To" : "Received From"}
                    </p>
                    <WalletAddress address={counterparty} className="text-sm" />
                  </div>
                  <div className="h-px bg-border" />
                </>
              )}

              {/* Memo */}
              {memo && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Memo</p>
                    <p className="text-sm text-muted-foreground">{memo}</p>
                  </div>
                  <div className="h-px bg-border" />
                </>
              )}

              {/* Timestamp */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm text-foreground">{format(new Date(tx.burn_block_time_iso), "PPpp")}</p>
              </div>

              <div className="h-px bg-border" />

              {/* Transaction ID */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-foreground break-all">{tx.tx_id}</p>
              </div>

              <div className="h-px bg-border" />

              {/* Fee */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fee</p>
                <p className="font-mono text-sm text-foreground">{(Number(tx.fee_rate) / 1_000_000).toFixed(6)} STX</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionStatus
                state={tx.tx_status === "success" ? "confirmed" : "pending"}
                txHash={tx.tx_id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> View in Block Explorer
                </a>
              </Button>
              <Button variant="outline" className="w-full" onClick={copyTxId}>
                <Copy className="mr-1.5 h-4 w-4" /> Copy Transaction ID
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
