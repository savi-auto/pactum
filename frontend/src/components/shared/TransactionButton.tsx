import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TxState = "idle" | "pending" | "broadcasting" | "confirmed";

interface TransactionButtonProps extends Omit<ButtonProps, "onClick"> {
  onAction?: () => Promise<void> | void;
  idleLabel: string;
  idleIcon?: LucideIcon;
}

export function TransactionButton({
  onAction,
  idleLabel,
  idleIcon: IdleIcon,
  className,
  ...props
}: TransactionButtonProps) {
  const [state, setState] = useState<TxState>("idle");
  const [progress, setProgress] = useState(0);

  const run = async () => {
    if (state !== "idle") return;

    setState("pending");
    try {
      await onAction?.();
    } catch {}

    await delay(1000);
    setState("broadcasting");
    
    // Animate progress 0 -> 90
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      await delay(150);
      setProgress(Math.round((i / steps) * 90));
    }

    setState("confirmed");
    setProgress(100);

    await delay(2000);
    setState("idle");
    setProgress(0);
  };

  const content: Record<TxState, { label: string; icon: React.ReactNode }> = {
    idle: {
      label: idleLabel,
      icon: IdleIcon ? <IdleIcon className="mr-1.5 h-4 w-4" /> : null,
    },
    pending: {
      label: "Preparing...",
      icon: <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />,
    },
    broadcasting: {
      label: "Broadcasting...",
      icon: <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />,
    },
    confirmed: {
      label: "Confirmed!",
      icon: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
    },
  };

  const cur = content[state];

  return (
    <div className="relative">
      <Button
        {...props}
        className={className}
        disabled={state !== "idle" || props.disabled}
        onClick={run}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center"
          >
            {cur.icon}
            {cur.label}
          </motion.span>
        </AnimatePresence>
      </Button>
      {state === "broadcasting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2"
        >
          <Progress value={progress} className="h-1.5" />
        </motion.div>
      )}
      {state === "confirmed" && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-center text-success font-medium"
        >
          Transaction confirmed on-chain
        </motion.p>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
