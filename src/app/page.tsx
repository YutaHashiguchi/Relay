import Link from "next/link";
import { Tangerine } from "next/font/google";

import GenreList from "@/components/GenreList";
import StoryCard from "@/components/StoryCard";

import styles from "./styles.module.css";

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const newStories = [
  {
    id: "1",
    title: "月のない夜",
    synopsis: "月が消えた夜、この街では誰も空を見上げなくなった。",
    genre: "ミステリー",
    authorName: "テストユーザー",
    latestPost: "2分前",
  },
  {
    id: "2",
    title: "最後の夏休み",
    synopsis: "高校最後の夏、僕たちは誰にも言えない秘密を見つけた。",
    genre: "青春",
    authorName: "小説好き",
    latestPost: "15分前",
  },
  {
    id: "3",
    title: "100年後の東京",
    synopsis: "西暦2126年。東京から人間の姿が消えていた。",
    genre: "SF",
    authorName: "Relay Writer",
    latestPost: "30分前",
  },
];

const popularStories = [
  {
    id: "4",
    title: "そして扉は開かれた",
    synopsis: "祖父から受け継いだ鍵が開けたのは、存在しないはずの部屋だった。",
    genre: "ファンタジー",
    authorName: "Story Maker",
    latestPost: "1時間前",
  },
  {
    id: "5",
    title: "明日、君を忘れる",
    synopsis: "毎朝、彼女は僕のことだけを忘れてしまう。",
    genre: "恋愛",
    authorName: "しおり",
    latestPost: "2時間前",
  },
  {
    id: "6",
    title: "午前零時の喫茶店",
    synopsis: "その店は、人生に迷った人の前にだけ現れる。",
    genre: "日常",
    authorName: "珈琲",
    latestPost: "3時間前",
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>RELAY NOVEL SOCIAL NETWORK</p>

        <h1 className={`${styles.heroLogo} ${tangerine.className}`}>Re:lay</h1>

        <h2 className={styles.heroTitle}>物語は、一人では終わらない。</h2>

        <p className={styles.heroDescription}>
          誰かが書いた物語の続きを、
          <br />
          あなたの400文字で紡いでいく。
        </p>

        <Link href="/stories" className={styles.heroButton}>
          物語を探す
        </Link>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span />
            <h2>新着の物語</h2>
            <span />
          </div>

          <div className={styles.storyGrid}>
            {newStories.map((story) => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>

          <div className={styles.more}>
            <Link href="/stories">新着作品をもっと見る →</Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span />
            <h2>人気の物語</h2>
            <span />
          </div>

          <div className={styles.storyGrid}>
            {popularStories.map((story) => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span />
            <h2>ジャンルから探す</h2>
            <span />
          </div>

          <GenreList />
        </section>
      </div>
    </main>
  );
}
