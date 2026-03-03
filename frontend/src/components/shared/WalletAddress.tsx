import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function WalletAddress({ address, className }: { address: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} className={cn("inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors", className)}>
      {truncated}
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}
