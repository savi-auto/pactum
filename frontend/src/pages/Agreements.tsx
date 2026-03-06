import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STXAmount } from "@/components/shared/STXAmount";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { ListPageSkeleton } from "@/components/shared/PageSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUserEscrows } from "@/hooks/useEscrow";
import { useWallet } from "@/contexts/WalletContext";
import { microToStx, type EscrowStatus } from "@/lib/contracts";
import { Search, Plus, LayoutList, Columns3, Filter, FileText, Wallet } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const kanbanColumns: { status: EscrowStatus; label: string }[] = [
  { status: "created", label: "Created" },
  { status: "funded", label: "Funded" },
  { status: "delivered", label: "Delivered" },
  { status: "completed", label: "Completed" },
];

// Helper to truncate addresses
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Agreements() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { data: escrows, isLoading, error } = useUserEscrows();
  
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const hasFilters = search !== "" || statusFilter !== "all";

  // Transform escrows for display
  const agreements = (escrows || []).map(escrow => ({
    id: `#${escrow.id.toString().padStart(4, '0')}`,
    escrowId: escrow.id,
    title: `Escrow #${escrow.id}`, // No title in contract, using ID
    amount: microToStx(escrow.amount),
    status: escrow.status,
    counterparty: {
      name: truncateAddress(escrow.client === address ? escrow.freelancer : escrow.client),
      address: escrow.client === address ? escrow.freelancer : escrow.client,
    },
    isClient: escrow.client === address,
    deadline: escrow.reviewDeadline ? new Date(Date.now() + (escrow.reviewDeadline - Date.now()) * 1000) : null,
    createdAt: escrow.createdAt,
  }));

  const filtered = agreements.filter(a => {
    const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.counterparty.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Not connected state
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agreements</h1>
          <p className="text-sm text-muted-foreground">Connect wallet to view agreements</p>
        </div>
        <EmptyState
          icon={Wallet}
          title="Connect Your Wallet"
          description="Connect your Stacks wallet to view and manage your escrow agreements."
        />
      </div>
    );
  }

  if (isLoading) return <ListPageSkeleton />;

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agreements</h1>
          <p className="text-sm text-muted-foreground">{agreements.length} total agreements</p>
        </div>
        <Button onClick={() => navigate("/agreements/create")} className="gradient-orange border-0 text-white">
          <Plus className="mr-1.5 h-4 w-4" /> New Agreement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agreements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border">
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("list")}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={view === "kanban" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("kanban")}>
              <Columns3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {filtered.map(agr => (
            <Card
              key={agr.escrowId}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate(`/agreements/${agr.escrowId}`)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <ContactAvatar name={agr.counterparty.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{agr.id}</span>
                    <StatusBadge status={agr.status} />
                    {agr.isClient && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">Client</span>
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">{agr.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{agr.counterparty.address}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <STXAmount amount={agr.amount} size="sm" />
                  {agr.deadline && <CountdownTimer deadline={agr.deadline} />}
                </div>
                <div className="flex gap-2 sm:hidden">
                  <STXAmount amount={agr.amount} showUsd={false} size="sm" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            hasFilters ? (
              <EmptyState
                icon={Search}
                title="No matching agreements"
                description="Try adjusting your search or filters to find what you're looking for."
                secondaryLabel="Clear Filters"
                onSecondaryClick={clearFilters}
              />
            ) : (
              <EmptyState
                icon={FileText}
                title="Create your first agreement"
                description="Set up an escrow agreement to start transacting securely with your contacts."
                actionLabel="New Agreement"
                actionTo="/agreements/create"
              />
            )
          )}
        </motion.div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {kanbanColumns.map(col => {
            const items = filtered.filter(a => a.status === col.status);
            return (
              <div key={col.status} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(agr => (
                    <Card
                      key={agr.escrowId}
                      className="cursor-pointer transition-colors hover:bg-accent"
                      onClick={() => navigate(`/agreements/${agr.escrowId}`)}
                    >
                      <CardContent className="p-3">
                        <p className="truncate text-sm font-medium text-foreground">{agr.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{agr.counterparty.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <STXAmount amount={agr.amount} showUsd={false} size="sm" />
                          {agr.deadline && <CountdownTimer deadline={agr.deadline} />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
