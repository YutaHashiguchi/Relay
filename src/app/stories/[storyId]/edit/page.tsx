import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import StoryEditForm from "./_components/StoryEditForm";
import styles from "../../new/styles.module.css";

type StoryEditPageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function StoryEditPage({ params }: StoryEditPageProps) {
  const { storyId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: story, error } = await supabase
    .from("stories")
    .select(
      `
        id,
        author_id,
        title,
        synopsis,
        genre_slug
      `,
    )
    .eq("id", storyId)
    .single();

  if (error || !story) {
    notFound();
  }

  // 作成者本人以外は編集ページを開けない
  if (story.author_id !== user.id) {
    redirect(`/stories/${storyId}`);
  }

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

          <StoryEditForm story={story} />
        </section>
      </div>
    </main>
  );
}
