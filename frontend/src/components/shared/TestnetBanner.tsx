import { ExternalLink, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestnetBadgeProps {
  className?: string;
}

/**
 * Small pill badge for navbar - similar to DRIP's approach
 */
export function TestnetBadge({ className }: TestnetBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20",
      className
    )}>
      <Radio className="h-3 w-3 animate-pulse" />
      TESTNET
    </span>
  );
}

/**
 * Card-style notification for landing/dashboard pages
 */
export function TestnetCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm px-4 py-3",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
          <Radio className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Testnet Mode</p>
          <p className="text-xs text-muted-foreground">Using Stacks Testnet</p>
        </div>
      </div>
      <a
        href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        Get Testnet STX
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

/**
 * Legacy full-width banner (keeping for backwards compatibility)
 */
export function TestnetBanner() {
  return null; // Disabled - use TestnetBadge and TestnetCard instead
}

