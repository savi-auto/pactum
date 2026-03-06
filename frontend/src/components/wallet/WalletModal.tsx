import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { ExternalLink, Loader2 } from "lucide-react";

export function WalletModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { connect, isLoading } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Wallet</DialogTitle>
          <DialogDescription>Connect your Stacks wallet to use Pactum</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to connect your wallet. Pactum supports Leather, Xverse, OKX, and other SIP-030 compatible wallets.
          </p>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 text-primary-foreground font-medium transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Stacks Wallet"
            )}
          </button>
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Supported Wallets</p>
            <div className="flex flex-wrap gap-2">
              {["Leather", "Xverse", "OKX", "Asigna"].map(name => (
                <span key={name} className="rounded bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <a 
          href="https://leather.io" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Need a wallet? Get Leather <ExternalLink className="h-3 w-3" />
        </a>
      </DialogContent>
    </Dialog>
  );
}
