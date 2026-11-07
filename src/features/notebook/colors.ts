import type { HighlightColor } from "@/types/ai/notebook";
export const highlightColors: {
  value: HighlightColor;
  label: string;
  background: string;
}[] = [
  { value: "yellow", label: "Vàng", background: "#facc1555" },
  { value: "green", label: "Xanh lá", background: "#4ade8055" },
  { value: "blue", label: "Xanh dương", background: "#38bdf855" },
  { value: "pink", label: "Hồng", background: "#f472b655" },
];
