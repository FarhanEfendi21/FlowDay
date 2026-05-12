"use client"

import Avatar from "boring-avatars"
import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  seed?: string | null              // Unique seed for consistent avatar
  imageUrl?: string | null
  size?: number
  className?: string
  variant?: "marble" | "beam" | "pixel" | "sunset" | "ring" | "bauhaus"
  colors?: string[]
}

/**
 * UserAvatar component that displays user profile picture or generates
 * a unique boring-avatar based on the user's seed (or name as fallback)
 */
export function UserAvatar({
  name,
  seed,
  imageUrl,
  size = 40,
  className,
  variant = "beam",
  colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"]
}: UserAvatarProps) {
  // Get initials for fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(name)
  
  // Use seed if available, otherwise fallback to name
  // This ensures consistent avatar across sessions
  const avatarKey = seed || name

  return (
    <AvatarRoot className={cn("", className)} style={{ width: size, height: size }}>
      {imageUrl && (
        <AvatarImage src={imageUrl} alt={name} />
      )}
      <AvatarFallback className="bg-transparent border-0 p-0">
        <Avatar
          size={size}
          name={avatarKey}
          variant={variant}
          colors={colors}
        />
      </AvatarFallback>
    </AvatarRoot>
  )
}

/**
 * Simple text-based avatar fallback (for backwards compatibility)
 */
export function SimpleAvatar({
  name,
  className,
  style
}: {
  name: string
  className?: string
  style?: React.CSSProperties
}) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <AvatarRoot className={className}>
      <AvatarFallback style={style}>
        {getInitials(name)}
      </AvatarFallback>
    </AvatarRoot>
  )
}
