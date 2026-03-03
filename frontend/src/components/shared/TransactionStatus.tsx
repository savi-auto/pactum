import { Loader2, Radio, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionState = "pending" | "broadcasting" | "confirmed";

interface TransactionStatusProps {
  state: TransactionState;
  txHash?: string;
  className?: string;
}

export function TransactionStatus({ state, txHash, className }: TransactionStatusProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {state === "pending" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Waiting for confirmation…</span>
        </>
      )}
      {state === "broadcasting" && (
        <>
          <Radio className="h-4 w-4 animate-pulse text-primary" />
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground">Broadcasting</span>
            {txHash && (
              <p className="truncate font-mono text-xs text-muted-foreground">{txHash}</p>
            )}
          </div>
        </>
      )}
      {state === "confirmed" && (
        <>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">Confirmed</span>
        </>
      )}
    </div>
  );
}
