import { cn } from "@/lib/utils";
import { STX_PRICE_USD } from "@/lib/mock-data";

interface STXAmountProps {
  amount: number;
  showUsd?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function STXAmount({ amount, showUsd = true, size = "md", className }: STXAmountProps) {
  const usd = amount * STX_PRICE_USD;
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("font-mono font-semibold text-foreground", {
        "text-sm": size === "sm",
        "text-base": size === "md",
        "text-2xl": size === "lg",
      })}>
        {amount.toLocaleString()} <span className="text-primary">STX</span>
      </span>
      {showUsd && (
        <span className="font-mono text-xs text-muted-foreground">
          ≈ ${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </span>
      )}
    </div>
  );
}
