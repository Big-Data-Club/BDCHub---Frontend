import Image from "next/image";
import clubData from "@/data/clubData.json";
import styles from "./landing.module.css";

export function ClubActivities() {
  return (
    <section
      id="activities"
      className={`${styles.section} ${styles.activitySection}`}
      aria-labelledby="activities-title"
    >
      <div className={styles.container}>
        <div className={styles.sectionHeading} data-reveal>
          <p className={styles.eyebrow}>Hoạt động cộng đồng</p>
          <h2 id="activities-title">
            Gặp nhau.
            <br />
            <em>Cùng tiến xa hơn.</em>
          </h2>
          <p className={styles.body}>
            Những buổi chia sẻ kiến thức, kết nối thành viên và trải nghiệm học
            thuật tại BDC.
          </p>
        </div>
        <div className={styles.activityGrid}>
          {clubData.activities.map((activity) => (
            <article
              key={activity.id}
              className={styles.activityCard}
              data-reveal
            >
              <div className={styles.activityImage}>
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  width={1600}
                  height={activity.id === "1" ? 800 : 898}
                  sizes="(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 33vw"
                />
              </div>
              <div className={styles.activityCaption}>
                <span className={styles.eyebrow}>
                  {activity.type}
                  {activity.frequency ? ` · ${activity.frequency}` : ""}
                </span>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
