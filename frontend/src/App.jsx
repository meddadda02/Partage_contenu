import { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserStore } from './store/userStore';

function AppContent() {
  const { initUser } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
    initUser();
  }, [initUser]);

  // Ne pas afficher la Navbar sur /login ou /register
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-vh-100 bg-light">
      {!hideNavbar && <Navbar />}
      <main className="container py-4">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;