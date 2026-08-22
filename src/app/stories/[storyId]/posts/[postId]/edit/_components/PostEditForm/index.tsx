"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import SubmitButton from "@/components/SubmitButton";
import Textarea from "@/components/Textarea";
import { createClient } from "@/lib/supabase/client";

import styles from "./styles.module.css";

type PostEditFormProps = {
  post: {
    id: string;
    story_id: string;
    body: string;
    position: number;
  };
};

export default function PostEditForm({ post }: PostEditFormProps) {
  const router = useRouter();

  const [body, setBody] = useState(post.body);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setErrorMessage("本文を入力してください。");
      return;
    }

    if (trimmedBody.length > 400) {
      setErrorMessage("本文は400文字以内で入力してください。");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          body: trimmedBody,
        })
        .eq("id", post.id);

      if (error) {
        console.error("Post update error:", error);

        setErrorMessage("本文の更新に失敗しました。");
        return;
      }

      router.push(`/stories/${post.story_id}`);

      router.refresh();
    } catch (error) {
      console.error("Post update error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Textarea
        id="body"
        name="body"
        label="本文"
        value={body}
        onChange={(event) => setBody(event.target.value)}
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
        <SubmitButton isLoading={isLoading} loadingText="更新中...">
          本文を保存する
        </SubmitButton>
      </div>
    </form>
  );
}
