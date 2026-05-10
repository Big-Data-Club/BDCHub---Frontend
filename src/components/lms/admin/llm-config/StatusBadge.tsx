import { Badge } from "@/components/ui/badge";

type KeyStatus = "active" | "cooldown" | "disabled" | "invalid";

const COLOUR: Record<KeyStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-300",
  cooldown: "bg-amber-100 text-amber-800 border-amber-300",
  disabled: "bg-slate-100 text-slate-600 border-slate-300",
  invalid: "bg-rose-100 text-rose-700 border-rose-300",
};

export function StatusBadge({ status }: { status: KeyStatus }) {
  return (
    <Badge variant="outline" className={`${COLOUR[status]} font-medium uppercase tracking-wide text-[10px]`}>
      {status}
    </Badge>
  );
}