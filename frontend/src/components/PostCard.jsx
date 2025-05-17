"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Trash2 } from "lucide-react"
import { useUserStore } from "../store/userStore"
import LikeButton from "./LikeButton"

export default function PostCard({
  id,
  user,
  title, // Ajout de la prop title
  content,
  type,
  location,
  image,
  comments,
  createdAt,
  onDelete,
  onEdit,
  onAddComment,
  likeCount = 0,
  userHasLiked = false,
}) {
  const { token, username } = useUserStore() // Ajout de username pour vérifier si l'utilisateur est propriétaire du post

  // Correction : fallback si username est undefined
  let currentUsername = username
  if (!currentUsername) {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      if (userData && userData.username) {
        currentUsername = userData.username
      }
    } catch {}
  }

  const [showMenu, setShowMenu] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    type: "",
    location: "",
    file: null,
  })
  const [commentInput, setCommentInput] = useState("")
  const [commentList, setCommentList] = useState(Array.isArray(comments) ? comments : [])
  const [sending, setSending] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const commentInputRef = useRef(null)
  const [isOwner, setIsOwner] = useState(false)
  const [likesCount, setLikesCount] = useState(likeCount)
  const [hasLiked, setHasLiked] = useState(userHasLiked)

  useEffect(() => {
    if (user && currentUsername) {
      setIsOwner(user.username === currentUsername)
    } else {
      setIsOwner(false)
    }
    // DEBUG TEMPORAIRE : Affiche le username courant et celui du post
    console.log('username connecté:', currentUsername, '| username du post:', user.username)
  }, [user, currentUsername])

  if (!user) {
    console.error("User data is missing:", { id, user })
    return <div className="alert alert-danger">Error: User data is missing.</div>
  }

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce post ?")) return
    try {
      const response = await fetch(`http://localhost:8000/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      if (onDelete) onDelete(id)
    } catch (err) {
      alert("Erreur lors de la suppression du post.")
    }
    setShowMenu(false)
  }

  const openEditForm = () => {
    setEditData({
      title: title || '', // Utilise la prop title du post
      content: content || "",
      type: type || "texte",
      location: location || "",
      file: null,
    })
    setShowEditForm(true)
    setShowMenu(false)
  }

  const handleEditChange = (e) => {
    const { name, value, files } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append("title", editData.title)
      formData.append("content", editData.content)
      formData.append("type", editData.type)
      formData.append("location", editData.location)
      if (editData.file) formData.append("file", editData.file)
      const response = await fetch(`http://localhost:8000/posts/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!response.ok) throw new Error("Erreur lors de la modification")
      const updatedPost = await response.json()
      if (onEdit) onEdit(updatedPost)
      setShowEditForm(false)
    } catch (err) {
      alert("Erreur lors de la modification du post.")
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    setSending(true)
    try {
      const formData = new FormData()
      formData.append("content", commentInput)

      // Utiliser l'endpoint spécifique au post pour ajouter un commentaire
      const response = await fetch(`http://localhost:8000/posts/${id}/comments/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire")

      const newComment = await response.json()

      // Mettre à jour la liste locale des commentaires
      setCommentList((prev) => [...prev, newComment])

      // Notifier le composant parent (Feed) du nouveau commentaire
      if (onAddComment) {
        onAddComment(newComment)
      }

      setCommentInput("")
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err)
      alert("Erreur lors de l'ajout du commentaire.")
    } finally {
      setSending(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return

    try {
      const response = await fetch(`http://localhost:8000/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Erreur lors de la suppression du commentaire")

      // Mettre à jour la liste locale des commentaires
      setCommentList((prev) => prev.filter((comment) => comment.id !== commentId))
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire:", err)
      alert("Erreur lors de la suppression du commentaire.")
    }
  }

  const handleLikeToggle = async () => {
    try {
      const method = hasLiked ? "DELETE" : "POST"
      const response = await fetch(`http://localhost:8000/posts/${id}/like`, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Erreur lors de l'action de like")

      // Update local state
      setHasLiked(!hasLiked)
      setLikesCount((prevCount) => (hasLiked ? prevCount - 1 : prevCount + 1))
    } catch (err) {
      console.error("Erreur lors de l'action de like:", err)
      alert("Erreur lors de l'action de like.")
    }
  }

  const handleCommentIconClick = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }

  // Affichage du média selon le type
  let media = null
  if (type === "image" && image) {
    media = (
      <img
        src={image || "/placeholder.svg"}
        className="img-fluid w-100 rounded-0"
        alt="Post content"
        style={{ objectFit: "cover", maxHeight: "400px" }}
      />
    )
  } else if (type === "video" && image) {
    media = (
      <video controls className="w-100" style={{ maxHeight: "400px" }}>
        <source src={image} type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>
    )
  } else if (type === "pdf" && image) {
    media = (
      <div className="text-center my-3 p-3" style={{ background: "#f8f9fa", borderRadius: "8px" }}>
        <div className="d-flex align-items-center justify-content-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="red"
            className="bi bi-file-pdf me-2"
            viewBox="0 0 16 16"
          >
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
            <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z" />
          </svg>
          <span style={{ fontSize: "18px", fontWeight: "500" }}>Document PDF</span>
        </div>
        <a href={image} target="_blank" rel="noopener noreferrer" className="btn btn-danger">
          Voir le PDF
        </a>
      </div>
    )
  }

  // Gestion du menu 3 points
  const handleMenuClick = (e) => {
    e.stopPropagation()
    setShowMenu((prev) => !prev)
  }
  const handleCloseMenu = () => setShowMenu(false)

  return (
    <div
      className="card mb-4"
      style={{
        maxWidth: "470px",
        margin: "auto",
        borderRadius: "16px",
        border: "1px solid #dbdbdb",
        boxShadow: "none",
        background: "#fff",
        position: "relative",
      }}
    >
      <div
        className="card-header bg-white d-flex align-items-center border-0 pb-0 justify-content-between"
        style={{ borderBottom: "1px solid #efefef", borderRadius: "16px 16px 0 0", padding: "12px 16px" }}
      >
        <div className="d-flex align-items-center">
          <img
            src={user.avatar || "https://via.placeholder.com/40"}
            className="rounded-circle me-2"
            alt={user.username}
            style={{
              width: "36px",
              height: "36px",
              objectFit: "cover",
              border: "1.5px solid #dbdbdb",
              boxShadow: "none",
            }}
          />
          <div>
            <strong style={{ fontSize: "15px" }}>{user.username}</strong>
            <br />
            <small className="text-muted" style={{ fontSize: "12px" }}>
              {new Date(createdAt).toLocaleDateString()}{" "}
              {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </small>
          </div>
        </div>
        {isOwner && (
          <div style={{ position: "relative" }}>
            <button
              className="btn btn-link p-0"
              style={{ fontSize: 22, color: "#888", background: "none", border: "none" }}
              onClick={handleMenuClick}
              aria-label="Options"
            >
              &#8942;
            </button>
            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: 30,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  zIndex: 10,
                  minWidth: 120,
                }}
              >
                <button
                  className="dropdown-item"
                  style={{ width: "100%", textAlign: "left", padding: "8px 16px", border: "none", background: "none" }}
                  onClick={() => {
                    openEditForm();
                    setShowMenu(false);
                  }}
                >
                  Modifier
                </button>
                <button
                  className="dropdown-item"
                  style={{ width: "100%", textAlign: "left", padding: "8px 16px", border: "none", background: "none", color: "#d9534f" }}
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditForm ? (
        <div className="card-body">
          <form onSubmit={handleEditSubmit}>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                placeholder="Titre"
                required
              />
            </div>
            <div className="mb-2">
              <textarea
                className="form-control"
                name="content"
                value={editData.content}
                onChange={handleEditChange}
                rows="3"
                placeholder="Contenu"
                required
              />
            </div>
            <div className="mb-2">
              <select className="form-select" name="type" value={editData.type} onChange={handleEditChange}>
                <option value="texte">Texte</option>
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                name="location"
                value={editData.location}
                onChange={handleEditChange}
                placeholder="Localisation"
              />
            </div>
            <div className="mb-2">
              <input
                type="file"
                className="form-control"
                name="file"
                onChange={handleEditChange}
                accept="image/*,video/*,.pdf"
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">
                Enregistrer
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {media}
          <div className="card-body py-2 px-3" style={{ paddingBottom: 0 }}>
            <div className="d-flex mb-2 gap-3 align-items-center" style={{ padding: "4px 0" }}>
              <LikeButton
                postId={id}
                initialLikes={likesCount}
                initialLiked={hasLiked}
                onLikeChange={(newLiked, newCount) => {
                  setHasLiked(newLiked)
                  setLikesCount(newCount)
                }}
              />
              <MessageCircle size={22} style={{ cursor: "pointer" }} onClick={handleCommentIconClick} />
            </div>
            <p className="mb-1" style={{ fontSize: "15px" }}>
              <strong>{user.username}</strong> {content}
            </p>
            <small className="text-muted d-block mb-2" style={{ fontSize: "12px" }}>
              {location || "Lieu inconnu"} · {type || "Type inconnu"}
            </small>
            <hr style={{ margin: "8px 0", borderColor: "#efefef" }} />
            <div className="mb-2">
              {commentList.length === 0 && (
                <div className="text-muted" style={{ fontSize: "14px" }}>
                  Aucun commentaire
                </div>
              )}
              {commentList.length > 2 && !showAllComments && (
                <div style={{ marginBottom: 6 }}>
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    style={{ fontSize: "14px", textDecoration: "none", color: "#aaa" }}
                    onClick={() => setShowAllComments(true)}
                  >
                    Afficher les {commentList.length} commentaires
                  </button>
                </div>
              )}
              {(showAllComments ? commentList : commentList.slice(-2)).map((comment, idx) => {
                const user = comment.user || {}
                let commentAvatar = user.photo || "https://via.placeholder.com/32"
                if (user.photo && !user.photo.startsWith("http")) {
                  commentAvatar = `http://localhost:8000/images/${user.photo.split("/").pop()}`
                }

                // Vérifier si l'utilisateur actuel est l'auteur du commentaire
                const isCommentOwner = user.username === username

                return (
                  <div key={comment.id || idx} className="d-flex align-items-start mb-2" style={{ gap: "10px" }}>
                    <a href={`/profile/${user.id || ""}`} style={{ textDecoration: "none" }}>
                      <img
                        src={commentAvatar || "/placeholder.svg"}
                        alt="avatar"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #efefef",
                          marginTop: 2,
                        }}
                      />
                    </a>
                    <div
                      style={{
                        background: "#fafafa",
                        borderRadius: "14px",
                        padding: "8px 14px",
                        maxWidth: "340px",
                        width: "100%",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <a
                            href={`/profile/${user.id || ""}`}
                            style={{ fontSize: "14px", fontWeight: 600, color: "#262626", textDecoration: "none" }}
                          >
                            {user.username || "Utilisateur"}
                          </a>
                          <span style={{ fontSize: "14px", marginLeft: 6 }}>{comment.content}</span>
                        </div>
                        {isCommentOwner && (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm p-0"
                              style={{ color: "#777" }}
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      {comment.createdAt && (
                        <div>
                          <small className="text-muted" style={{ fontSize: "12px" }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <form onSubmit={handleAddComment} className="d-flex align-items-center mt-2" style={{ gap: "8px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ajouter un commentaire..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  style={{ borderRadius: "14px", background: "#fafafa", fontSize: "14px", border: "1px solid #efefef" }}
                  disabled={sending}
                  ref={commentInputRef}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: "999px", padding: "6px 18px", fontWeight: 500 }}
                  disabled={sending || !commentInput.trim()}
                >
                  {sending ? "..." : "Envoyer"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
