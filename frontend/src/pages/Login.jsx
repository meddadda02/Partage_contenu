import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance'; // Utilisation de l'axiosInstance configuré
import { useUserStore } from '../store/userStore';  // Utilisation du store

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // Utilisation d'axiosInstance pour envoyer la requête POST
      const response = await axios.post('/login', formData);

      if (response.status !== 200) {
        throw new Error('Login failed');
      }

      const { access_token } = response.data;

      // ✅ Mettre à jour le store avec le token et l'utilisateur
      useUserStore.getState().setUser(response.data.user, access_token);  // On suppose que tu reçois l'utilisateur dans la réponse

      // ✅ Stocker le token dans le localStorage (si nécessaire pour d'autres usages)
      localStorage.setItem('access_token', access_token);

      // ✅ Utiliser le token pour une requête protégée
      const userResponse = await axios.get('/users/me'); // Appel à /users/me avec le token automatique grâce à axiosInstance

      if (userResponse.status !== 200) {
        throw new Error('Token is invalid or expired');
      }

      const userData = userResponse.data;
      console.log('User info:', userData);

      // ✅ Redirection vers une page sécurisée
      navigate('/Home'); // Changer selon ta logique de redirection
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
