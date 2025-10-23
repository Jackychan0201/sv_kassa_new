import { Label } from "../atoms/label";
import { Spinner } from "../atoms/spinner";

interface LoadingFallbackProps {
  message?: string;
  height?: string | number;
}

export function LoadingFallback({ message = "Loading...", height = "25vh" }: LoadingFallbackProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-main)] w-full h-full">
      <div
        className="flex flex-col items-center justify-center gap-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] p-6 shadow-md animate-pulse"
        style={{ minHeight: height, minWidth: "300px" }}
      >
        <Label className="text-xl md:text-2xl text-[var(--color-text-primary)]">{message}</Label>
        <Spinner className="w-12 h-12 text-[var(--color-text-primary)]" />
      </div>
    </div>
  );
}
