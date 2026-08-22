import Link from "next/link";

import type { StoryCardProps } from "./type";
import styles from "./styles.module.css";

export default function StoryCard({
  id,
  title,
  synopsis,
  genre,
  authorName,
  latestPost,
}: StoryCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.genre}>{genre}</span>

        <span className={styles.latestPost}>{latestPost}</span>
      </div>

      <h3 className={styles.title}>
        <Link href={`/stories/${id}`}>{title}</Link>
      </h3>

      <p className={styles.synopsis}>{synopsis}</p>

      <div className={styles.divider} />

      <div className={styles.footer}>
        <span className={styles.author}>作者：{authorName}</span>

        <Link href={`/stories/${id}`} className={styles.detailLink}>
          続きを読む
        </Link>
      </div>
    </article>
  );
}
