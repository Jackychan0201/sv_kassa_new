import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function handleError(error: unknown, userMessage?: string) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  let message = "Something went wrong. Please try again.";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  const displayMessage = userMessage || message;

  toast.error(displayMessage);
}
