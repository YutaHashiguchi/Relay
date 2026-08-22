import Link from "next/link";
import { Tangerine } from "next/font/google";

import StoryCreateForm from "./_components/StoryCreateForm";
import styles from "./styles.module.css";

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

export default function NewWorkPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.paper}>
          <p className={styles.eyebrow}>Write a New Story</p>

          <h1 className={styles.title}>新しい物語を投稿</h1>

          <p className={styles.description}>
            あなたの一節から、誰かへと続いていく 物語を始めましょう。
          </p>

          <div className={styles.divider}>
            <span>◆</span>
          </div>

          <StoryCreateForm />
        </section>
      </div>
    </main>
  );
}
