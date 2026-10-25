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
import type { StoryEditFormProps } from "./type";

import styles from "./styles.module.css";

export default function StoryEditForm({ story }: StoryEditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(story.title);
  const [genre, setGenre] = useState(story.genreSlug);
  const [synopsis, setSynopsis] = useState(story.summary ?? "");

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
      const { data: genreData, error: genreError } = await supabase
        .from("genres")
        .select("id")
        .eq("slug", genre)
        .eq("is_active", true)
        .single();

      if (genreError || !genreData) {
        console.error("Genre fetch error:", genreError);
        setErrorMessage("ジャンル情報の取得に失敗しました。");
        return;
      }

      const { error: storyError } = await supabase
        .from("stories")
        .update({
          title: trimmedTitle,
          summary: trimmedSynopsis || null,
        })
        .eq("id", story.id);

      if (storyError) {
        console.error("Story update error:", storyError);
        setErrorMessage("作品情報の更新に失敗しました。");
        return;
      }

      const { data: storyGenre, error: storyGenreFetchError } = await supabase
        .from("story_genres")
        .select("id, genre_id")
        .eq("story_id", story.id)
        .limit(1)
        .maybeSingle();

      if (storyGenreFetchError) {
        console.error("Story genre fetch error:", storyGenreFetchError);
        setErrorMessage("ジャンル情報の更新に失敗しました。");
        return;
      }

      if (storyGenre) {
        const { error: storyGenreUpdateError } = await supabase
          .from("story_genres")
          .update({
            genre_id: genreData.id,
          })
          .eq("id", storyGenre.id);

        if (storyGenreUpdateError) {
          console.error("Story genre update error:", storyGenreUpdateError);
          setErrorMessage("ジャンル情報の更新に失敗しました。");
          return;
        }
      } else {
        const { error: storyGenreInsertError } = await supabase
          .from("story_genres")
          .insert({
            story_id: story.id,
            genre_id: genreData.id,
          });

        if (storyGenreInsertError) {
          console.error("Story genre insert error:", storyGenreInsertError);
          setErrorMessage("ジャンル情報の更新に失敗しました。");
          return;
        }
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
