"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { likePost, unlikePost } from "../services/LikeService"
import { useUserStore } from "../store/userStore"

export default function LikeButton({ postId, initialLikes = 0, initialLiked = false, onLikeChange }) {
  const [hasLiked, setHasLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useUserStore()

  const handleLikeToggle = async () => {
    if (isLoading) return

    setIsLoading(true)

    // Optimistic UI update
    const previousHasLiked = hasLiked
    const previousLikesCount = likesCount

    // Update UI immediately
    setHasLiked(!hasLiked)
    setLikesCount((prevCount) => (hasLiked ? prevCount - 1 : prevCount + 1))

    try {
      if (hasLiked) {
        await unlikePost(postId, token)
      } else {
        await likePost(postId, token)
      }

      // Notify parent component if needed
      if (onLikeChange) {
        onLikeChange(!hasLiked, hasLiked ? likesCount - 1 : likesCount + 1)
      }
    } catch (error) {
      console.error("Erreur lors de l'action de like:", error)

      // Revert changes if request failed
      setHasLiked(previousHasLiked)
      setLikesCount(previousLikesCount)

      alert("Erreur lors de l'action de like.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className="btn p-0 d-flex align-items-center"
      onClick={handleLikeToggle}
      disabled={isLoading}
      aria-label={hasLiked ? "Unlike post" : "Like post"}
    >
      <Heart
        size={22}
        className={`${hasLiked ? "text-danger fill-current" : "text-secondary"}`}
        fill={hasLiked ? "currentColor" : "none"}
        style={{ cursor: "pointer" }}
      />
      {likesCount > 0 && (
        <span className={`ms-1 ${hasLiked ? "text-danger" : "text-muted"}`} style={{ fontSize: "14px" }}>
          {likesCount}
        </span>
      )}
    </button>
  )
}
