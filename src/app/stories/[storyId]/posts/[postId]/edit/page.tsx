import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PostEditForm from "./_components/PostEditForm";

import styles from "../../../../new/styles.module.css";

type PostEditPageProps = {
  params: Promise<{
    storyId: string;
    postId: string;
  }>;
};

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { storyId, postId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      story_id,
      author_id,
      body,
      position
    `,
    )
    .eq("id", postId)
    .eq("story_id", storyId)
    .single();

  if (error || !post) {
    notFound();
  }

  // このPostを書いた本人以外は編集不可
  if (post.author_id !== user.id) {
    redirect(`/stories/${storyId}`);
  }

  const { data: laterPost, error: laterPostError } = await supabase
    .from("posts")
    .select("id")
    .eq("story_id", storyId)
    .gt("position", post.position)
    .limit(1)
    .maybeSingle();

  if (laterPostError) {
    console.error("Later post fetch error:", laterPostError);
    redirect(`/stories/${storyId}`);
  }

  if (laterPost) {
    redirect(`/stories/${storyId}`);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link href={`/stories/${storyId}`}>← 作品詳細へ戻る</Link>
        </div>

        <section className={styles.paper}>
          <p className={styles.eyebrow}>EDIT YOUR POST</p>

          <h1 className={styles.title}>第{post.position}節を編集</h1>

          <p className={styles.description}>
            あなたが投稿した本文を編集できます。
          </p>

          <div className={styles.divider}>
            <span>◆</span>
          </div>

          <PostEditForm post={post} />
        </section>
      </div>
    </main>
  );
}
