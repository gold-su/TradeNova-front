import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span className={cn("font-semibold tracking-tight", className)} aria-label="TradeNova">
      <span className="text-foreground">Trade</span>
      <span className="text-primary">Nova</span>
    </span>
  );
}
