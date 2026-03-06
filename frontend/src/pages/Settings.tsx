import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Wallet, Bell, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { toast } from "sonner";

function ProfileTab() {
  const [profile, setProfile] = useState({
    displayName: "Alex Rivera",
    email: "alex@pactum.finance",
    businessName: "Rivera Digital LLC",
    bio: "Freelance developer specializing in smart contract integrations.",
  });

  const handleSave = () => {
    toast.success("Profile saved successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Information</CardTitle>
        <CardDescription>Your public identity on the Pactum network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" value={profile.businessName} onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} />
        </div>
        <Button onClick={handleSave}>Save Profile</Button>
      </CardContent>
    </Card>
  );
}

function WalletTab() {
  const { isConnected, address, network, walletName, disconnect, setNetwork, connect } = useWallet();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wallet</CardTitle>
          <CardDescription>Connect a Stacks wallet to manage your on-chain identity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">No wallet connected. Connect one to start creating agreements and invoices.</p>
          <Button onClick={() => connect()}>Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Wallet</CardTitle>
        <CardDescription>Manage your connected wallet and network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{walletName}</p>
            {address && <WalletAddress address={address} />}
          </div>
          <Badge variant={network === "mainnet" ? "default" : "secondary"}>
            {network}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Network</Label>
            <p className="text-xs text-muted-foreground">Switch between mainnet and testnet</p>
          </div>
          <Select value={network} onValueChange={(v) => setNetwork(v as "mainnet" | "testnet")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mainnet">Mainnet</SelectItem>
              <SelectItem value="testnet">Testnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="destructive" onClick={disconnect}>Disconnect Wallet</Button>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    agreementStatus: true,
    paymentReceived: true,
    invoiceDue: false,
    disputeAlerts: true,
  });

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((n) => ({ ...n, [key]: !n[key] }));

  const items = [
    { key: "agreementStatus" as const, label: "Agreement status changes", desc: "Get notified when agreements are signed, completed, or disputed" },
    { key: "paymentReceived" as const, label: "Payment received", desc: "Alerts when STX payments are confirmed on-chain" },
    { key: "invoiceDue" as const, label: "Invoice due reminders", desc: "Reminders before invoices reach their due date" },
    { key: "disputeAlerts" as const, label: "Dispute alerts", desc: "Immediate notification when a dispute is raised" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notifications</CardTitle>
        <CardDescription>Choose which events trigger notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label>{item.label}</Label>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={notifications[item.key]} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InvoiceDefaultsTab() {
  const [defaults, setDefaults] = useState({
    paymentTerms: "net30",
    taxRate: "0",
    currencyDisplay: "stx",
    notesTemplate: "Thank you for your business. Payment is expected within the agreed terms.",
  });

  const handleSave = () => {
    toast.success("Invoice defaults saved successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invoice Defaults</CardTitle>
        <CardDescription>Pre-fill new invoices with these settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select value={defaults.paymentTerms} onValueChange={(v) => setDefaults((d) => ({ ...d, paymentTerms: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receipt">Due on Receipt</SelectItem>
                <SelectItem value="net15">Net 15</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
            <Input id="taxRate" type="number" min="0" max="100" value={defaults.taxRate} onChange={(e) => setDefaults((d) => ({ ...d, taxRate: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Currency Display</Label>
          <Select value={defaults.currencyDisplay} onValueChange={(v) => setDefaults((d) => ({ ...d, currencyDisplay: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stx">STX only</SelectItem>
              <SelectItem value="stx_usd">STX + USD</SelectItem>
              <SelectItem value="usd">USD only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notesTemplate">Default Notes Template</Label>
          <Textarea id="notesTemplate" value={defaults.notesTemplate} onChange={(e) => setDefaults((d) => ({ ...d, notesTemplate: e.target.value }))} rows={3} />
        </div>
        <Button onClick={handleSave}>Save Defaults</Button>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, wallet, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-4">
          <TabsTrigger value="profile" className="gap-1.5 flex-shrink-0"><User className="h-4 w-4 hidden sm:block" /> Profile</TabsTrigger>
          <TabsTrigger value="wallet" className="gap-1.5 flex-shrink-0"><Wallet className="h-4 w-4 hidden sm:block" /> Wallet</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 flex-shrink-0"><Bell className="h-4 w-4 hidden sm:block" /> Notifications</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5 flex-shrink-0"><FileText className="h-4 w-4 hidden sm:block" /> Invoice Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="wallet"><WalletTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="invoices"><InvoiceDefaultsTab /></TabsContent>
      </Tabs>
    </motion.div>
  );
}
