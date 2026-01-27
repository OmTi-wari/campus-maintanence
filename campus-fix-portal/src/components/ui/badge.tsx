import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Priority variants
        critical: "border-transparent bg-priority-critical text-priority-critical-foreground",
        high: "border-transparent bg-priority-high text-priority-high-foreground",
        medium: "border-transparent bg-priority-medium text-priority-medium-foreground",
        low: "border-transparent bg-priority-low text-priority-low-foreground",
        // Status variants
        open: "border-transparent bg-status-open text-status-open-foreground",
        "in-progress": "border-transparent bg-status-in-progress text-status-in-progress-foreground",
        resolved: "border-transparent bg-status-resolved text-status-resolved-foreground",
        rejected: "border-transparent bg-status-rejected text-status-rejected-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
