import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@roaster/ui/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "font-[family-name:var(--font-pixel)] uppercase tracking-[0.06em] leading-none",
    "border-[3px] border-black rounded-none",
    "cursor-pointer select-none whitespace-nowrap",
    "transition-all duration-[80ms]",
    /* hover: float up-left */
    "hover:-translate-x-px hover:-translate-y-px",
    /* press: translate down-right, shadow collapses */
    "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[linear-gradient(120deg,#E8231B_0%,#F47820_55%,#F5C518_100%)]",
          "text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        secondary: [
          "bg-[var(--bg-card)] text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        accent: [
          "bg-acid-lime text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        orange: [
          "bg-fire-orange text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--text-primary)] border-black shadow-none",
          "hover:shadow-neo-md",
          "disabled:text-stone disabled:border-stone",
        ].join(" "),
        danger: [
          "bg-fire-red-soft text-fire-red border-fire-red",
          "shadow-[4px_4px_0_var(--fire-red)]",
          "hover:shadow-[6px_6px_0_var(--fire-red)]",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        dark: [
          "bg-black text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
      },
      size: {
        sm: "text-[8px] px-3 py-1.5",
        md: "text-[9px] px-5 py-[10px]",
        lg: "text-[10px] px-7 py-3.5",
        xl: "text-[11px] px-9 py-[18px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
