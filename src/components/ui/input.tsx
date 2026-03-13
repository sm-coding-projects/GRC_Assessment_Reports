import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-9 w-full rounded border bg-surface px-3 text-sm font-sans text-ink",
          "placeholder:text-ink-subtle",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-danger focus:ring-danger"
            : "border-border",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, type InputProps };
