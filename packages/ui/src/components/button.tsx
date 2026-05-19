import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "@roaster/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "font-pixel uppercase leading-none tracking-xs",
    "border-[3px] border-foreground",
    "cursor-pointer select-none whitespace-nowrap",
    "transition-all duration-fast",
    "hover:-translate-x-px hover:-translate-y-px",
    "active:translate-x-[var(--translate-md)] active:translate-y-[var(--translate-md)] active:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[linear-gradient(120deg,#E8231B_0%,#F47820_55%,#F5C518_100%)]",
          "!text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        secondary: [
          "bg-card text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        accent: [
          "!text-black bg-acid-lime shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        orange: [
          "bg-fire-orange text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-primary shadow-none hover:border-foreground",
          "hover:shadow-neo-md",
          "disabled:border-stone disabled:text-stone",
        ].join(" "),
        danger: [
          "border-fire-red bg-fire-red text-white",
          "shadow-neo-fire",
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
        "icon-sm": "size-7 p-0",
        icon: "size-9 p-0",
        sm: "px-3 py-2 text-btn-sm",
        md: "px-5 py-[10px] text-btn-md",
        lg: "px-7 py-3.5 text-btn-lg",
        xl: "px-9 py-[18px] text-btn-xl",
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
