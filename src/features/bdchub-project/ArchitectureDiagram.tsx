import {
  BookOpen,
  BrainCircuit,
  Monitor,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import styles from "./architecture-diagram.module.css";

const services = [
  {
    x: 66,
    title: "Danh tính",
    detail: "Tài khoản · Tổ chức · Phân quyền",
    tech: "Spring Boot",
    icon: ShieldCheck,
    logo: "spring",
  },
  {
    x: 330,
    title: "Học tập & thực hành",
    detail: "Khóa học · Quiz · Virtual Lab",
    tech: "Go",
    icon: BookOpen,
    logo: "go",
  },
  {
    x: 594,
    title: "AI Cowork",
    detail: "RAG · Knowledge graph · LLM",
    tech: "Python / FastAPI",
    icon: BrainCircuit,
    logo: "python",
  },
  {
    x: 858,
    title: "Cộng tác",
    detail: "Workspace · Chat · WebSocket",
    tech: "Node.js / Go",
    icon: Users,
    logo: "nodejs",
  },
];

function Server({ x, y, logo }: { x: number; y: number; logo: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="76" height="90" rx="6" className={styles.serverBody} />
      {[12, 34, 56].map((top) => (
        <g key={top}>
          <rect
            x="9"
            y={top}
            width="58"
            height="15"
            rx="3"
            className={styles.serverSlot}
          />
          <circle cx="58" cy={top + 7.5} r="2.5" fill="#73c99c" />
        </g>
      ))}
      <rect
        x="22"
        y="90"
        width="32"
        height="7"
        rx="2"
        className={styles.serverBody}
      />
      <rect x="-15" y="50" width="38" height="38" rx="8" fill="white" />
      <image
        href={`/projects/bdchub/tech/${logo}.svg`}
        x="-9"
        y="56"
        width="26"
        height="26"
      />
    </g>
  );
}

function Database({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className={styles.database}>
      <path d="M0 14V70C0 88 72 88 72 70V14" />
      <ellipse cx="36" cy="14" rx="36" ry="14" />
      <path d="M0 40C0 58 72 58 72 40M0 59C0 77 72 77 72 59" fill="none" />
    </g>
  );
}

/** Original schematic: SVG illustrations, explicit paths, no client-side layout engine. */
export function ArchitectureDiagram() {
  return (
    <div
      className={styles.viewport}
      role="region"
      aria-label="Sơ đồ kiến trúc BDC Hub, cuộn ngang để khám phá"
      tabIndex={0}
    >
      <svg
        className={styles.canvas}
        viewBox="0 0 1120 850"
        role="img"
        aria-labelledby="bdchub-architecture-title bdchub-architecture-description"
      >
        <title id="bdchub-architecture-title">
          BDC Hub: từ người học đến các dịch vụ và dữ liệu
        </title>
        <desc id="bdchub-architecture-description">
          Người dùng truy cập frontend Next.js. Yêu cầu API đi qua Traefik tới
          các dịch vụ danh tính, học tập, AI và cộng tác. Mỗi service quản lý dữ
          liệu riêng; PostgreSQL lưu nghiệp vụ, Redis hỗ trợ cache và realtime.
          Kafka chuyển tác vụ nền tới worker để lập chỉ mục Qdrant và Neo4j cho
          AI truy xuất.
        </desc>
        <defs>
          <marker
            id="bdc-flow-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path
              d="M1 1L9 5L1 9"
              fill="none"
              stroke="context-stroke"
              strokeWidth="1.5"
            />
          </marker>
        </defs>

        <rect
          x="16"
          y="16"
          width="1088"
          height="200"
          rx="16"
          className={styles.experienceZone}
        />
        <rect
          x="16"
          y="268"
          width="1088"
          height="236"
          rx="16"
          className={styles.serviceZone}
        />
        <rect
          x="16"
          y="562"
          width="440"
          height="264"
          rx="16"
          className={styles.dataZone}
        />
        <rect
          x="488"
          y="562"
          width="616"
          height="264"
          rx="16"
          className={styles.workerZone}
        />

        <g className={styles.flow} markerEnd="url(#bdc-flow-arrow)">
          <path d="M260 122H392" />
          <path d="M634 122H824" />
          <path d="M956 162V234Q956 246 944 246H572Q560 246 560 258V268" />
          <path d="M236 504V562" />
          <path d="M790 504V562" className={styles.asyncFlow} />
          <path d="M660 682H724" className={styles.asyncFlow} />
          <path d="M852 682H910" className={styles.asyncFlow} />
        </g>
        <g className={styles.arrowLabel}>
          <text x="326" y="110">
            HTTPS
          </text>
          <text x="728" y="110">
            API / STREAM
          </text>
          <text x="314" y="540">
            Đọc / ghi theo quyền
          </text>
          <text x="903" y="540">
            Sự kiện / tác vụ nền
          </text>
        </g>

        <text x="40" y="48" className={styles.zoneLabel}>
          01 / TRUY CẬP NỀN TẢNG
        </text>
        <Monitor
          x="138"
          y="70"
          width="52"
          height="52"
          className={styles.illustration}
          strokeWidth="1.5"
        />
        <text x="164" y="151" className={styles.nodeTitle}>
          Người dùng
        </text>
        <text x="164" y="176" className={styles.detail}>
          Học viên · Giảng viên
        </text>
        <text x="164" y="196" className={styles.detail}>
          Nhóm học tập
        </text>

        <rect
          x="394"
          y="70"
          width="240"
          height="108"
          rx="8"
          className={styles.frontend}
        />
        <image
          href="/projects/bdchub/tech/nextjs.svg"
          x="418"
          y="94"
          width="38"
          height="38"
        />
        <text x="534" y="111" className={styles.nodeTitle}>
          BDC Hub Web
        </text>
        <text x="514" y="153" className={styles.detail}>
          Next.js · React · TypeScript
        </text>

        <ShieldCheck
          x="860"
          y="80"
          width="52"
          height="52"
          className={styles.illustration}
          strokeWidth="1.5"
        />
        <text x="978" y="106" className={styles.nodeTitle}>
          Traefik
        </text>
        <text x="960" y="150" className={styles.detail}>
          Ingress · TLS · Routing
        </text>

        <text x="40" y="300" className={styles.zoneLabel}>
          02 / CÁC DỊCH VỤ TRONG K3S
        </text>
        <image
          href="/projects/bdchub/tech/kubernetes.svg"
          x="1050"
          y="281"
          width="26"
          height="26"
        />
        {services.map(({ x, title, detail, tech, icon: Icon, logo }) => (
          <g key={title}>
            <Server x={x + 62} y={326} logo={logo} />
            <Icon
              x={x + 152}
              y={350}
              width="28"
              height="28"
              className={styles.illustration}
              strokeWidth="1.5"
            />
            <text x={x + 100} y="449" className={styles.nodeTitle}>
              {title}
            </text>
            <text x={x + 100} y="473" className={styles.detail}>
              {detail}
            </text>
            <text x={x + 100} y="492" className={styles.small}>
              {tech}
            </text>
          </g>
        ))}

        <text x="40" y="595" className={styles.zoneLabel}>
          03 / DỮ LIỆU & CACHE
        </text>
        <Database x={82} y={628} />
        <image
          href="/projects/bdchub/tech/postgresql.svg"
          x="98"
          y="651"
          width="38"
          height="38"
        />
        <text x="118" y="742" className={styles.nodeTitle}>
          PostgreSQL
        </text>
        <text x="118" y="766" className={styles.detail}>
          DB riêng theo service
        </text>
        <image
          href="/projects/bdchub/tech/redis.svg"
          x="294"
          y="640"
          width="70"
          height="70"
        />
        <text x="329" y="742" className={styles.nodeTitle}>
          Redis
        </text>
        <text x="329" y="766" className={styles.detail}>
          Cache · Realtime
        </text>
        <text x="236" y="802" className={styles.small}>
          Khóa học · Tài khoản · Ghi chú · Tiến độ
        </text>

        <text x="512" y="595" className={styles.zoneLabel}>
          04 / XỬ LÝ NỀN & LẬP CHỈ MỤC
        </text>
        <rect x="558" y="640" width="76" height="76" rx="10" fill="white" />
        <image
          href="/projects/bdchub/tech/kafka.svg"
          x="564"
          y="646"
          width="64"
          height="64"
        />
        <text x="596" y="742" className={styles.nodeTitle}>
          Kafka
        </text>
        <text x="596" y="766" className={styles.detail}>
          Hàng đợi sự kiện
        </text>
        <Workflow
          x="756"
          y="648"
          width="68"
          height="68"
          className={styles.illustration}
          strokeWidth="1.5"
        />
        <text x="790" y="742" className={styles.nodeTitle}>
          AI Workers
        </text>
        <text x="790" y="766" className={styles.detail}>
          Trích xuất · Lập chỉ mục
        </text>
        <Database x={958} y={640} />
        <text x="994" y="742" className={styles.nodeTitle}>
          Qdrant · Neo4j
        </text>
        <text x="994" y="766" className={styles.detail}>
          Vector · Quan hệ
        </text>
        <text x="796" y="802" className={styles.small}>
          AI truy xuất chỉ mục để tìm nội dung trong khóa học
        </text>
      </svg>
    </div>
  );
}
