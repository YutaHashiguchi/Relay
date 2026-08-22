import type { TextareaProps } from "./type";
import styles from "./styles.module.css";

export default function Textarea({
  id,
  label,
  helperText,
  error,
  className,
  ...textareaProps
}: TextareaProps) {
  const textareaClassName = [
    styles.textarea,
    error ? styles.errorTextarea : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelArea}>
        <label
          htmlFor={id}
          className={styles.label}
        >
          {label}
        </label>

        {helperText && (
          <span className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>

      <textarea
        id={id}
        {...textareaProps}
        className={textareaClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : undefined
        }
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className={styles.errorMessage}
        >
          {error}
        </p>
      )}
    </div>
  );
}