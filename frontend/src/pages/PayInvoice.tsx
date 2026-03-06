import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useInvoicesStore } from "@/stores/useInvoicesStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PactumLogo } from "@/components/shared/PactumLogo";
import { STXAmount } from "@/components/shared/STXAmount";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PayInvoice() {
  const { id } = useParams();
  const { getInvoice } = useInvoicesStore();
  const invoice = id ? getInvoice(id) : undefined;

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <p className="text-lg font-medium text-foreground">Invoice not found</p>
            <p className="mt-1 text-sm text-muted-foreground">This payment link may be invalid or expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePay = () => {
    toast.info("Wallet Connection Required", {
      description: "Connect a Stacks wallet to pay this invoice via escrow.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <PactumLogo size={28} />
          <span className="text-lg font-bold text-foreground">Pactum</span>
        </div>

        <Card className="border-2">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Invoice header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm text-muted-foreground">{invoice.id}</p>
                <h1 className="mt-1 text-xl font-bold text-foreground">{invoice.title}</h1>
              </div>
              <StatusBadge status={invoice.status} />
            </div>

            <Separator />

            {/* From / To */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">From</p>
                <p className="text-sm font-medium text-foreground">{invoice.from.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{invoice.from.address.slice(0, 10)}…</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">To</p>
                <p className="text-sm font-medium text-foreground">{invoice.to.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{invoice.to.address.slice(0, 10)}…</p>
              </div>
            </div>

            <Separator />

            {/* Line items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Items</p>
              <div className="space-y-2">
                {invoice.lineItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.description}</span>
                    <span className="font-mono text-muted-foreground">{item.total.toLocaleString()} STX</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Due</span>
              <STXAmount amount={invoice.total} size="lg" />
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Due {format(new Date(invoice.dueDate), "PPP")}
              </p>
            </div>

            <Separator />

            {/* Pay button */}
            <Button onClick={handlePay} className="w-full gradient-orange border-0 text-white" size="lg">
              <Shield className="mr-2 h-4 w-4" />
              Pay with Escrow
            </Button>

            <p className="text-center text-[10px] text-muted-foreground">
              Funds are held in a Clarity smart contract until delivery is confirmed.
            </p>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Powered by Pactum · Built on Stacks
        </p>
      </motion.div>
    </div>
  );
}
