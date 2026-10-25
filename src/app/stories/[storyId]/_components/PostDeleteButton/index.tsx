"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import type { PostDeleteButtonProps } from "./type";
import styles from "./styles.module.css";

export default function PostDeleteButton({
  postId,
  storyId,
  position,
}: PostDeleteButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `第${position}節を削除しますか？\nこの操作は取り消せません。`,
    );

    if (!isConfirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) {
        console.error("Post delete error:", error);
        setErrorMessage("本文の削除に失敗しました。");
        return;
      }

      // 5節単位の要約と整合性が取れなくなるため、
      // 削除した節まで要約済みの場合は要約を削除する
      const { error: summaryDeleteError } = await supabase
        .from("story_summaries")
        .delete()
        .eq("story_id", storyId)
        .gte("summarized_until_position", position);

      if (summaryDeleteError) {
        console.error("Story summary delete error:", summaryDeleteError);
      }

      router.refresh();
    } catch (error) {
      console.error("Post delete error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "削除中..." : "本文を削除"}
      </button>

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
