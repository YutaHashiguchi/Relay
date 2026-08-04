import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
};
