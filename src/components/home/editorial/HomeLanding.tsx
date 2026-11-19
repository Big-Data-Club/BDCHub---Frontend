import { researchAreas } from "./content";
import { ClubAbout } from "./ClubAbout";
import { ClubActivities } from "./ClubActivities";
import { AmbientEffects } from "@/components/common/ambient/AmbientEffects";
import { AmbientStars } from "@/components/common/ambient/AmbientStars";
import { ProjectShowcase } from "./ProjectShowcase";
import { ResearchList } from "./ResearchList";
import styles from "./landing.module.css";

export function HomeLanding() {
  return (
    <AmbientEffects className={styles.landing}>
      <section
        id="hero"
        className={`${styles.hero} ${styles.container}`}
        aria-labelledby="home-title"
      >
        <AmbientStars />
        <div className={styles.heroMeta}>
          <span>Cộng đồng học thuật tại HCMUT</span>
          <span>
            Đồng hành cùng{" "}
            <a
              href="https://hpcc.hcmut.edu.vn/"
              target="_blank"
              rel="noopener noreferrer"
            >
              HPC Lab
            </a>{" "}
            · Từ 2021
          </span>
        </div>
        <h1 id="home-title" className={styles.wordmark}>
          Big Data <em>Club.</em>
        </h1>
        <div
          className={styles.researchAreas}
          aria-label="Các lĩnh vực hoạt động"
        >
          {researchAreas.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
        <div className={styles.heroIntro}>
          <p className={styles.heroMotto}>
            Think Big.
            <br />
            <span>Speak Data.</span>
          </p>
          <div>
            <p className={styles.lead}>
              Cùng học hỏi, nghiên cứu và xây dựng sản phẩm trong thế giới dữ
              liệu.
            </p>
            <p className={styles.body}>
              Câu lạc bộ học thuật chuyên sâu tại Đại học Bách Khoa TP.HCM, kết
              nối những người quan tâm đến dữ liệu lớn, tính toán hiệu năng cao,
              AI, điện toán lượng tử và điện toán đám mây.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="#projects">
                Khám phá dự án
              </a>
              <a className={styles.secondaryButton} href="#activities">
                Hoạt động cộng đồng
              </a>
            </div>
          </div>
        </div>
      </section>

      <ClubAbout />

      <ClubActivities />

      <ProjectShowcase />
      <ResearchList />

      <section
        className={`${styles.connect} ${styles.container}`}
        aria-labelledby="connect-title"
        data-reveal
      >
        <p className={styles.eyebrow}>Kết nối cùng BDC</p>
        <h2 id="connect-title">
          Ý tưởng tiếp theo,
          <br />
          <em>có thể bắt đầu từ bạn.</em>
        </h2>
        <p className={styles.body}>
          Tìm hiểu hoạt động của câu lạc bộ, trao đổi ý tưởng nghiên cứu và cùng
          chia sẻ kiến thức.
        </p>
        <div className={styles.actions}>
          <a
            className={styles.primaryButton}
            href="https://facebook.com/BDCofHCMUT"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ghé thăm cộng đồng
          </a>
          <a className={styles.secondaryButton} href="mailto:bdc@hcmut.edu.vn">
            Liên hệ BDC
          </a>
        </div>
      </section>
    </AmbientEffects>
  );
}
