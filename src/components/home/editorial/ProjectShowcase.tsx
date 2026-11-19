import Link from "@/lib/tenant/Link";
import clubData from "@/data/clubData.json";
import styles from "./landing.module.css";

export function ProjectShowcase() {
  const otherProjects = clubData.projects.filter(({ id }) => id !== "dutylog");

  return (
    <section
      id="projects"
      className={`${styles.section} ${styles.container}`}
      aria-labelledby="projects-title"
    >
      <div className={styles.sectionHeading} data-reveal>
        <p className={styles.eyebrow}>Dự án nổi bật</p>
        <h2 id="projects-title">
          Học bằng cách làm.
          <br />
          <em>Thể hiện bằng sản phẩm.</em>
        </h2>
      </div>
      <div className={styles.projectGrid}>
        {otherProjects.map((project) => (
          <article key={project.id} className={styles.projectCard} data-reveal>
            <h3>{project.projectName}</h3>
            <p>{project.desc}</p>
            <Link
              href={project.projectShowcaseUrl}
              prefetch={false}
              className={styles.textLink}
            >
              Tìm hiểu dự án
              <span className={styles.srOnly}> {project.projectName}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
