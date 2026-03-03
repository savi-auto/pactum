import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mockAgreements } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STXAmount } from "@/components/shared/STXAmount";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { DetailPageSkeleton } from "@/components/shared/PageSkeletons";
import { TransactionButton } from "@/components/shared/TransactionButton";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { ArrowLeft, CheckCircle2, Banknote, AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const timelineSteps = ["created", "funded", "delivered", "completed"] as const;

export default function AgreementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoading = useSimulatedLoading();
  const agreement = mockAgreements.find(a => a.id === id);

  if (isLoading) return <DetailPageSkeleton />;

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Agreement not found</p>
        <Button variant="ghost" onClick={() => navigate("/agreements")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const currentStep = timelineSteps.indexOf(
    agreement.status === "disputed" ? "delivered" : agreement.status
  );

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
            <span className="font-mono text-sm text-muted-foreground">{agreement.id}</span>
            <StatusBadge status={agreement.status} />
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{agreement.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{agreement.description}</p>
        </div>
        <STXAmount amount={agreement.amount} size="lg" />
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
              <ContactAvatar name={agreement.counterparty.name} className="h-12 w-12 text-sm" />
              <div>
                <p className="font-medium text-foreground">{agreement.counterparty.name}</p>
                <WalletAddress address={agreement.counterparty.address} />
                <p className="mt-0.5 text-xs text-muted-foreground">Role: {agreement.role === "client" ? "You're the Client" : "You're the Freelancer"}</p>
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
              <span className="text-sm text-muted-foreground">Deadline</span>
              <CountdownTimer deadline={agreement.deadline} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm text-foreground">{new Date(agreement.createdAt).toLocaleDateString()}</span>
            </div>
            {agreement.invoiceId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Invoice</span>
                <Link to={`/invoices/${agreement.invoiceId}`} className="font-mono text-sm text-primary hover:underline">
                  {agreement.invoiceId}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="flex flex-wrap gap-3 p-4">
          {agreement.status === "funded" && (
            <TransactionButton
              className="gradient-orange border-0 text-white"
              idleLabel="Mark as Delivered"
              idleIcon={CheckCircle2}
              onAction={async () => {
                toast({ title: "Delivery Confirmed", description: `${agreement.id} marked as delivered.` });
              }}
            />
          )}
          {agreement.status === "delivered" && (
            <TransactionButton
              className="bg-success text-success-foreground hover:bg-success/90"
              idleLabel="Release Payment"
              idleIcon={Banknote}
              onAction={async () => {
                toast({ title: "Payment Released", description: `${agreement.amount.toLocaleString()} STX released.` });
              }}
            />
          )}
          {!["completed", "disputed"].includes(agreement.status) && (
            <TransactionButton
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              idleLabel="Open Dispute"
              idleIcon={AlertTriangle}
              onAction={async () => {
                toast({ title: "Dispute Opened", description: `Dispute opened for ${agreement.id}.` });
              }}
            />
          )}
          <Button variant="outline">
            <FileText className="mr-1.5 h-4 w-4" /> View Invoice
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
