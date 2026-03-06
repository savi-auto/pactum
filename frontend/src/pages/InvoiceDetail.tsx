import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInvoicesStore } from "@/stores/useInvoicesStore";
import { STX_PRICE_USD } from "@/lib/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { TransactionButton } from "@/components/shared/TransactionButton";
import { ArrowLeft, Download, Send, CheckCircle2, XCircle, Share2, Copy, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoice, markAsSent, markAsPaid, updateInvoice, deleteInvoice } = useInvoicesStore();
  const invoice = getInvoice(id!);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button variant="ghost" onClick={() => navigate("/invoices")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const totalUsd = invoice.total * STX_PRICE_USD;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Invoices
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* PDF-style preview */}
        <div className="lg:col-span-2">
          <Card className="border-2 bg-card">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Invoice</h2>
                  <p className="font-mono text-2xl font-bold text-foreground">{invoice.id}</p>
                </div>
                <div className="text-sm text-right space-y-1">
                  <p className="text-muted-foreground">Issued: <span className="text-foreground">{new Date(invoice.issuedAt).toLocaleDateString()}</span></p>
                  <p className="text-muted-foreground">Due: <span className="text-foreground font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* From / To */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">From</p>
                  <p className="text-sm font-medium text-foreground">{invoice.from.name}</p>
                  <WalletAddress address={invoice.from.address} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">To</p>
                  <p className="text-sm font-medium text-foreground">{invoice.to.name}</p>
                  <WalletAddress address={invoice.to.address} />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Line items — mobile stacked cards */}
              <div className="sm:hidden space-y-3">
                {invoice.lineItems.map(item => (
                  <div key={item.id} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-foreground">{item.description}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Qty: <span className="font-mono text-foreground">{item.quantity}</span></span>
                      <span>@ <span className="font-mono text-foreground">{item.unitPrice.toLocaleString()} STX</span></span>
                      <span className="font-mono font-semibold text-foreground">{item.total.toLocaleString()} STX</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line items — desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-semibold text-muted-foreground">Description</th>
                      <th className="pb-2 text-right font-semibold text-muted-foreground">Qty</th>
                      <th className="pb-2 text-right font-semibold text-muted-foreground">Unit Price</th>
                      <th className="pb-2 text-right font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map(item => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{item.description}</td>
                        <td className="py-3 text-right font-mono text-foreground">{item.quantity}</td>
                        <td className="py-3 text-right font-mono text-foreground">{item.unitPrice.toLocaleString()} STX</td>
                        <td className="py-3 text-right font-mono font-semibold text-foreground">{item.total.toLocaleString()} STX</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-foreground">{invoice.subtotal.toLocaleString()} STX</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({invoice.tax}%)</span>
                    <span className="font-mono text-foreground">{(invoice.subtotal * invoice.tax / 100).toLocaleString()} STX</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground">Total</span>
                  <div className="text-right">
                    <span className="font-mono text-foreground">{invoice.total.toLocaleString()} <span className="text-primary">STX</span></span>
                    <p className="font-mono text-xs font-normal text-muted-foreground">
                      ≈ ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Download button */}
          <div className="mt-3 flex justify-end">
            <Button variant="outline" disabled>
              <Download className="mr-1.5 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Sidebar: Meta & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={invoice.status} className="text-sm px-3 py-1" />
            </CardContent>
          </Card>

          {invoice.agreementId && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Linked Agreement</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/agreements/${invoice.agreementId}`}
                  className="inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {invoice.agreementId}
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoice.status === "draft" && (
                <TransactionButton
                  className="w-full gradient-orange border-0 text-white"
                  idleLabel="Mark as Sent"
                  idleIcon={Send}
                  onAction={async () => {
                    markAsSent(invoice.id);
                    toast.success(`${invoice.id} has been sent.`);
                  }}
                />
              )}
              {invoice.status === "sent" && (
                <TransactionButton
                  className="w-full bg-success text-success-foreground hover:bg-success/90"
                  idleLabel="Mark as Paid"
                  idleIcon={CheckCircle2}
                  onAction={async () => {
                    markAsPaid(invoice.id);
                    toast.success(`${invoice.id} marked as paid.`);
                  }}
                />
              )}
              {!["paid", "cancelled"].includes(invoice.status) && (
                <TransactionButton
                  variant="outline"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  idleLabel="Cancel Invoice"
                  idleIcon={XCircle}
                  onAction={async () => {
                    updateInvoice(invoice.id, { status: "cancelled" });
                    toast.success(`${invoice.id} has been cancelled.`);
                  }}
                />
              )}
              <div className="h-px bg-border" />
              <Button variant="outline" className="w-full" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied");
              }}>
                <Copy className="mr-1.5 h-4 w-4" /> Copy Link
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive" 
                onClick={() => {
                  if (confirm("Are you sure you want to delete this invoice?")) {
                    deleteInvoice(invoice.id);
                    toast.success("Invoice deleted");
                    navigate("/invoices");
                  }
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
