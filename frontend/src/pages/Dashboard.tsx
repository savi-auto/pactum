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
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { useWallet } from "@/contexts/WalletContext";
import { mockAgreements, mockActivity, chartData, STX_PRICE_USD } from "@/lib/mock-data";
import { FileText, Receipt, Users, ArrowDownLeft, ArrowRight, TrendingUp, Clock, AlertTriangle, CheckCircle2, Banknote, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const statusCounts = {
  active: mockAgreements.filter(a => a.status === "funded").length,
  pending: mockAgreements.filter(a => a.status === "created").length,
  paid: mockAgreements.filter(a => a.status === "completed").length,
  dispute: mockAgreements.filter(a => a.status === "disputed").length,
};

const totalLocked = mockAgreements
  .filter(a => ["funded", "delivered"].includes(a.status))
  .reduce((sum, a) => sum + a.amount, 0);

const eventIcons: Record<string, typeof TrendingUp> = {
  agreement_created: FileText,
  payment_received: Banknote,
  agreement_funded: TrendingUp,
  delivery_confirmed: CheckCircle2,
  dispute_opened: AlertTriangle,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const isLoading = useSimulatedLoading();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Hero for first-time / disconnected users */}
      {!isConnected && (
        <motion.div variants={item}>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <PactumLogo size={48} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Welcome to Pactum</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Trustless escrow agreements on Stacks. Create your first agreement or add a contact to get started.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => navigate("/agreements/create")} className="gradient-orange border-0 text-white">
                      <FileText className="mr-1.5 h-4 w-4" /> New Agreement
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/contacts")}>
                      <Users className="mr-1.5 h-4 w-4" /> Add Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {/* Portfolio Summary */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 gradient-orange text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-white/70">Total Value Locked</p>
            <p className="mt-1 font-mono text-3xl font-bold">{totalLocked.toLocaleString()} STX</p>
            <p className="font-mono text-sm text-white/60">≈ ${(totalLocked * STX_PRICE_USD).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</p>
            <div className="mt-4 flex gap-4">
              {[
                { label: "Active", value: statusCounts.active, icon: TrendingUp },
                { label: "Pending", value: statusCounts.pending, icon: Clock },
                { label: "Paid", value: statusCounts.paid, icon: CheckCircle2 },
                { label: "Dispute", value: statusCounts.dispute, icon: AlertTriangle },
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

      {/* Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Volume (30d)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(18, 100%, 50%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(18, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="hsl(18, 100%, 50%)" fill="url(#volGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
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
            { label: "Receive Payment", icon: ArrowDownLeft, to: "/dashboard" },
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

      <div className="grid gap-6 md:grid-cols-2">
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
              {mockAgreements.filter(a => a.status !== "completed").slice(0, 5).map(agr => (
                <div
                  key={agr.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent cursor-pointer"
                  onClick={() => navigate(`/agreements/${agr.id}`)}
                >
                  <ContactAvatar name={agr.counterparty.name} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{agr.title}</p>
                    <p className="text-xs text-muted-foreground">{agr.counterparty.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <STXAmount amount={agr.amount} showUsd={false} size="sm" />
                    <div className="flex items-center gap-2">
                      <StatusBadge status={agr.status} />
                      <CountdownTimer deadline={agr.deadline} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockActivity.map(evt => {
                const Icon = eventIcons[evt.type] || FileText;
                const activityRoute = evt.relatedId && evt.relatedType
                  ? `/${evt.relatedType === "agreement" ? "agreements" : evt.relatedType === "invoice" ? "invoices" : "transactions"}/${evt.relatedId}`
                  : null;
                return (
                  <div
                    key={evt.id}
                    className={`flex items-start gap-3 rounded-lg p-2 -mx-2 transition-colors ${activityRoute ? "cursor-pointer hover:bg-accent" : ""}`}
                    onClick={() => activityRoute && navigate(activityRoute)}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{evt.title}</p>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(evt.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
