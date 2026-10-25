import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import styles from "./styles.module.css";
import StorySummary from "./_components/StorySummary";
import PostDeleteButton from "./_components/PostDeleteButton";

type StoryDetailPageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { storyId } = await params;

  const supabase = await createClient();

  const { data: story, error } = await supabase
    .from("stories")
    .select(
      `
      id,
      author_id,
      title,
      synopsis,
      created_at,
      genre:genres (
        name
      ),
      author:profiles (
        display_name
      ),
      posts (
  id,
  author_id,
  body,
  position,
  created_at,
  author:profiles (
    display_name
  )
)
    `,
    )
    .eq("id", storyId)
    .single();

  if (error || !story) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 有効期限内の執筆ロックだけ取得
  const { data: writingLock } = await supabase
    .from("story_writing_locks")
    .select(
      `
    user_id,
    expires_at
    `,
    )
    .eq("story_id", story.id)
    .gt("expires_at", "now")
    .maybeSingle();

  const isMyLock = Boolean(writingLock) && user?.id === writingLock?.user_id;

  const isLockedByOther =
    Boolean(writingLock) && user?.id !== writingLock?.user_id;

  const isOwner = user?.id === story.author_id;

  const { data: storySummary } = await supabase
    .from("story_summaries")
    .select(
      `
    summary,
    summarized_until_position
    `,
    )
    .eq("story_id", story.id)
    .maybeSingle();

  const posts = [...story.posts].sort((a, b) => a.position - b.position);
  const latestPosition = posts.at(-1)?.position;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link href="/stories">← 作品一覧へ</Link>
        </div>

        <article className={styles.paper}>
          <header className={styles.header}>
            <p className={styles.genre}>{story.genre?.name}</p>

            <h1 className={styles.title}>{story.title}</h1>

            <p className={styles.author}>作者：{story.author?.display_name}</p>

            {isOwner && (
              <Link
                href={`/stories/${story.id}/edit`}
                className={styles.editLink}
              >
                作品情報を編集
              </Link>
            )}

            {story.synopsis && (
              <p className={styles.synopsis}>{story.synopsis}</p>
            )}

            <div className={styles.divider}>
              <span>◆</span>
            </div>
          </header>
          {storySummary && (
            <StorySummary
              summary={storySummary.summary}
              summarizedUntilPosition={storySummary.summarized_until_position}
            />
          )}

          <div className={styles.posts}>
            {posts.map((post) => (
              <section key={post.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <span>第{post.position}節</span>

                  <div className={styles.postMeta}>
                    <span>{post.author?.display_name}</span>

                    {user?.id === post.author_id &&
                      post.position === latestPosition && (
                        <>
                          <Link
                            href={`/stories/${story.id}/posts/${post.id}/edit`}
                            className={styles.postEditLink}
                          >
                            本文を編集
                          </Link>

                          <PostDeleteButton
                            postId={post.id}
                            storyId={story.id}
                            position={post.position}
                          />
                        </>
                      )}
                  </div>
                </div>

                <p className={styles.body}>{post.body}</p>
              </section>
            ))}
          </div>
          <div className={styles.actions}>
            {isLockedByOther ? (
              <div className={styles.lockedArea}>
                <span className={styles.disabledContinueButton}>
                  現在執筆中
                </span>

                <p className={styles.lockMessage}>
                  現在、ほかのユーザーが続きを執筆しています。
                </p>
              </div>
            ) : (
              <Link
                href={`/stories/${story.id}/posts/new`}
                className={styles.continueButton}
              >
                {isMyLock ? "執筆を続ける" : "この物語の続きを書く"}
              </Link>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
