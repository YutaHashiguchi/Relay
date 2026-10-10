import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PostCreateForm from "./_components/PostCreateForm";
import baseStyles from "../../../new/styles.module.css";
import styles from "./styles.module.css";

type LatestPost = {
  id: string;
  body: string;
  position: number;
  author: { display_name: string } | null;
};

type PostCreatePageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function PostCreatePage({ params }: PostCreatePageProps) {
  const { storyId } = await params;

  const supabase = await createClient();

  // ログインユーザー取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 対象の作品を取得
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select(
      `
      id,
      title
    `,
    )
    .eq("id", storyId)
    .single();

  if (storyError || !story) {
    notFound();
  }

  // 現在の最新Postを取得
  const { data: latestPost, error: postError } = await supabase
    .from("posts")
    .select(
      `
      id,
      body,
      position,
      author:profiles (
        display_name
      )
    `,
    )
    .eq("story_id", storyId)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .single()
    .overrideTypes<LatestPost>();

  if (postError || !latestPost) {
    notFound();
  }

  return (
    <main className={baseStyles.main}>
      <div className={baseStyles.container}>
        <div className={baseStyles.navigation}>
          <Link href={`/stories/${story.id}`}>← 作品詳細へ戻る</Link>
        </div>

        <section className={baseStyles.paper}>
          <p className={baseStyles.eyebrow}>CONTINUE THE STORY</p>

          <h1 className={baseStyles.title}>続きを書く</h1>

          <p className={baseStyles.description}>
            「{story.title}」の続きをつないでください。
          </p>

          <div className={baseStyles.divider}>
            <span>◆</span>
          </div>

          <div className={styles.latestPost}>
            <div className={styles.latestPostHeader}>
              <p className={styles.latestPostPosition}>
                第{latestPost.position}節
              </p>

              <p className={styles.latestPostAuthor}>
                作者：{latestPost.author?.display_name}
              </p>
            </div>

            <p className={styles.latestPostBody}>{latestPost.body}</p>
          </div>

          <PostCreateForm
            storyId={story.id}
            latestPosition={latestPost.position}
          />
        </section>
      </div>
    </main>
  );
}
