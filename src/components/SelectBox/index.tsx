import type { SelectBoxProps } from "./type";
import styles from "./styles.module.css";

export default function SelectBox({
  id,
  label,
  options,
  placeholder = "選択してください",
  error,
  className,
  ...selectProps
}: SelectBoxProps) {
  const selectClassName = [
    styles.select,
    error ? styles.errorSelect : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      <label
        htmlFor={id}
        className={styles.label}
      >
        {label}
      </label>

      <div className={styles.selectWrapper}>
        <select
          id={id}
          {...selectProps}
          className={selectClassName}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : undefined
          }
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

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