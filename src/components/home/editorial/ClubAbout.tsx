import { clubValues } from "./content";
import styles from "./landing.module.css";

export function ClubAbout() {
  return (
    <section
      id="about"
      className={`${styles.section} ${styles.container}`}
      aria-labelledby="about-title"
    >
      <div className={styles.sectionHeading} data-reveal>
        <p className={styles.eyebrow}>Về câu lạc bộ</p>
        <h2 id="about-title">
          Từ sự tò mò.
          <br />
          <em>Đến điều có ích.</em>
        </h2>
      </div>
      <div className={styles.aboutGrid}>
        <div data-reveal>
          <p className={styles.lead}>
            Big Data Club (BDC) hoạt động dưới sự hướng dẫn chuyên môn trực tiếp
            của phòng thí nghiệm HPC Lab tại HCMUT.
          </p>
          <p className={styles.body}>
            Đồng hành cùng tinh thần Think Big, Speak Data và phương châm
            Learning by Doing, BDC tập trung nghiên cứu ứng dụng xử lý dữ liệu
            lớn, trí tuệ nhân tạo và tính toán hiệu năng cao.
          </p>
          <a
            className={styles.affiliation}
            href="https://hpcc.hcmut.edu.vn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tìm hiểu HPC Lab tại HCMUT
          </a>
          <dl className={styles.stats}>
            <div>
              <dt>Năm thành lập</dt>
              <dd>2021</dd>
            </div>
            <div>
              <dt>Thành viên</dt>
              <dd>50+</dd>
            </div>
            <div>
              <dt>Dự án &amp; HPC</dt>
              <dd>10+</dd>
            </div>
          </dl>
        </div>
        <div className={styles.values}>
          {clubValues.map((value) => (
            <article key={value.title} data-reveal>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
