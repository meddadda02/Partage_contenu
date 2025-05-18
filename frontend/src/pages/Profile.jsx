"use client"

import { useState, useEffect } from "react"
import { FileText, Video, ImageIcon } from "lucide-react"
import MainLayout from "../components/MainLayout"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    bio: "",
    password: "",
    photo: null,
  })
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState("all") // "all", "images", "videos", "pdfs"

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      setError("No access token found.")
      setLoading(false)
      return
    }

    fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data")
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load user data.")
        setLoading(false)
      })

    // Récupérer les posts de l'utilisateur
    fetch("http://localhost:8000/posts/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts")
        return res.json()
      })
      .then((data) => {
        console.log("POSTS DATA:", data) // Debug: affiche la réponse brute
        setPosts(data)
      })
      .catch(() => {
        setPosts([])
      })
  }, [])

  const handleChange = (e) => {
    const { name, value, files, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")

    const data = new FormData()
    data.append("email", formData.email)
    data.append("bio", formData.bio)
    data.append("New_password", formData.password)
    if (formData.photo) data.append("photo", formData.photo)

    try {
      const response = await fetch("http://localhost:8000/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })

      if (!response.ok) throw new Error("Failed to update user")

      const result = await response.json()
      setUser(result.user)
      setIsEditing(false)
    } catch {
      setError("Failed to update profile.")
    }
  }

  const handleDelete = async () => {
    const token = localStorage.getItem("access_token")
    if (!window.confirm("Are you sure you want to delete your account?")) return

    try {
      const res = await fetch("http://localhost:8000/user/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to delete account")

      alert("Account deleted.")
      window.location.href = "/login"
    } catch {
      setError("Failed to delete account.")
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error-message">{error}</div>
  if (!user) return <div>No user data found.</div>

  const photoUrl = user.photo || "https://via.placeholder.com/140"

  const defaultImage = "/default-image.jpg" // Place cette image dans public/
  const stats = {
    posts: user.posts_count || posts.length || 0,
    followers: user.followers_count || 340,
    following: user.following_count || 180,
  }

  // Préparer les médias pour l'affichage
  const processMediaUrl = (post) => {
    let mediaUrl = post.file_url
    if (mediaUrl && !mediaUrl.startsWith("http")) {
      mediaUrl = `http://localhost:8000/images/${mediaUrl.split("/").pop()}`
    }
    return mediaUrl || defaultImage
  }

  // Filtrer les posts selon le type sélectionné
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return post.file_url
    if (activeTab === "images") return post.type === "image" && post.file_url
    if (activeTab === "videos") return post.type === "video" && post.file_url
    if (activeTab === "pdfs") return post.type === "pdf" && post.file_url
    return false
  })

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: 650,
          width: "100%",
          margin: "40px auto",
          padding: "36px 28px 28px 28px",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 36,
          boxShadow: "0 16px 48px rgba(60,60,100,0.13)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          fontFamily: "Roboto, Segoe UI, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              boxShadow: "0 2px 12px #d6249f33",
            }}
          >
            <span
              style={{
                fontSize: 44,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "Grand Hotel, cursive",
              }}
            >
              S
            </span>
          </div>
          <h2
            style={{
              fontFamily: "Grand Hotel, cursive",
              fontSize: "2.7rem",
              color: "#222",
              fontWeight: 400,
              letterSpacing: 1,
              margin: 0,
            }}
          >
            Social Emsi
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <img
            src={photoUrl || "/placeholder.svg"}
            alt="Profile"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #fff",
              boxShadow: "0 4px 16px #d6249f22",
              marginBottom: 18,
              background: "#fafafa",
            }}
          />
          <div style={{ fontSize: "2.1rem", fontWeight: 700, color: "#222", marginBottom: 8 }}>{user.username}</div>
          <div style={{ display: "flex", gap: 24, marginBottom: 10, fontSize: 15, color: "#555" }}>
            <span>
              <b>{stats.posts}</b> posts
            </span>
            <span>
              <b>{stats.followers}</b> followers
            </span>
            <span>
              <b>{stats.following}</b> following
            </span>
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#666",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {user.bio || "No bio set."}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button
              onClick={() => {
                setFormData({
                  email: user.email || "",
                  bio: user.bio || "",
                  password: "",
                  photo: null,
                })
                setIsEditing(true)
              }}
              style={{
                background: "linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 2px 8px #d6249f22",
              }}
            >
              Editer
            </button>
            <button
              onClick={handleDelete}
              style={{
                background: "linear-gradient(90deg, #ed4956 0%, #f56040 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 2px 8px #ed495622",
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
        {isEditing && (
          <form
            onSubmit={handleUpdate}
            style={{
              background: "#fafafa",
              borderRadius: 14,
              padding: "22px 16px",
              marginBottom: 28,
              boxShadow: "0 2px 8px #e0e7ef55",
              maxWidth: 380,
              margin: "0 auto",
            }}
          >
            <label style={{ fontWeight: 500, color: "#555" }}>Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #dbdbdb",
                marginBottom: 8,
                marginTop: 2,
              }}
            />
            <label style={{ fontWeight: 500, color: "#555" }}>Bio :</label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #dbdbdb",
                marginBottom: 8,
                marginTop: 2,
              }}
            />
            <label style={{ fontWeight: 500, color: "#555" }}>Nouveau mot de passe :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #dbdbdb",
                marginBottom: 8,
                marginTop: 2,
              }}
            />
            <label style={{ fontWeight: 500, color: "#555" }}>Photo de profil :</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #dbdbdb",
                marginBottom: 10,
                marginTop: 2,
              }}
            />
            {formData.photo && (
              <img
                src={URL.createObjectURL(formData.photo) || "/placeholder.svg"}
                alt="Aperçu"
                style={{
                  display: "block",
                  margin: "10px auto",
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #dbdbdb",
                  background: "#eee",
                }}
              />
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                margin: "18px 0 0 0",
                padding: "10px 0",
                fontSize: "1.1rem",
                borderRadius: 8,
                background: "linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)",
                color: "#fff",
                border: "none",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 2px 8px #d6249f22",
              }}
            >
              Sauvegarder
            </button>
          </form>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18 }}>
          <button
            className={`profile-ig-tab${activeTab === "all" ? " active" : ""}`}
            onClick={() => setActiveTab("all")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              background:
                activeTab === "all"
                  ? "linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)"
                  : "#f0f0f0",
              color: activeTab === "all" ? "#fff" : "#333",
              border: "none",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            Tous
          </button>
          <button
            className={`profile-ig-tab${activeTab === "images" ? " active" : ""}`}
            onClick={() => setActiveTab("images")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              background:
                activeTab === "images"
                  ? "linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)"
                  : "#f0f0f0",
              color: activeTab === "images" ? "#fff" : "#333",
              border: "none",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            Images
          </button>
          <button
            className={`profile-ig-tab${activeTab === "videos" ? " active" : ""}`}
            onClick={() => setActiveTab("videos")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              background:
                activeTab === "videos"
                  ? "linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)"
                  : "#f0f0f0",
              color: activeTab === "videos" ? "#fff" : "#333",
              border: "none",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            Vidéos
          </button>
          <button
            className={`profile-ig-tab${activeTab === "pdfs" ? " active" : ""}`}
            onClick={() => setActiveTab("pdfs")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              background:
                activeTab === "pdfs"
                  ? "linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)"
                  : "#f0f0f0",
              color: activeTab === "pdfs" ? "#fff" : "#333",
              border: "none",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            PDFs
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 18 }}>
          {filteredPosts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888" }}>Aucun contenu à afficher</div>
          ) : (
            filteredPosts.map((post, idx) => {
              const mediaUrl = processMediaUrl(post)
              if (post.type === "image") {
                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#eee",
                      boxShadow: "0 2px 8px #e0e7ef55",
                    }}
                  >
                    <img
                      src={mediaUrl || "/placeholder.svg"}
                      alt="post"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )
              } else if (post.type === "video") {
                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#eee",
                      boxShadow: "0 2px 8px #e0e7ef55",
                    }}
                  >
                    <video
                      src={mediaUrl}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      muted
                    />
                  </div>
                )
              } else if (post.type === "pdf") {
                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#f8f9fa",
                      boxShadow: "0 2px 8px #e0e7ef55",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 18,
                    }}
                  >
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#495057",
                        textDecoration: "none",
                        fontSize: 15,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 32,
                          color: "#dc3545",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        📄
                      </span>
                      Voir le PDF
                    </a>
                  </div>
                )
              } else {
                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#eee",
                      boxShadow: "0 2px 8px #e0e7ef55",
                    }}
                  >
                    <img
                      src={defaultImage || "/placeholder.svg"}
                      alt="post"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )
              }
            })
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default Profile
