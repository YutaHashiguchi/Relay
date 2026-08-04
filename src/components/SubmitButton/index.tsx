import type { SubmitButtonProps } from "./type";
import styles from "./styles.module.css";

export default function SubmitButton({
  children,
  isLoading = false,
  loadingText = "送信中...",
  disabled,
  className,
  ...buttonProps
}: SubmitButtonProps) {
  const buttonClassName = [styles.button, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...buttonProps}
      type="submit"
      disabled={disabled || isLoading}
      className={buttonClassName}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}
