import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import styles from "./styles.module.css";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  // 自分が作ったStory
  const { data: ownStoriesData } = await supabase
    .from("stories")
    .select(
      `
      id,
      title,
      summary,
      created_at,
      posts_count,
      story_genres (
        genres (
          name
        )
      )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const ownStories = ownStoriesData ?? [];

  // 自分が投稿したPostからstory_idを取得
  const { data: myPosts } = await supabase
    .from("posts")
    .select("story_id")
    .eq("user_id", user.id);

  const participatedStoryIds = [
    ...new Set((myPosts ?? []).map((post) => post.story_id)),
  ];

  const getParticipatedStories = async () => {
    if (participatedStoryIds.length === 0) {
      return [];
    }

    const { data: participatedStoriesData } = await supabase
      .from("stories")
      .select(
        `
        id,
        user_id,
        title,
        summary,
        created_at,
        posts_count,
        story_genres (
          genres (
            name
          )
        ),
        author:users (
          name
        )
        `,
      )
      .in("id", participatedStoryIds)
      .order("created_at", {
        ascending: false,
      });

    return (participatedStoriesData ?? []).filter(
      (story) => story.user_id !== user.id,
    );
  };

  const participatedStories = await getParticipatedStories();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.profile}>
          <p className={styles.eyebrow}>MY PAGE</p>

          <h1 className={styles.name}>{profile?.name ?? "名前未設定"}</h1>

          <p className={styles.email}>{user.email}</p>
        </section>

        <div className={styles.divider}>
          <span>◆</span>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>MY STORIES</p>

              <h2 className={styles.sectionTitle}>自分が作った物語</h2>
            </div>

            <Link href="/stories/new" className={styles.createLink}>
              新しい物語を書く
            </Link>
          </div>

          {ownStories.length === 0 ? (
            <div className={styles.empty}>
              <p>まだ作成した物語はありません。</p>
            </div>
          ) : (
            <div className={styles.storyGrid}>
              {ownStories.map((story) => {
                const genreName =
                  story.story_genres[0]?.genres?.name ?? "その他";

                return (
                  <article key={story.id} className={styles.storyCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.genre}>{genreName}</span>

                      <span className={styles.postCount}>
                        {story.posts_count}節
                      </span>
                    </div>

                    <Link
                      href={`/stories/${story.id}`}
                      className={styles.storyTitle}
                    >
                      {story.title}
                    </Link>

                    {story.summary && (
                      <p className={styles.synopsis}>{story.summary}</p>
                    )}

                    <div className={styles.cardActions}>
                      <Link
                        href={`/stories/${story.id}`}
                        className={styles.detailLink}
                      >
                        物語を読む
                      </Link>

                      <Link
                        href={`/stories/${story.id}/edit`}
                        className={styles.editLink}
                      >
                        作品情報を編集
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>JOINED STORIES</p>

              <h2 className={styles.sectionTitle}>参加した物語</h2>
            </div>
          </div>

          {participatedStories.length === 0 ? (
            <div className={styles.empty}>
              <p>まだ参加した物語はありません。</p>
            </div>
          ) : (
            <div className={styles.storyGrid}>
              {participatedStories.map((story) => {
                const genreName =
                  story.story_genres[0]?.genres?.name ?? "その他";

                return (
                  <article key={story.id} className={styles.storyCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.genre}>{genreName}</span>

                      <span className={styles.postCount}>
                        {story.posts_count}節
                      </span>
                    </div>

                    <Link
                      href={`/stories/${story.id}`}
                      className={styles.storyTitle}
                    >
                      {story.title}
                    </Link>

                    <p className={styles.author}>
                      作者：{story.author?.name ?? "名前未設定"}
                    </p>

                    {story.summary && (
                      <p className={styles.synopsis}>{story.summary}</p>
                    )}

                    <div className={styles.cardActions}>
                      <Link
                        href={`/stories/${story.id}`}
                        className={styles.detailLink}
                      >
                        物語を読む
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
