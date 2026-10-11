"use client";

import { useState } from "react";

import type { StorySummaryProps, SummaryResponse } from "./type";
import styles from "./styles.module.css";

export default function StorySummary({
  storyId,
  isLoggedIn,
}: StorySummaryProps) {
  const [summary, setSummary] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setSummary("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/stories/${storyId}/summary`, {
        method: "POST",
      });

      const data = (await response.json()) as SummaryResponse;

      if (!response.ok) {
        setErrorMessage(data.error ?? "AI要約の生成に失敗しました。");

        return;
      }

      if (!data.summary) {
        setErrorMessage("AI要約を取得できませんでした。");

        return;
      }

      setSummary(data.summary);
    } catch (error) {
      console.error("Summary fetch error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.summaryArea}>
      <div className={styles.heading}>
        <span className={styles.icon}>✦</span>

        <h2 className={styles.title}>ここまでの物語</h2>

        <span className={styles.aiLabel}>AI SUMMARY</span>
      </div>

      <p className={styles.description}>
        これまでに紡がれた物語をAIが短くまとめます。
      </p>

      {!isLoggedIn ? (
        <p className={styles.loginMessage}>
          AI要約を利用するにはログインしてください。
        </p>
      ) : (
        <>
          <button
            type="button"
            className={styles.summaryButton}
            onClick={handleGenerateSummary}
            disabled={isLoading}
          >
            {isLoading ? "物語を読み解いています..." : "ここまでをAIで要約する"}
          </button>

          {errorMessage && (
            <p role="alert" className={styles.errorMessage}>
              {errorMessage}
            </p>
          )}

          {summary && (
            <div className={styles.result}>
              <p className={styles.resultLabel}>AIによる要約</p>

              <p className={styles.summary}>{summary}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
