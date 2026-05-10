import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "@roaster/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "font-[family-name:var(--font-pixel)] uppercase leading-none tracking-[0.06em]",
    "rounded-none border-[3px] border-black",
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
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        secondary: [
          "bg-[var(--bg-card)] text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        accent: [
          "bg-acid-lime text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        orange: [
          "bg-fire-orange text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-[var(--text-primary)] shadow-none hover:border-black",
          "hover:shadow-neo-md",
          "disabled:border-stone disabled:text-stone",
        ].join(" "),
        danger: [
          "border-fire-red bg-fire-red text-white",
          "shadow-[4px_4px_0_var(--fire-red)]",
          "hover:shadow-[6px_6px_0_var(--fire-red)]",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        dark: [
          "bg-black text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
      },
      size: {
        sm: "px-3 py-1.5 text-[8px]",
        md: "px-5 py-[10px] text-[9px]",
        lg: "px-7 py-3.5 text-[10px]",
        xl: "px-9 py-[18px] text-[11px]",
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
