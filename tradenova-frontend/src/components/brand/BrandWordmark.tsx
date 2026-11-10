import { cn } from "@/lib/utils";
import decirepsSymbol from "@/assets/brand/decireps-symbol.svg";

type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[17px] font-semibold leading-none tracking-tight",
        className,
      )}
      aria-label="DeciReps"
    >
      <img
        src={decirepsSymbol}
        alt=""
        aria-hidden="true"
        className="block h-[26px] w-[26px] shrink-0"
      />
      <span aria-hidden="true">
        <span className="text-foreground">Deci</span>
        <span className="text-primary">Reps</span>
      </span>
    </span>
  );
}
