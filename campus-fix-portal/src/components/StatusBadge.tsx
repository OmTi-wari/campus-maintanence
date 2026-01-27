import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "Open" | "In Progress" | "Resolved" | "Rejected";
}

const statusVariants = {
  "Open": "open",
  "In Progress": "in-progress",
  "Resolved": "resolved",
  "Rejected": "rejected",
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {status}
    </Badge>
  );
}
