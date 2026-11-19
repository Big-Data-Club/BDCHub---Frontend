import clubData from "@/data/clubData.json";
import styles from "./landing.module.css";

export function ResearchList() {
  return (
    <section
      id="publications"
      className={`${styles.section} ${styles.researchSection}`}
      aria-labelledby="publications-title"
    >
      <div className={styles.container}>
        <div className={styles.sectionHeading} data-reveal>
          <p className={styles.eyebrow}>Công bố khoa học</p>
          <h2 id="publications-title">
            Những câu hỏi lớn.
            <br />
            <em>Những bước tiến mới.</em>
          </h2>
          <p className={styles.body}>
            Các công trình nghiên cứu của thành viên và giảng viên hướng dẫn.
          </p>
        </div>
        <div>
          {clubData.publications.map((paper) => (
            <article className={styles.paper} key={paper.id} data-reveal>
              <span className={styles.paperYear}>{paper.year}</span>
              <div>
                <h3>
                  {paper.url ? (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {paper.title}
                    </a>
                  ) : (
                    paper.title
                  )}
                </h3>
                <p className={styles.paperAuthors}>{paper.authors}</p>
                <p className={styles.paperVenue}>{paper.publisher}</p>
                <details className={styles.citation}>
                  <summary>Trích dẫn</summary>
                  <p>
                    {paper.authors}. &quot;{paper.title}.&quot;{" "}
                    {paper.publisher} ({paper.year}).
                    {paper.doi ? ` DOI: ${paper.doi}.` : ""}
                  </p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
