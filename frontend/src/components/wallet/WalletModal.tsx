import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { ExternalLink } from "lucide-react";

const wallets = [
  { name: "Leather", description: "Most popular Stacks wallet", icon: "🟤" },
  { name: "Xverse", description: "Bitcoin & Stacks wallet", icon: "🟣" },
  { name: "OKX", description: "OKX Web3 wallet", icon: "⚫" },
  { name: "Asigna", description: "Multi-sig wallet for teams", icon: "🔵" },
];

export function WalletModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { connect } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (walletName: string) => {
    setConnecting(walletName);
    await new Promise(r => setTimeout(r, 1200));
    connect(walletName);
    setConnecting(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to Pactum</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => handleConnect(w.name)}
              disabled={connecting !== null}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
            >
              <span className="text-2xl">{w.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{w.name}</p>
                <p className="text-xs text-muted-foreground">{w.description}</p>
              </div>
              {connecting === w.name && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </button>
          ))}
        </div>
        <a href="#" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          What's a wallet? <ExternalLink className="h-3 w-3" />
        </a>
      </DialogContent>
    </Dialog>
  );
}
