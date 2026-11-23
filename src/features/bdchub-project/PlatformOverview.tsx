import Image from "next/image";
import { ArrowRight, Github } from "lucide-react";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import styles from "./platform-overview.module.css";
import pageStyles from "./bdchub.module.css";

const technologies = [
  ["nextjs", "Next.js"],
  ["typescript", "TypeScript"],
  ["spring", "Spring Boot"],
  ["go", "Go"],
  ["python", "Python"],
  ["nodejs", "Node.js"],
  ["postgresql", "PostgreSQL"],
  ["redis", "Redis"],
  ["kafka", "Kafka"],
  ["docker", "Docker"],
  ["kubernetes", "K3s / Kubernetes"],
] as const;

/** Public, conceptual architecture. Static server markup; no runtime graph library. */
export function PlatformOverview() {
  return (
    <section
      id="platform"
      className={`${pageStyles.container} ${pageStyles.section} ${styles.overview}`}
      aria-labelledby="platform-title"
    >
      <div className={pageStyles.sectionHeading}>
        <div>
          <p className={pageStyles.kicker}>BÊN TRONG BDC HUB</p>
          <h2 id="platform-title">
            Nhiều thành phần.
            <br />
            <em>Một trải nghiệm kết nối.</em>
          </h2>
        </div>
        <p className={pageStyles.muted}>
          Mỗi khối phụ trách một phần công việc, từ tổ chức nội dung đến hỗ trợ
          học tập. Chúng phối hợp để việc học và cộng tác diễn ra trong cùng một
          nền tảng.
        </p>
      </div>

      <figure className={styles.diagram} aria-labelledby="platform-caption">
        <ArchitectureDiagram />
        <figcaption id="platform-caption" className={styles.caption}>
          Sơ đồ tổng quan BDC Hub. Trên màn hình nhỏ, kéo ngang để xem các nhánh
          kết nối.
        </figcaption>
      </figure>

      <div className={styles.stackHeader}>
        <h3>Công nghệ đang sử dụng</h3>
        <a
          href="https://github.com/Big-Data-Club/CoreApplication"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={17} aria-hidden="true" /> Khám phá mã nguồn{" "}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <ul className={styles.stack} aria-label="Tech stack BDC Hub">
        {technologies.map(([icon, name]) => (
          <li key={icon}>
            <span className={styles.iconTile}>
              <Image
                src={`/projects/bdchub/tech/${icon}.svg`}
                alt=""
                width={28}
                height={28}
              />
            </span>
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
