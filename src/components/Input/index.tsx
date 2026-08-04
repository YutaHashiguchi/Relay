import type { InputProps } from "./type";
import styles from "./styles.module.css";

export default function Input({
  id,
  label,
  error,
  className,
  ...inputProps
}: InputProps) {
  const inputClassName = [
    styles.input,
    error ? styles.errorInput : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <input
        id={id}
        {...inputProps}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClassName}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
}
