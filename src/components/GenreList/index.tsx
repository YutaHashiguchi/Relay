import Link from "next/link";

import type { GenreListProps } from "./type";
import styles from "./styles.module.css";
import { GENRE_OPTIONS } from "@/constants/genres";

export default function GenreList({ genres = GENRE_OPTIONS }: GenreListProps) {
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
