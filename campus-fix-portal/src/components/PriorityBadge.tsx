import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: "Critical" | "High" | "Medium" | "Low";
}

const priorityVariants = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
} as const;

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge variant={priorityVariants[priority]}>
      {priority}
    </Badge>
  );
}
