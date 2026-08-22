import Link from "next/link";

import type { GenreListProps } from "./type";
import styles from "./styles.module.css";

const defaultGenres = [
  {
    label: "ファンタジー",
    value: "fantasy",
  },
  {
    label: "恋愛",
    value: "romance",
  },
  {
    label: "ミステリー",
    value: "mystery",
  },
  {
    label: "SF",
    value: "science-fiction",
  },
  {
    label: "ホラー",
    value: "horror",
  },
  {
    label: "青春",
    value: "youth",
  },
  {
    label: "日常",
    value: "daily-life",
  },
  {
    label: "その他",
    value: "other",
  },
];

export default function GenreList({ genres = defaultGenres }: GenreListProps) {
  return (
    <div className={styles.genreList}>
      {genres.map((genre) => (
        <Link
          key={genre.value}
          href={`/stories?genre=${genre.value}`}
          className={styles.genreItem}
        >
          <span className={styles.ornament}>◆</span>

          <span>{genre.label}</span>
        </Link>
      ))}
    </div>
  );
}
