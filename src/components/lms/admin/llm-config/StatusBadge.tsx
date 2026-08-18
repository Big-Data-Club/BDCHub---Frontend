import { Badge, BadgeVariant } from "@/components/lms/shared/Badge";

type KeyStatus = "active" | "cooldown" | "disabled" | "invalid";

const STATUS_VARIANT: Record<KeyStatus, BadgeVariant> = {
  active: "green",
  cooldown: "yellow",
  disabled: "gray",
  invalid: "red",
};

export function StatusBadge({ status }: { status: KeyStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} dot>
      {status}
    </Badge>
  );
}