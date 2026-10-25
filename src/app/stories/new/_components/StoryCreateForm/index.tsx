"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/Input";
import SelectBox from "@/components/SelectBox";
import SubmitButton from "@/components/SubmitButton";
import Textarea from "@/components/Textarea";
import { createClient } from "@/lib/supabase/client";
import { GENRE_OPTIONS } from "@/constants/genres";
import styles from "./styles.module.css";

export default function StoryCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [body, setBody] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    const trimmedTitle = title.trim();
    const trimmedSynopsis = synopsis.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setErrorMessage("作品タイトルを入力してください。");
      return;
    }

    if (!genre) {
      setErrorMessage("ジャンルを選択してください。");
      return;
    }

    if (!trimmedBody) {
      setErrorMessage("最初の物語を入力してください。");
      return;
    }

    if (trimmedBody.length > 400) {
      setErrorMessage("本文は400文字以内で入力してください。");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      // ログインユーザーを取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Storyを作成
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .insert({
          author_id: user.id,
          title: trimmedTitle,
          synopsis: trimmedSynopsis || null,
          genre_slug: genre,
        })
        .select("id")
        .single();

      if (storyError || !story) {
        console.error(storyError);

        setErrorMessage("作品の作成に失敗しました。");
        return;
      }

      // 最初のPostを登録
      const { error: postError } = await supabase.from("posts").insert({
        story_id: story.id,
        author_id: user.id,
        body: trimmedBody,
        position: 1,
      });

      if (postError) {
        console.error(postError);

        // Postの登録に失敗した場合は、
        // 作成済みのStoryを削除する
        await supabase.from("stories").delete().eq("id", story.id);

        setErrorMessage("本文の投稿に失敗しました。");
        return;
      }

      // 作成したStoryの詳細ページへ移動
      router.push(`/stories/${story.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "通信に失敗しました。時間を置いてもう一度お試しください。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        id="title"
        name="title"
        label="作品タイトル"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="物語のタイトル"
        maxLength={80}
        disabled={isLoading}
        required
      />

      <SelectBox
        id="genre"
        name="genre"
        label="ジャンル"
        value={genre}
        onChange={(event) => setGenre(event.target.value)}
        options={GENRE_OPTIONS}
        disabled={isLoading}
        required
      />

      <Textarea
        id="synopsis"
        name="synopsis"
        label="あらすじ"
        value={synopsis}
        onChange={(event) => setSynopsis(event.target.value)}
        placeholder="物語の始まりや世界観を簡潔に紹介してください。"
        helperText={`${synopsis.length} / 200文字`}
        maxLength={200}
        rows={4}
        disabled={isLoading}
      />

      <Textarea
        id="body"
        name="body"
        label="最初の物語"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="物語の最初の一節を書いてください。"
        helperText={`${body.length} / 400文字`}
        maxLength={400}
        rows={14}
        disabled={isLoading}
        required
      />

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}

      <div className={styles.actions}>
        <SubmitButton isLoading={isLoading} loadingText="投稿中...">
          物語を投稿する
        </SubmitButton>
      </div>
    </form>
  );
}
