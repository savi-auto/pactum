import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEscrow, useMarkDelivered, useReleasePayment, useInitiateDispute, useCancelEscrow } from "@/hooks/useEscrow";
import { useContactsStore } from "@/stores/useContactsStore";
import { useWallet } from "@/contexts/WalletContext";
import { microToStx } from "@/lib/contracts";
import type { EscrowStatus } from "@/lib/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STXAmount } from "@/components/shared/STXAmount";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { DetailPageSkeleton } from "@/components/shared/PageSkeletons";
import { TransactionButton } from "@/components/shared/TransactionButton";
import { ArrowLeft, CheckCircle2, Banknote, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const timelineSteps = ["created", "funded", "delivered", "completed"] as const;
type TimelineStep = typeof timelineSteps[number];

function statusToStep(status: EscrowStatus): TimelineStep {
  switch (status) {
    case "created": return "created";
    case "funded": return "funded";
    case "delivered": return "delivered";
    case "completed":
    case "cancelled":
      return "completed";
    case "disputed": return "delivered";
    default: return "created";
  }
}

function statusLabel(status: EscrowStatus): string {
  const labels: Record<EscrowStatus, string> = {
    created: "Created",
    funded: "Funded",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Refunded",
    disputed: "Disputed",
  };
  return labels[status] || "Unknown";
}

function statusVariant(status: EscrowStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed": return "secondary";
    case "funded":
    case "delivered": return "default";
    case "disputed": return "destructive";
    default: return "outline";
  }
}

export default function AgreementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isTestnet } = useWallet();
  const { getContactByAddress } = useContactsStore();
  
  const escrowId = id ? parseInt(id, 10) : null;
  const { data: escrow, isLoading, error } = useEscrow(escrowId);
  
  // Mutation hooks
  const markDelivered = useMarkDelivered();
  const releasePayment = useReleasePayment();
  const initiateDispute = useInitiateDispute();
  const cancelEscrow = useCancelEscrow();

  if (isLoading) return <DetailPageSkeleton />;

  if (error || !escrow) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Agreement not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This may be an invalid escrow ID or the escrow doesn't exist.</p>
        <Button variant="ghost" onClick={() => navigate("/agreements")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const isClient = escrow.client === address;
  const isFreelancer = escrow.freelancer === address;
  const counterpartyAddress = isClient ? escrow.freelancer : escrow.client;
  const contact = getContactByAddress(counterpartyAddress);
  const counterpartyName = contact?.name || `${counterpartyAddress.slice(0, 8)}...`;
  const amount = microToStx(escrow.amount);
  const currentStep = timelineSteps.indexOf(statusToStep(escrow.status));
  const explorerUrl = `https://explorer.hiro.so/address/${isTestnet ? "testnet" : "mainnet"}`;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/agreements")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Agreements
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">Escrow #{escrow.id}</span>
            <Badge variant={statusVariant(escrow.status)}>{statusLabel(escrow.status)}</Badge>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {isClient ? "Payment to" : "Payment from"} {counterpartyName}
          </h1>
          {escrow.invoiceHash && (
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              Invoice: {escrow.invoiceHash.slice(0, 16)}...
            </p>
          )}
        </div>
        <STXAmount amount={amount} size="lg" />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && <div className={`h-0.5 flex-1 ${i <= currentStep ? "bg-primary" : "bg-border"}`} />}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    i <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < timelineSteps.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />}
                </div>
                <span className="mt-2 text-[10px] font-medium capitalize text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Parties */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Counterparty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <ContactAvatar name={counterpartyName} className="h-12 w-12 text-sm" />
              <div>
                <p className="font-medium text-foreground">{counterpartyName}</p>
                <WalletAddress address={counterpartyAddress} />
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Role: {isClient ? "You're the Client" : "You're the Freelancer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm text-foreground">
                {escrow.createdAt ? format(new Date(escrow.createdAt * 1000), "PPP") : "—"}
              </span>
            </div>
            {escrow.fundedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Funded</span>
                <span className="text-sm text-foreground">
                  {format(new Date(escrow.fundedAt * 1000), "PPP")}
                </span>
              </div>
            )}
            {escrow.deliveredAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Delivered</span>
                <span className="text-sm text-foreground">
                  {format(new Date(escrow.deliveredAt * 1000), "PPP")}
                </span>
              </div>
            )}
            {escrow.reviewDeadline && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Review Deadline</span>
                <span className="text-sm text-foreground">
                  {format(new Date(escrow.reviewDeadline * 1000), "PPP pp")}
                </span>
              </div>
            )}
            {escrow.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm text-foreground">
                  {format(new Date(escrow.completedAt * 1000), "PPP")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="flex flex-wrap gap-3 p-4">
          {/* Freelancer can mark as delivered when funded */}
          {escrow.status === "funded" && isFreelancer && (
            <TransactionButton
              className="gradient-orange border-0 text-white"
              idleLabel="Mark as Delivered"
              idleIcon={CheckCircle2}
              isPending={markDelivered.isPending}
              onAction={() => markDelivered.mutateAsync(escrow.id)}
            />
          )}

          {/* Client can release payment when delivered */}
          {escrow.status === "delivered" && isClient && (
            <TransactionButton
              className="bg-success text-success-foreground hover:bg-success/90"
              idleLabel="Release Payment"
              idleIcon={Banknote}
              isPending={releasePayment.isPending}
              onAction={() => releasePayment.mutateAsync(escrow.id)}
            />
          )}

          {/* Both can open dispute when funded or delivered */}
          {["funded", "delivered"].includes(escrow.status) && (
            <TransactionButton
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              idleLabel="Open Dispute"
              idleIcon={AlertTriangle}
              isPending={initiateDispute.isPending}
              onAction={() => initiateDispute.mutateAsync(escrow.id)}
            />
          )}

          {/* Client can cancel escrow when created (not yet funded) */}
          {escrow.status === "created" && isClient && (
            <TransactionButton
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              idleLabel="Cancel Escrow"
              idleIcon={XCircle}
              isPending={cancelEscrow.isPending}
              onAction={() => cancelEscrow.mutateAsync(escrow.id)}
            />
          )}

          <Button variant="outline" asChild>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" /> View on Explorer
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
