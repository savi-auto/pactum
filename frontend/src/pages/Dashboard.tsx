import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STXAmount } from "@/components/shared/STXAmount";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { PactumLogo } from "@/components/shared/PactumLogo";
import { DashboardSkeleton } from "@/components/shared/PageSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { useWallet } from "@/contexts/WalletContext";
import { useUserEscrows, useEscrowStats } from "@/hooks/useEscrow";
import { microToStx, STX_PRICE_USD } from "@/lib/contracts";
import { FileText, Receipt, Users, ArrowRight, TrendingUp, Clock, AlertTriangle, CheckCircle2, Wallet, Sparkles } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

// Helper to truncate addresses
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { data: escrows, isLoading: escrowsLoading } = useUserEscrows();
  const stats = useEscrowStats();

  const isLoading = escrowsLoading || stats.isLoading;

  // Convert totalValue from microSTX to STX
  const totalLocked = microToStx(stats.totalValue);
  
  // Transform escrows for display
  const agreements = (escrows || []).map(escrow => ({
    id: escrow.id,
    title: `Escrow #${escrow.id}`,
    amount: microToStx(escrow.amount),
    status: escrow.status,
    counterparty: {
      name: truncateAddress(escrow.client === address ? escrow.freelancer : escrow.client),
      address: escrow.client === address ? escrow.freelancer : escrow.client,
    },
    isClient: escrow.client === address,
    deadline: escrow.reviewDeadline ? new Date(escrow.reviewDeadline * 1000) : null,
  }));

  // Not connected state
  if (!isConnected) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <PactumLogo size={48} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Welcome to Pactum</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Trustless escrow agreements on Stacks. Connect your wallet to get started.
                  </p>
                  <div className="mt-4">
                    <EmptyState
                      icon={Wallet}
                      title="Connect Your Wallet"
                      description="Connect your Stacks wallet to view your dashboard and manage escrow agreements."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  if (isLoading) return <DashboardSkeleton />;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Portfolio Summary */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 gradient-orange text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-white/70">Total Value Locked</p>
            <p className="mt-1 font-mono text-3xl font-bold">{totalLocked.toLocaleString()} STX</p>
            <p className="font-mono text-sm text-white/60">≈ ${(totalLocked * STX_PRICE_USD).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</p>
            <div className="mt-4 flex gap-4 flex-wrap">
              {[
                { label: "Active", value: stats.activeCount, icon: TrendingUp },
                { label: "Pending", value: stats.pendingCount, icon: Clock },
                { label: "Completed", value: stats.completedCount, icon: CheckCircle2 },
                { label: "Disputed", value: stats.disputedCount, icon: AlertTriangle },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <s.icon className="h-3.5 w-3.5 text-white/60" />
                  <span className="text-xs text-white/60">{s.label}</span>
                  <span className="font-mono text-sm font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "New Agreement", icon: FileText, to: "/agreements/create" },
            { label: "New Invoice", icon: Receipt, to: "/invoices" },
            { label: "Add Contact", icon: Users, to: "/contacts" },
            { label: "View Agreements", icon: ArrowRight, to: "/agreements" },
          ].map(action => (
            <Card
              key={action.label}
              className="cursor-pointer border-border transition-colors hover:border-primary/30 hover:bg-accent"
              onClick={() => navigate(action.to)}
            >
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Active Agreements */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agreements</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate("/agreements")}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {agreements.filter(a => a.status !== "completed" && a.status !== "cancelled").length === 0 ? (
              <div className="py-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No active agreements</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate("/agreements/create")}
                >
                  Create your first agreement
                </Button>
              </div>
            ) : (
              agreements.filter(a => a.status !== "completed" && a.status !== "cancelled").slice(0, 5).map(agr => (
                <div
                  key={agr.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent cursor-pointer"
                  onClick={() => navigate(`/agreements/${agr.id}`)}
                >
                  <ContactAvatar name={agr.counterparty.name} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{agr.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{agr.counterparty.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <STXAmount amount={agr.amount} showUsd={false} size="sm" />
                    <div className="flex items-center gap-2">
                      <StatusBadge status={agr.status} />
                      {agr.deadline && <CountdownTimer deadline={agr.deadline} />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
