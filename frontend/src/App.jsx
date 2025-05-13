import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserStore } from './store/userStore';

function App() {
  const { initUser } = useUserStore();  // Ajoute l'initialisation de l'utilisateur

  useEffect(() => {
    // Charger le JavaScript de Bootstrap
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
    
    // Initialiser l'utilisateur depuis le localStorage
    initUser();
  }, [initUser]);  // Assure que l'initUser n'est appelé qu'une seule fois

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Navbar />
        <main className="container py-4">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;