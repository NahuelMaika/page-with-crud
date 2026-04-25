import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para obtener la URL de la imagen con cache busting
export function getImageUrl(url: string) {
  if(!url) return '';
  return `${url}?t=${new Date().getTime()}`;
  }