import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PostDeleteButton from "./_components/PostDeleteButton";
import StoryDeleteButton from "./_components/StoryDeleteButton";
import StorySummary from "./_components/StorySummary";
import type { StoryDetailPageProps } from "./type";

import styles from "./styles.module.css";

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { storyId } = await params;

  const storyIdNumber = Number(storyId);

  if (!Number.isInteger(storyIdNumber) || storyIdNumber <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const { data: story, error } = await supabase
    .from("stories")
    .select(
      `
      id,
      user_id,
      title,
      summary,
      created_at,
      author:users (
        name
      ),
      story_genres (
        genres (
          name
        )
      ),
      posts:posts!posts_story_id_fkey (
  id,
  user_id,
  body,
  sequence_no,
  created_at,
  author:users (
    name
  )
)
      `,
    )
    .eq("id", storyIdNumber)
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
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  const isMyLock = Boolean(writingLock) && user?.id === writingLock?.user_id;

  const isLockedByOther =
    Boolean(writingLock) && user?.id !== writingLock?.user_id;

  const isOwner = user?.id === story.user_id;

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

  const posts = [...story.posts].sort((a, b) => a.sequence_no - b.sequence_no);

  const latestSequenceNo = posts.at(-1)?.sequence_no;

  const genreName = story.story_genres[0]?.genres?.name ?? "その他";

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link href="/stories">← 作品一覧へ</Link>
        </div>

        <article className={styles.paper}>
          <header className={styles.header}>
            <p className={styles.genre}>{genreName}</p>

            <h1 className={styles.title}>{story.title}</h1>

            <p className={styles.author}>
              作者：{story.author?.name ?? "名前未設定"}
            </p>

            {isOwner && (
              <>
                <Link
                  href={`/stories/${story.id}/edit`}
                  className={styles.editLink}
                >
                  作品情報を編集
                </Link>

                <StoryDeleteButton storyId={story.id} title={story.title} />
              </>
            )}

            {story.summary && (
              <p className={styles.synopsis}>{story.summary}</p>
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
                  <span>第{post.sequence_no}節</span>

                  <div className={styles.postMeta}>
                    <span>{post.author?.name ?? "名前未設定"}</span>

                    {user?.id === post.user_id &&
                      post.sequence_no === latestSequenceNo && (
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
                            position={post.sequence_no}
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
