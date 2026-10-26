"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import type { StoryDeleteButtonProps } from "./type";
import styles from "./styles.module.css";

export default function StoryDeleteButton({
  storyId,
  title,
}: StoryDeleteButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `「${title}」を削除しますか？\n投稿されているすべての節も削除されます。\nこの操作は取り消せません。`,
    );

    if (!isConfirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) {
        console.error("Story delete error:", error);
        setErrorMessage("作品の削除に失敗しました。");
        return;
      }

      router.push("/mypage");
      router.refresh();
    } catch (error) {
      console.error("Story delete error:", error);
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
        {isDeleting ? "削除中..." : "作品を削除"}
      </button>

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
