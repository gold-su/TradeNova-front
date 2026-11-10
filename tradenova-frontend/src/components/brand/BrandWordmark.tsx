import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span className={cn("font-semibold tracking-tight", className)} aria-label="DeciReps">
      <span className="text-foreground">Deci</span>
      <span className="text-primary">Reps</span>
    </span>
  );
}
