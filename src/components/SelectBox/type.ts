import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectBoxProps = {
  id: string;
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children">;
