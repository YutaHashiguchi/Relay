import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
>;