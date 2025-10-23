"use client";

import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";

interface SheetFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export function SheetFormField({ id, label, value, onChange, placeholder, type = "text", disabled }: SheetFormFieldProps) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id} className="text-md text-[var(--color-text-primary)] ml-6">
        {label}:
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-[90%] mx-auto border-[var(--color-border-sheet)] text-[var(--color-text-primary)]"
        disabled={disabled}
      />
    </div>
  );
}
