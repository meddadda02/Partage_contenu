import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Home, User, MessageSquare, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useUserStore();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Social App</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/"><Home size={20} /> Feed</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/chat"><MessageSquare size={20} /> Chat</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile"><User size={20} /> Profile</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={logout}><LogOut size={20} /> Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}