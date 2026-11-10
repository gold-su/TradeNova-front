import { cn } from "@/lib/utils";
import decirepsLogo from "@/assets/brand/decireps-logo.svg";

type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md bg-[#F1F5F4] px-1 py-0.5", className)}
      aria-label="DeciReps"
    >
      <img
        src={decirepsLogo}
        alt=""
        aria-hidden="true"
        className="block h-7 w-auto max-w-full"
      />
    </span>
  );
}
