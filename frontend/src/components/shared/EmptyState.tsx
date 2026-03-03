import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  onSecondaryClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  secondaryLabel,
  secondaryTo,
  onSecondaryClick,
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex gap-3">
        {actionLabel && actionTo && (
          <Button className="gradient-orange border-0 text-white" onClick={() => navigate(actionTo)}>
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && (
          <Button
            variant="outline"
            onClick={() => {
              if (onSecondaryClick) onSecondaryClick();
              else if (secondaryTo) navigate(secondaryTo);
            }}
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
