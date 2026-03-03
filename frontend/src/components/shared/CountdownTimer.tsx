import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export function CountdownTimer({ deadline, className }: { deadline: string; className?: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Overdue");
        setIsOverdue(true);
        return;
      }
      setIsOverdue(false);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else {
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${h}h ${m}m`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-mono", isOverdue ? "text-destructive" : "text-muted-foreground", className)}>
      <Clock className="h-3 w-3" />
      {timeLeft}
    </span>
  );
}
