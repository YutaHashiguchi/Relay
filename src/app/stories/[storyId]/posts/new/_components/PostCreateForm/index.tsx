"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SubmitButton from "@/components/SubmitButton";
import Textarea from "@/components/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { PostCreateFormProps } from "./type";

import styles from "./styles.module.css";

export default function PostCreateForm({
  storyId,
  latestPosition,
}: PostCreateFormProps) {
  const router = useRouter();

  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [isCheckingLock, setIsCheckingLock] = useState(true);
  const [hasLock, setHasLock] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    let isMounted = true;

    const acquireLock = async () => {
      const { data, error } = await supabase.rpc("acquire_story_writing_lock", {
        p_story_id: storyId,
      });

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage("執筆状態の確認に失敗しました。");
        setHasLock(false);
        setIsCheckingLock(false);

        return;
      }

      setHasLock(Boolean(data));
      setIsCheckingLock(false);
    };

    acquireLock();

    const intervalId = setInterval(
      () => {
        acquireLock();
      },
      5 * 60 * 1000,
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [storyId]);

  const handleCancelWriting = async () => {
    setErrorMessage("");
    setIsCancelling(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("story_writing_locks")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Writing lock delete error:", error);

        setErrorMessage("執筆状態の解除に失敗しました。");

        return;
      }

      setHasLock(false);

      router.push(`/stories/${storyId}`);
      router.refresh();
    } catch (error) {
      console.error("Writing lock delete error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    if (!hasLock) {
      setErrorMessage("現在この作品を編集できません。");
      return;
    }

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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const nextPosition = latestPosition + 1;

      const { error: insertError } = await supabase.from("posts").insert({
        story_id: storyId,
        user_id: user.id,
        body: trimmedBody,
        sequence_no: nextPosition,
      });

      if (insertError) {
        console.error("Post insert error:", insertError);

        if (insertError.code === "23505") {
          setErrorMessage(
            "他のユーザーが先に続きを投稿したようです。作品ページを確認してください。",
          );
          return;
        }

        setErrorMessage("続きの投稿に失敗しました。");

        return;
      }

      if (nextPosition % 5 === 0) {
        void fetch(`/api/stories/${storyId}/summary`, {
          method: "POST",
          keepalive: true,
        }).catch((error) => {
          console.error("Story summary generation error:", error);
        });
      }

      // 投稿完了後にロック解除
      const { error: unlockError } = await supabase
        .from("story_writing_locks")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user.id);

      if (unlockError) {
        console.error("Writing lock delete error:", unlockError);
      }

      router.push(`/stories/${storyId}`);
      router.refresh();
    } catch (error) {
      console.error("Post insert error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingLock) {
    return (
      <div className={styles.lockMessage}>執筆状況を確認しています...</div>
    );
  }
  if (errorMessage) {
    return (
      <div className={styles.lockMessage}>
        <p>{errorMessage}</p>

        <p>ページを再読み込みして、もう一度お試しください。</p>
      </div>
    );
  }

  if (!hasLock) {
    return (
      <div className={styles.lockMessage}>
        <p>現在、ほかのユーザーがこの物語の続きを執筆しています。</p>

        <p>しばらくしてからもう一度お試しください。</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Textarea
        id="body"
        name="body"
        label={`第${latestPosition + 1}節`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="物語の続きを400文字以内で書いてください。"
        helperText={`${body.length} / 400文字`}
        maxLength={400}
        rows={14}
        disabled={isLoading || isCancelling}
        required
      />

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}

      <div className={styles.actions}>
        <SubmitButton isLoading={isLoading} loadingText="投稿中...">
          物語をつなぐ
        </SubmitButton>

        <button
          type="button"
          className={styles.cancelButton}
          onClick={handleCancelWriting}
          disabled={isLoading || isCancelling}
        >
          {isCancelling ? "解除中..." : "執筆をやめる"}
        </button>
      </div>
    </form>
  );
}
