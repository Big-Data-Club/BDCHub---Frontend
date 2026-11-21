import Link from "@/lib/tenant/Link";
import clubData from "@/data/clubData.json";
import styles from "./landing.module.css";

type Project = (typeof clubData.projects)[number];

function ProjectCards({ projects }: { projects: Project[] }) {
  return (
    <div className={styles.projectGrid}>
      {projects.map((project) => (
        <article key={project.id} className={styles.projectCard}>
          <h4>{project.projectName}</h4>
          <p>{project.desc}</p>
          {(project.projectShowcaseUrl || project.githubUrl) && (
            <div className={styles.projectLinks}>
              {project.projectShowcaseUrl && (
                <Link
                  href={project.projectShowcaseUrl}
                  prefetch={false}
                  className={styles.textLink}
                >
                  Tìm hiểu dự án
                  <span className={styles.srOnly}> {project.projectName}</span>
                </Link>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textLink}
                >
                  GitHub
                  <span className={styles.srOnly}> {project.projectName}</span>
                </a>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export function ProjectShowcase() {
  return (
    <section
      id="projects"
      className={`${styles.section} ${styles.container}`}
      aria-labelledby="projects-title"
    >
      <div className={styles.sectionHeading} data-reveal>
        <p className={styles.eyebrow}>Dự án và hướng nghiên cứu</p>
        <h2 id="projects-title">
          Bắt đầu từ bài toán.
          <br />
          <em>Cùng tìm cách giải.</em>
        </h2>
        <p className={styles.projectIntro}>
          Có những công cụ đang được sử dụng, có những hướng phát triển tiếp từ
          hệ thống và dữ liệu đã có. Cũng có những câu hỏi còn cần thử nghiệm.
          Đây là các bài toán chúng mình muốn cùng học, làm và kiểm chứng.
        </p>
      </div>
      {clubData.projectGroups.map((group, index) => {
        const projects = clubData.projects.filter(
          (project) => project.group === group.id,
        );
        if (index === 0)
          return (
            <div key={group.id} className={styles.projectGroup}>
              <div className={styles.projectGroupHeading}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <ProjectCards projects={projects} />
            </div>
          );
        return (
          <details key={group.id} className={styles.projectGroup}>
            <summary className={styles.projectGroupHeading}>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </summary>
            <ProjectCards projects={projects} />
          </details>
        );
      })}
    </section>
  );
}
