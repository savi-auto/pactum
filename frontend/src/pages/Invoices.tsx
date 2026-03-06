import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STXAmount } from "@/components/shared/STXAmount";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useInvoicesStore, type InvoiceStatus } from "@/stores/useInvoicesStore";
import { Search, Plus, Filter, Calendar, Receipt } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Invoices() {
  const navigate = useNavigate();
  const { invoices } = useInvoicesStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const hasFilters = search !== "" || statusFilter !== "all";

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.to.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.from.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">{invoices.length} total invoice{invoices.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => navigate("/invoices/create")} className="gradient-orange border-0 text-white">
          <Plus className="mr-1.5 h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Filters */}
      {invoices.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        {filtered.map(inv => (
          <Card
            key={inv.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate(`/invoices/${inv.id}`)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <ContactAvatar name={inv.to.name === "You" ? inv.from.name : inv.to.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{inv.id}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="truncate text-sm font-medium text-foreground">{inv.title}</p>
                <p className="text-xs text-muted-foreground">
                  To: {inv.to.name === "You" ? inv.from.name : inv.to.name}
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <STXAmount amount={inv.total} size="sm" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due {new Date(inv.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2 sm:hidden">
                <STXAmount amount={inv.total} showUsd={false} size="sm" />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          hasFilters ? (
            <EmptyState
              icon={Search}
              title="No matching invoices"
              description="Try adjusting your search or filters to find what you're looking for."
              secondaryLabel="Clear Filters"
              onSecondaryClick={clearFilters}
            />
          ) : (
            <EmptyState
              icon={Receipt}
              title="Create your first invoice"
              description="Send professional invoices to your contacts and get paid in STX."
              actionLabel="New Invoice"
              actionTo="/invoices/create"
            />
          )
        )}
      </motion.div>
    </div>
  );
}
