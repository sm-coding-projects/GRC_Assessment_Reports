import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps): React.ReactNode {
  return (
    <div
      className={cn(
        "rounded bg-surface-inset animate-pulse",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
