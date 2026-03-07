import { useWallet } from "@/contexts/WalletContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { TestnetBadge } from "@/components/shared/TestnetBanner";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { STXAmount } from "@/components/shared/STXAmount";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { Wallet, LogOut, ChevronDown } from "lucide-react";

export function Header({ onConnectWallet }: { onConnectWallet: () => void }) {
  const { isConnected, address, balance, network, walletName, disconnect, setNetwork } = useWallet();

  const truncated = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-lg px-4 md:px-6">
      <div className="flex items-center gap-2">
        <TestnetBadge />
        {isConnected && address && (
          <span className="hidden sm:inline font-mono text-xs text-muted-foreground">{truncated}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isConnected && address ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {truncated}
                <span className="hidden sm:inline text-muted-foreground">·</span>
                <span className="hidden sm:inline text-primary font-semibold">{balance.toLocaleString()} STX</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0 z-50 bg-popover">
              {/* Wallet header */}
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                  🔗
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{walletName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Connected</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Address</p>
                <WalletAddress address={address} />
              </div>

              <Separator />

              {/* Balance */}
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Balance</p>
                <STXAmount amount={balance} size="md" />
              </div>

              <Separator />

              {/* Network */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Network</p>
                  <p className="text-sm font-medium text-foreground capitalize">{network}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Mainnet</span>
                  <Switch
                    checked={network === "mainnet"}
                    onCheckedChange={(checked) => setNetwork(checked ? "mainnet" : "testnet")}
                  />
                </div>
              </div>

              <Separator />

              {/* Disconnect */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={disconnect}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button onClick={onConnectWallet} size="sm" className="gradient-orange border-0 text-white">
            <Wallet className="mr-1.5 h-4 w-4" />
            Connect
          </Button>
        )}
      </div>
    </header>
  );
}
