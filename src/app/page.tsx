import Link from "next/link";
import { Tangerine } from "next/font/google";

import GenreList from "@/components/GenreList";
import StoryCard from "@/components/StoryCard";
import { createClient } from "@/lib/supabase/server";

import styles from "./styles.module.css";

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

type StoryRow = {
  id: string;
  title: string;
  synopsis: string | null;
  created_at: string;

  author: {
    display_name: string;
  } | null;

  genre: {
    name: string;
  } | null;

  posts: {
    id: string;
    position: number;
    created_at: string;
  }[];
};

function formatRelativeTime(dateString: string) {
  const createdAt = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - createdAt.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "たった今";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }

  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }

  if (diffDays < 7) {
    return `${diffDays}日前`;
  }

  return createdAt.toLocaleDateString("ja-JP");
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: storiesData, error } = await supabase
    .from("stories")
    .select(
      `
      id,
      title,
      synopsis,
      created_at,
      author:profiles (
        display_name
      ),
      genre:genres (
        name
      ),
      posts (
        id,
        position,
        created_at
      )
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Stories fetch error:", error);
  }

  const allStories = (storiesData ?? []) as unknown as StoryRow[];

  // 新着順で3作品
  const newStories = allStories.slice(0, 3).map((story) => {
    const latestPost = [...story.posts].sort(
      (a, b) => b.position - a.position,
    )[0];

    return {
      id: story.id,
      title: story.title,
      synopsis: story.synopsis ?? "",
      genre: story.genre?.name ?? "その他",
      authorName: story.author?.display_name ?? "名前未設定",
      latestPost: latestPost
        ? formatRelativeTime(latestPost.created_at)
        : formatRelativeTime(story.created_at),
    };
  });

  // Post数が多い順で3作品
  const popularStories = [...allStories]
    .sort((a, b) => {
      if (b.posts.length !== a.posts.length) {
        return b.posts.length - a.posts.length;
      }

      // Post数が同じなら新しい作品を上にする
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, 3)
    .map((story) => {
      const latestPost = [...story.posts].sort(
        (a, b) => b.position - a.position,
      )[0];

      return {
        id: story.id,
        title: story.title,
        synopsis: story.synopsis ?? "",
        genre: story.genre?.name ?? "その他",
        authorName: story.author?.display_name ?? "名前未設定",
        latestPost: latestPost
          ? formatRelativeTime(latestPost.created_at)
          : formatRelativeTime(story.created_at),
      };
    });

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
