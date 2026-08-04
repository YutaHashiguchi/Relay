import type { InputHTMLAttributes } from "react";

export type InputProps = {
  id: string;
  label: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;
