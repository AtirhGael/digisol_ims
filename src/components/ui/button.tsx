
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { FaPlus, FaDownload } from "react-icons/fa6"
import { cn } from "../../lib/utils"
import BeatLoader from "react-spinners/BeatLoader"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 cursor-pointer",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-white cursor-pointer hover:opacity-75",
        cancel:
          "bg-black text-white shadow-sm hover:opacity-75 cursor-pointer",
        primary:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-700 cursor-pointer",
        secondary:
          "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300 cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        md: "h-9 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  buttonType?: string
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, buttonType, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {buttonType == "download" && <FaDownload />}
        {buttonType == "add" && <FaPlus />}
        {loading ? <BeatLoader size={8} color="white" /> : children}
      </Comp>
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
