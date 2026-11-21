import {
  Atom,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Code2,
  FlaskConical,
  Folder,
  Globe,
  PenLine,
  Sigma,
  Sparkles,
  Sprout,
} from "lucide-react";
import type { FieldColor, FieldIcon } from "../../types";
import styles from "./Fields.module.css";
export const fieldIcons = {
  book: BookOpen,
  folder: Folder,
  sigma: Sigma,
  atom: Atom,
  flask: FlaskConical,
  brain: BrainCircuit,
  code: Code2,
  sprout: Sprout,
  globe: Globe,
  pen: PenLine,
  briefcase: Briefcase,
  sparkles: Sparkles,
};
export const iconLabels: Record<FieldIcon, string> = {
  book: "Sách",
  folder: "Thư mục",
  sigma: "Toán học",
  atom: "Nguyên tử",
  flask: "Thí nghiệm",
  brain: "Ý tưởng",
  code: "Lập trình",
  sprout: "Phát triển",
  globe: "Thế giới",
  pen: "Ghi chép",
  briefcase: "Dự án",
  sparkles: "Khám phá",
};
export const colorLabels: Record<FieldColor, string> = {
  violet: "Tím",
  blue: "Xanh dương",
  green: "Xanh lá",
  amber: "Hổ phách",
  rose: "Hồng",
  slate: "Xám",
};
export function FieldArtwork({
  icon,
  color,
  index,
  compact = false,
}: {
  icon: FieldIcon;
  color: FieldColor;
  index?: number;
  compact?: boolean;
}) {
  const Icon = fieldIcons[icon] || BookOpen;
  return (
    <div
      className={`${styles.artwork} ${compact ? styles.compact : ""}`}
      data-tone={color}
      aria-hidden="true"
    >
      {index !== undefined && (
        <span className={styles.number}>
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span className={styles.orbit} />
      <Icon strokeWidth={1.15} className={styles.artIcon} />
    </div>
  );
}
