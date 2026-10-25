import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import StoryEditForm from "./_components/StoryEditForm";
import type { StoryEditPageProps } from "./type";

import styles from "../../new/styles.module.css";

export default async function StoryEditPage({ params }: StoryEditPageProps) {
  const { storyId } = await params;

  const storyIdNumber = Number(storyId);

  if (!Number.isInteger(storyIdNumber) || storyIdNumber <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select(
      `
        id,
        user_id,
        title,
        summary
      `,
    )
    .eq("id", storyIdNumber)
    .single();

  if (storyError || !story) {
    notFound();
  }

  // 作成者本人以外は編集ページを開けない
  if (story.user_id !== user.id) {
    redirect(`/stories/${storyId}`);
  }

  const { data: storyGenre, error: storyGenreError } = await supabase
    .from("story_genres")
    .select(
      `
        genres (
          slug
        )
      `,
    )
    .eq("story_id", storyIdNumber)
    .limit(1)
    .maybeSingle();

  if (storyGenreError) {
    console.error("Story genre fetch error:", storyGenreError);
    notFound();
  }

  const genreSlug = storyGenre?.genres?.slug ?? "";

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link href={`/stories/${storyId}`}>← 作品詳細へ戻る</Link>
        </div>

        <section className={styles.paper}>
          <p className={styles.eyebrow}>EDIT YOUR STORY</p>

          <h1 className={styles.title}>作品情報を編集</h1>

          <p className={styles.description}>
            作品のタイトルやあらすじを編集できます。
          </p>

          <div className={styles.divider}>
            <span>◆</span>
          </div>

          <StoryEditForm
            story={{
              id: story.id,
              title: story.title,
              summary: story.summary,
              genreSlug,
            }}
          />
        </section>
      </div>
    </main>
  );
}
