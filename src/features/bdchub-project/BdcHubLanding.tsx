import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  GitBranch,
  MessageSquare,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BrandMark } from "@/components/layout/BrandMark";
import { AmbientEffects } from "@/components/common/ambient/AmbientEffects";
import { AmbientStars } from "@/components/common/ambient/AmbientStars";
import { BdcHubDemo } from "./BdcHubDemo";
import styles from "./bdchub.module.css";

const features = [
  {
    icon: BookOpen,
    title: "Một lộ trình, nhiều cách học",
    text: "Tổ chức khóa học, bài giảng và quiz trong cùng một không gian. Người học theo dõi nội dung; giảng viên quản lý hành trình từ đầu đến cuối.",
  },
  {
    icon: GitBranch,
    title: "Thấy kiến thức kết nối",
    text: "Knowledge graph giúp khám phá các khái niệm và quan hệ giữa chúng, để việc học có một bức tranh rõ ràng hơn.",
  },
  {
    icon: MessageSquare,
    title: "Hỏi ngay khi cần hiểu",
    text: "AI Cowork đồng hành bên cạnh nội dung học, hỗ trợ giải thích và tìm tài liệu liên quan trong phạm vi khóa học.",
  },
];
const workflow = [
  {
    title: "Xây dựng khóa học",
    text: "Giảng viên sắp xếp bài giảng, tài liệu và hoạt động đánh giá.",
  },
  {
    title: "Kết nối kiến thức",
    text: "Các chủ đề được đặt trong một bản đồ để người học nhìn thấy mối liên hệ.",
  },
  {
    title: "Học và đặt câu hỏi",
    text: "Học viên đọc bài, làm quiz và trao đổi với AI trong ngữ cảnh đang học.",
  },
  {
    title: "Tiếp tục cùng nhau",
    text: "Theo dõi tiến độ và cộng tác trong Workspace để phát triển ý tưởng tiếp theo.",
  },
];

export function BdcHubLanding() {
  return (
    <AmbientEffects className={styles.page}>
      <a href="#overview" className={styles.skipLink}>
        Đến nội dung chính
      </a>
      <header className={styles.header}>
        <div className={styles.nav}>
          <Link href="/#projects" className={styles.backLink} prefetch={false}>
            <ChevronLeft size={16} /> BDC CLUB
          </Link>
          <a href="#overview" className={styles.brand}>
            <BrandMark size={38} />{" "}
            BDC<span>Hub.</span>
          </a>
          <nav className={styles.navLinks} aria-label="Nội dung dự án">
            <a href="#experience">Trải nghiệm</a>
            <a href="#workflow">Cách hoạt động</a>
          </nav>
          <ThemeToggle size={18} />
          <Link href="/lms" prefetch={false} className={styles.navCta}>
            Vào học tập <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <section
        id="overview"
        className={`${styles.container} ${styles.hero}`}
        aria-labelledby="bdchub-title"
      >
        <AmbientStars />
        <p className={styles.kicker}>
          A BIG DATA CLUB PROJECT · LEARNING, CONNECTED
        </p>
        <div className={styles.heroGrid}>
          <div>
            <h1 id="bdchub-title">
              Kiến thức có kết nối.
              <br />
              <em>Việc học có bạn đồng hành.</em>
            </h1>
          </div>
          <div className={styles.heroIntro}>
            <p>
              BDC Hub kết nối khóa học, bản đồ kiến thức và AI trong một trải
              nghiệm học tập liền mạch.
            </p>
            <p className={styles.muted}>
              Dành cho người học muốn hiểu sâu hơn, giảng viên muốn tổ chức nội
              dung rõ ràng và cộng đồng muốn cùng tạo ra giá trị.
            </p>
            <div className={styles.actions}>
              <a href="#experience" className={styles.primary}>
                Thử demo tương tác <ArrowDown size={17} />
              </a>
              <Link href="/lms" prefetch={false} className={styles.secondary}>
                Vào không gian học tập <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.heroTags}>
          <span>
            <BookOpen size={16} /> Learning Management
          </span>
          <span>
            <GitBranch size={16} /> Knowledge Graph
          </span>
          <span>
            <MessageSquare size={16} /> AI Cowork
          </span>
          <span>
            <Users size={16} /> Shared Workspace
          </span>
        </div>
      </section>
      <section
        id="experience"
        className={`${styles.container} ${styles.section}`}
        aria-labelledby="experience-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>CHẠM ĐỂ HIỂU SẢN PHẨM</p>
            <h2 id="experience-title">
              Một khóa học.
              <br />
              <em>Trọn vẹn trải nghiệm học.</em>
            </h2>
          </div>
          <p className={styles.muted}>
            Từ quản lý khóa học đến học bài, khám phá kiến thức và trò chuyện
            cùng AI.
          </p>
        </div>
        <BdcHubDemo />
      </section>
      <section
        className={`${styles.container} ${styles.section}`}
        aria-labelledby="value-title"
        data-reveal
      >
        <p className={styles.kicker}>VÌ SAO BDC HUB?</p>
        <h2 id="value-title">
          Từ học rời rạc
          <br />
          <em>đến hiểu có hệ thống.</em>
        </h2>
        <div className={styles.featureGrid}>
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className={styles.feature}>
              <Icon size={25} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        id="workflow"
        className={`${styles.container} ${styles.section}`}
        aria-labelledby="workflow-title"
        data-reveal
      >
        <p className={styles.kicker}>CÁCH HOẠT ĐỘNG</p>
        <h2 id="workflow-title">
          Một hành trình học tập,
          <br />
          <em>từ nội dung đến cộng tác.</em>
        </h2>
        <ol className={styles.workflow}>
          {workflow.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section
        className={`${styles.container} ${styles.section} ${styles.audience}`}
        aria-labelledby="audience-title"
        data-reveal
      >
        <div>
          <p className={styles.kicker}>ĐƯỢC XÂY DỰNG CHO CỘNG ĐỒNG HỌC TẬP</p>
          <h2 id="audience-title">
            Học viên. Giảng viên.
            <br />
            <em>Cùng một không gian.</em>
          </h2>
        </div>
        <div className={styles.audienceDetails}>
          <p>
            <Check size={18} /> Học viên: tiếp cận nội dung, ôn tập và đặt câu
            hỏi.
          </p>
          <p>
            <Check size={18} /> Giảng viên: tổ chức khóa học và hoạt động đánh
            giá.
          </p>
          <p>
            <Check size={18} /> Nhóm học tập: chia sẻ ghi chú và cộng tác qua
            Workspace.
          </p>
        </div>
      </section>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div>
            <span className={styles.brand}>BDC Hub.</span>
            <p>Một dự án của Big Data Club, Đại học Bách Khoa TP.HCM.</p>
          </div>
          <Link href="/lms" prefetch={false} className={styles.primary}>
            Bắt đầu học tập <ArrowRight size={17} />
          </Link>
          <Link href="/" prefetch={false} className={styles.textButton}>
            Về Big Data Club
          </Link>
        </div>
      </footer>
    </AmbientEffects>
  );
}
