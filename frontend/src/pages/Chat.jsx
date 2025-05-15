"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../store/userStore"
import "./Chat.css"

// Configuration de l'API - MODIFIEZ CETTE PARTIE SELON VOTRE CONFIGURATION
const API_BASE_URL = "http://localhost:8000" // Remplacez par l'URL de votre API FastAPI

function Chat() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const messagesEndRef = useRef(null)
  const { isAuthenticated, token } = useUserStore()

  // Vérification du token
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    if (!token) {
      navigate("/login")
      return
    }
  }, [isAuthenticated, token, navigate])

  // Récupérer tous les utilisateurs
  useEffect(() => {
    fetchUsers()
  }, [])

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Rechercher des utilisateurs lorsque la requête de recherche change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchUsers()
      } else {
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/messages/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 401) {
        setError("Session expirée, veuillez vous reconnecter.")
        localStorage.removeItem("access_token")
        navigate("/login")
        return
      }
      if (!response.ok) throw new Error("Erreur HTTP: " + response.status)
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(`Impossible de charger les utilisateurs: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Rechercher des utilisateurs
  const searchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/messages/users/search/?q=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Log de la réponse pour le débogage
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`)
      }

      // Conversion du texte en JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erreur de parsing JSON:", e)
        throw new Error("La réponse du serveur n'est pas un JSON valide")
      }

      setUsers(data)
    } catch (err) {
      setError(`Erreur lors de la recherche: ${err.message}`)
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Récupérer les messages d'une conversation
  const fetchConversation = async (userId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Log de la réponse pour le débogage
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`)
      }

      // Conversion du texte en JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erreur de parsing JSON:", e)
        throw new Error("La réponse du serveur n'est pas un JSON valide")
      }

      setMessages(data)
    } catch (err) {
      setError(`Impossible de charger la conversation: ${err.message}`)
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Envoyer un nouveau message
  const sendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedUser) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          content: newMessage,
        }),
      })

      // Log de la réponse pour le débogage
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`)
      }

      // Conversion du texte en JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erreur de parsing JSON:", e)
        throw new Error("La réponse du serveur n'est pas un JSON valide")
      }

      setMessages([...messages, data])
      setNewMessage("")
    } catch (err) {
      setError(`Impossible d'envoyer le message: ${err.message}`)
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Modifier un message
  const updateMessage = async () => {
    if (!editingMessage || !editingMessage.content.trim()) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/messages/${editingMessage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editingMessage.content,
        }),
      })

      // Log de la réponse pour le débogage
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`)
      }

      // Conversion du texte en JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erreur de parsing JSON:", e)
        throw new Error("La réponse du serveur n'est pas un JSON valide")
      }

      setMessages(messages.map((msg) => (msg.id === data.id ? data : msg)))
      setEditingMessage(null)
    } catch (err) {
      setError(`Impossible de modifier le message: ${err.message}`)
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Supprimer un message
  const deleteMessage = async (messageId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/messages/message/${messageId}/soft`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Log de la réponse pour le débogage
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`)
      }

      setMessages(messages.filter((msg) => msg.id !== messageId))
    } catch (err) {
      setError(`Impossible de supprimer le message: ${err.message}`)
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Sélectionner un utilisateur et charger la conversation
  const handleSelectUser = (user) => {
    setSelectedUser(user)
    fetchConversation(user.id)
  }

  // Commencer à modifier un message
  const startEditMessage = (message) => {
    setEditingMessage({
      id: message.id,
      content: message.content,
    })
  }

  // Formater la date des messages (affiche seulement heure:min)
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Obtenir les initiales pour l'avatar
  const getInitials = (username) => {
    return username.charAt(0).toUpperCase()
  }

  return (
    <div className="chat-container">
      {/* Barre latérale avec la liste des utilisateurs */}
      <div className="users-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="users-list">
          {isLoading && !users.length ? (
            <div className="loading-indicator">Chargement...</div>
          ) : (
            <>
              {users.length === 0 ? (
                <div className="no-results">Aucun utilisateur trouvé</div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={`user-item ${selectedUser?.id === user.id ? "active" : ""}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar || "/placeholder.svg"} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">{getInitials(user.username)}</div>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Zone principale de conversation */}
      <div className="conversation-area">
        {selectedUser ? (
          <>
            <div className="conversation-header">
              <div className="user-avatar">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.username} />
                ) : (
                  <div className="avatar-placeholder">{getInitials(selectedUser.username)}</div>
                )}
              </div>
              <div className="user-info">
                <span className="username">{selectedUser.username}</span>
              </div>
            </div>

            <div className="messages-container">
              {isLoading && !messages.length ? (
                <div className="loading-indicator">Chargement des messages...</div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div className="no-messages">Aucun message. Commencez la conversation !</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender_id === selectedUser.id ? "received" : "sent"}`}
                      >
                        {editingMessage?.id === message.id ? (
                          <div className="edit-message-form">
                            <input
                              type="text"
                              value={editingMessage.content}
                              onChange={(e) =>
                                setEditingMessage({
                                  ...editingMessage,
                                  content: e.target.value,
                                })
                              }
                            />
                            <div className="edit-actions">
                              <button onClick={updateMessage}>Enregistrer</button>
                              <button onClick={() => setEditingMessage(null)}>Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="message-bubble">
                            <p style={{ marginBottom: 2 }}>{message.content}</p>
                            <div style={{ fontSize: "12px", color: "#888", marginTop: 0, textAlign: "right" }}>
                              {formatDate(message.created_at)}
                            </div>
                            {/* Options pour les messages envoyés */}
                            {message.sender_id !== selectedUser.id && (
                              <div className="message-actions">
                                <button className="edit-button" onClick={() => startEditMessage(message)}>
                                  ✏️
                                </button>
                                <button
                                  className="delete-button"
                                  onClick={() => {
                                    if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
                                      deleteMessage(message.id)
                                    }
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form className="message-input-form" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !newMessage.trim()} className="send-button">
                Envoyer
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="placeholder-message">
              <h3>Sélectionnez une conversation</h3>
              <p>Choisissez un utilisateur pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>

      {/* Notification d'erreur */}
      {error && (
        <div className="error-notification">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  )
}

export default Chat
