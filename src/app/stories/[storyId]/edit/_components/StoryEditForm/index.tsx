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

type StoryEditFormProps = {
  story: {
    id: string;
    title: string;
    synopsis: string | null;
    genre_slug: string;
  };
};

export default function StoryEditForm({ story }: StoryEditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(story.title);
  const [genre, setGenre] = useState(story.genre_slug);
  const [synopsis, setSynopsis] = useState(story.synopsis ?? "");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    const trimmedTitle = title.trim();
    const trimmedSynopsis = synopsis.trim();

    if (!trimmedTitle) {
      setErrorMessage("作品タイトルを入力してください。");
      return;
    }

    if (!genre) {
      setErrorMessage("ジャンルを選択してください。");
      return;
    }

    if (trimmedSynopsis.length > 200) {
      setErrorMessage("あらすじは200文字以内で入力してください。");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("stories")
        .update({
          title: trimmedTitle,
          synopsis: trimmedSynopsis || null,
          genre_slug: genre,
        })
        .eq("id", story.id);

      if (error) {
        console.error("Story update error:", error);

        setErrorMessage("作品情報の更新に失敗しました。");
        return;
      }

      router.push(`/stories/${story.id}`);
      router.refresh();
    } catch (error) {
      console.error("Story update error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
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
        rows={5}
        disabled={isLoading}
      />

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}

      <div className={styles.actions}>
        <SubmitButton isLoading={isLoading} loadingText="更新中...">
          変更を保存する
        </SubmitButton>
      </div>
    </form>
  );
}
