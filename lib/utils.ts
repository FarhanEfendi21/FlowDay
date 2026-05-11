import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAvatarGradient(name: string): string {
  if (!name) return 'linear-gradient(135deg, #333333 0%, #111111 100%)';
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Calculate two distinct hues based on the hash
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360; // 40 degrees offset for the gradient
  
  // Use vibrant saturation and lightness for a premium look
  return `linear-gradient(135deg, hsl(${h1}, 80%, 60%) 0%, hsl(${h2}, 80%, 45%) 100%)`;
}
