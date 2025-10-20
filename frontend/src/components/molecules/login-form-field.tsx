"use client";

import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/atoms/input";

interface LoginFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LoginFormField({ id, label, type = "text", value, onChange, placeholder, className }: LoginFormFieldProps) {
  return (
    <div className="grid gap-1">
      <Label className="text-[var(--color-text-primary)]" htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full text-[var(--color-text-primary)] border-[var(--color-border-sheet)] ${className || ""}`}
      />
    </div>
  );
}
