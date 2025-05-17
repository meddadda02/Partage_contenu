// Service pour gérer les likes côté client

export async function likePost(postId, token) {
  const response = await fetch(`http://localhost:8000/posts/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Erreur lors de l'ajout du like")
  }

  return await response.json()
}

export async function unlikePost(postId, token) {
  const response = await fetch(`http://localhost:8000/posts/${postId}/like`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du like")
  }

  return await response.json()
}

export async function getPostLikes(postId, token) {
  const response = await fetch(`http://localhost:8000/posts/${postId}/likes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des likes")
  }

  return await response.json()
}

export async function hasUserLikedPost(postId, token) {
  const response = await fetch(`http://localhost:8000/posts/${postId}/liked`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Erreur lors de la vérification du like")
  }

  const data = await response.json()
  return data.has_liked
}
