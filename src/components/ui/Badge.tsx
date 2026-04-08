import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface BadgeProps extends React.ComponentProps<"div"> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-zinc-900 text-zinc-50",
    secondary: "border-transparent bg-zinc-100 text-zinc-700",
    destructive: "border-transparent bg-red-100 text-red-700",
    outline: "text-zinc-700 border-zinc-200",
    success: "border-transparent bg-emerald-100 text-emerald-700",
    warning: "border-transparent bg-amber-100 text-amber-700",
  }

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2", variants[variant], className)} {...props} />
  )
}

export { Badge }
