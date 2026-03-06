import { cn } from "@/lib/utils";

// Status types for agreements/escrows
type AgreementStatus = "created" | "funded" | "delivered" | "completed" | "disputed" | "cancelled";

// Status types for invoices  
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

type AllStatus = AgreementStatus | InvoiceStatus;

const statusConfig: Record<AllStatus, { label: string; className: string; dotClass: string }> = {
  created: { label: "Created", className: "bg-muted text-muted-foreground", dotClass: "bg-muted-foreground" },
  funded: { label: "Funded", className: "bg-secondary/20 text-secondary", dotClass: "bg-secondary" },
  delivered: { label: "Delivered", className: "bg-warning/20 text-warning", dotClass: "bg-warning" },
  completed: { label: "Completed", className: "bg-success/20 text-success", dotClass: "bg-success" },
  disputed: { label: "Disputed", className: "bg-destructive/20 text-destructive", dotClass: "bg-destructive" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", dotClass: "bg-muted-foreground" },
  sent: { label: "Sent", className: "bg-secondary/20 text-secondary", dotClass: "bg-secondary" },
  paid: { label: "Paid", className: "bg-success/20 text-success", dotClass: "bg-success" },
  overdue: { label: "Overdue", className: "bg-destructive/20 text-destructive", dotClass: "bg-destructive" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground", dotClass: "bg-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: AllStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", config.className, className)}>
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
