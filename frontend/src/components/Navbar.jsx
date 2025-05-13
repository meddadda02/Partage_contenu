import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Home, User, MessageSquare, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useUserStore();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="fw-bold text-primary">SocialApp</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/feed" style={navLinkStyle}>
                    <Home size={20} className="me-2" /> Feed
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/chat" style={navLinkStyle}>
                    <MessageSquare size={20} className="me-2" /> Chat
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile" style={navLinkStyle}>
                    <User size={20} className="me-2" /> Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link border-0 bg-transparent text-danger" onClick={logout} style={navLinkStyle}>
                    <LogOut size={20} className="me-2" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={navLinkStyle}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" style={navLinkStyle}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle = {
  fontSize: '1rem',
  color: '#333',
  fontWeight: '500',
  transition: 'color 0.3s ease, transform 0.3s ease',
};

const hoverEffectStyle = {
  ...navLinkStyle,
  color: '#0095f6',
  transform: 'scale(1.05)',
};

