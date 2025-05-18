"use client"

import { Link, useNavigate } from "react-router-dom"
import { useUserStore } from "../store/userStore"
import { Home, User, MessageSquare, LogOut } from "lucide-react"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav
      className="d-flex flex-column align-items-center bg-white shadow-sm position-fixed"
      style={{ minHeight: "100vh", width: 72, left: 0, top: 0, zIndex: 100, borderRight: "1px solid #eee" }}
    >
      {/* Logo S stylisé en haut de la navbar */}
      <div className="w-100 d-flex justify-content-center py-4 border-bottom">
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px #d6249f33',
        }}>
          <span style={{fontSize:28, color:'#fff', fontWeight:700, fontFamily:'Grand Hotel, cursive'}}>S</span>
        </div>
      </div>
      <ul className="nav flex-column w-100 mt-4 px-0 align-items-center" style={{gap: 8}}>
        {isAuthenticated ? (
          <>
            <li className="nav-item mb-2">
              <Link className="nav-link d-flex justify-content-center align-items-center p-0" to="/Home" style={iconLinkStyle}>
                <Home size={26} />
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link d-flex justify-content-center align-items-center p-0" to="/chat" style={iconLinkStyle}>
                <MessageSquare size={26} />
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link d-flex justify-content-center align-items-center p-0" to="/profile" style={iconLinkStyle}>
                <User size={26} />
              </Link>
            </li>
            <li className="nav-item mt-3">
              <button
                className="nav-link d-flex justify-content-center align-items-center border-0 bg-transparent text-danger p-0"
                onClick={handleLogout}
                style={iconLinkStyle}
              >
                <LogOut size={26} />
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item mb-2 d-flex flex-column align-items-center">
              <Link className="nav-link d-flex justify-content-center align-items-center p-0" to="/login" style={iconLinkStyle}>
                <User size={26} />
              </Link>
              <span style={{fontSize: 12, color: '#888'}}>Login</span>
            </li>
            <li className="nav-item mb-2 d-flex flex-column align-items-center">
              <Link className="nav-link d-flex justify-content-center align-items-center p-0" to="/register" style={iconLinkStyle}>
                <User size={26} />
              </Link>
              <span style={{fontSize: 12, color: '#888'}}>Register</span>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

const iconLinkStyle = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s, color 0.2s, transform 0.2s",
  color: "#222",
  margin: 0,
}
