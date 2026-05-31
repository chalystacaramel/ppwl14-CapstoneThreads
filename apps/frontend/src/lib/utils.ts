import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function defAvatar(username: string | undefined) {
  return "https://ui-avatars.com/api/?name=" + encodeURIComponent(username || "User") + "&background=random";
}