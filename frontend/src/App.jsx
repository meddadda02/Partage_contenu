import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './router';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  useEffect(() => {
    // Charger le JavaScript de Bootstrap
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

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
