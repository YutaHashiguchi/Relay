import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import StoryCreateForm from "./_components/StoryCreateForm";
import styles from "./styles.module.css";

export default async function NewStoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.paper}>
          <p className={styles.eyebrow}>Write a New Story</p>

          <h1 className={styles.title}>新しい物語を投稿</h1>

          <p className={styles.description}>
            あなたの一節から、誰かへと続いていく物語を始めましょう。
          </p>

          <div className={styles.divider}>
            <span>◆</span>
          </div>

          <StoryCreateForm />
        </section>
      </div>
    </main>
  );
}
