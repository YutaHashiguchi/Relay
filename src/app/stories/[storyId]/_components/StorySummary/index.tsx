import type { StorySummaryProps } from "./type";

import styles from "./styles.module.css";

export default function StorySummary({
  summary,
  summarizedUntilPosition,
}: StorySummaryProps) {
  return (
    <section className={styles.summaryArea}>
      <div className={styles.heading}>
        <span className={styles.icon}>✦</span>

        <h2 className={styles.title}>ここまでの物語</h2>

        <span className={styles.aiLabel}>AI SUMMARY</span>
      </div>

      <div className={styles.result}>
        <p className={styles.resultLabel}>
          第{summarizedUntilPosition}節までをAIが要約
        </p>

        <p className={styles.summary}>{summary}</p>
      </div>
    </section>
  );
}
