import { cn } from "@/lib/utils";

export function ContactAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = [
    "bg-primary/20 text-primary",
    "bg-secondary/20 text-secondary",
    "bg-success/20 text-success",
    "bg-warning/20 text-warning",
    "bg-destructive/20 text-destructive",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold", color, className)}>
      {initials}
    </div>
  );
}
