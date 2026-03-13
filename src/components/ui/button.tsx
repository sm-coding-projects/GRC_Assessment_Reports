import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium",
          "rounded transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" && [
            "bg-accent text-white",
            "hover:bg-accent-hover",
          ],
          variant === "ghost" && [
            "bg-transparent text-ink",
            "hover:bg-surface-alt",
          ],
          variant === "danger" && [
            "bg-danger text-white",
            "hover:bg-danger/90",
          ],
          size === "default" && "h-9 px-4 text-sm",
          size === "sm" && "h-7 px-3 text-xs",
          size === "lg" && "h-11 px-6 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, type ButtonProps };
