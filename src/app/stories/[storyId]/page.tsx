import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import styles from "./styles.module.css";

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

  const isOwner = user?.id === story.author_id;

  const posts = [...story.posts].sort((a, b) => a.position - b.position);

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

          <div className={styles.posts}>
            {posts.map((post) => (
              <section key={post.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <span>第{post.position}節</span>

                  <div className={styles.postMeta}>
                    <span>{post.author?.display_name}</span>

                    {user?.id === post.author_id && (
                      <Link
                        href={`/stories/${story.id}/posts/${post.id}/edit`}
                        className={styles.postEditLink}
                      >
                        本文を編集
                      </Link>
                    )}
                  </div>
                </div>

                <p className={styles.body}>{post.body}</p>
              </section>
            ))}
          </div>

          <div className={styles.actions}>
            <Link
              href={`/stories/${story.id}/posts/new`}
              className={styles.continueButton}
            >
              この物語の続きを書く
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
