import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { mockWalletTransactions } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { STXAmount } from "@/components/shared/STXAmount";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { DetailPageSkeleton } from "@/components/shared/PageSkeletons";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ExternalLink, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoading = useSimulatedLoading();
  const tx = mockWalletTransactions.find(t => t.id === id);

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

  const isSent = tx.type === "sent";
  const explorerUrl = `https://explorer.hiro.so/txid/${tx.id}?chain=mainnet`;

  const copyTxId = async () => {
    await navigator.clipboard.writeText(tx.id);
    toast({ title: "Copied", description: "Transaction ID copied to clipboard." });
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
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSent ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}>
                  {isSent ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{isSent ? "Sent" : "Received"}</h2>
                    <Badge variant={tx.status === "confirmed" ? "secondary" : "outline"}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Amount */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Amount</p>
                <div className={`font-mono text-2xl font-bold ${isSent ? "text-destructive" : "text-emerald-500"}`}>
                  {isSent ? "-" : "+"}<STXAmount amount={tx.amount} size="lg" />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Counterparty */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {isSent ? "Sent To" : "Received From"}
                </p>
                <WalletAddress address={tx.counterparty} className="text-sm" />
              </div>

              {/* Memo */}
              {tx.memo && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Memo</p>
                    <p className="text-sm text-muted-foreground">{tx.memo}</p>
                  </div>
                </>
              )}

              <div className="h-px bg-border" />

              {/* Timestamp */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm text-foreground">{format(new Date(tx.timestamp), "PPpp")}</p>
              </div>

              <div className="h-px bg-border" />

              {/* Transaction ID */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-foreground break-all">{tx.id}</p>
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
                state={tx.status === "confirmed" ? "confirmed" : "pending"}
                txHash={tx.id}
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
