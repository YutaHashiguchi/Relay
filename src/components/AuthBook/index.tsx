import Link from "next/link";
import { Tangerine } from "next/font/google";

import type { AuthBookProps } from "./type";
import styles from "./styles.module.css";

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

export default function AuthBook({
  eyebrow,
  title,
  description,
  children,
}: AuthBookProps) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={`${styles.logo} ${tangerine.className}`}>
            Re:lay
          </Link>

          <p className={styles.catchphrase}>
            物語をつないで、新しい世界をつくろう。
          </p>
        </header>

        <section className={styles.card}>
          <div className={styles.cardContent}>
            <p className={styles.chapter}>{eyebrow}</p>

            <h1 className={styles.title}>{title}</h1>

            <p className={styles.description}>{description}</p>

            <div className={styles.divider}>
              <span>◆</span>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
