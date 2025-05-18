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

      // Après avoir reçu le token et le login réussi, stocke le username dans le localStorage
      localStorage.setItem("user", JSON.stringify({ username }));

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 40%, #a1c4fd 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
    }}>
      <div className="row" style={{width:'100%', justifyContent:'center', alignItems:'center', margin:0}}>
        {/* Illustration à gauche */}
        <div className="col-lg-6 d-none d-lg-flex" style={{display:'flex', justifyContent:'center', alignItems:'center', padding:'32px 0'}}>
          <img src="https://interexy.com/wp-content/uploads/2021/11/61d3b99c361d2623653b81d5bc623791.jpg" alt="illustration" style={{maxWidth: 400, width: '100%', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,100,0.13)', objectFit: 'cover', border: '3px solid #fff'}} />
        </div>
        {/* Formulaire de connexion */}
        <div className="col-12 col-md-8 col-lg-4 d-flex align-items-center justify-content-center">
          <div className="card w-100" style={{
            borderRadius: 28,
            boxShadow: '0 12px 40px rgba(60,60,100,0.13)',
            border: 'none',
            margin: '32px 0',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <div className="card-body" style={{padding:'2.7rem 2.2rem'}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:18}}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  boxShadow: '0 2px 12px #d6249f33',
                }}>
                  <span style={{fontSize:36, color:'#fff', fontWeight:700, fontFamily:'Grand Hotel, cursive'}}>S</span>
                </div>
                <h1 className="text-center" style={{fontFamily: 'Grand Hotel, cursive', fontSize: '2.5rem', fontWeight: 400, color: '#222', margin:0}}>Social Emsi</h1>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Num. téléphone, nom de profil ou e-mail"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:16, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:16, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <button type="submit" className="btn w-100" style={{background:'linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)', border:'none', fontWeight:600, fontSize:18, padding:'12px 0', borderRadius:999, boxShadow:'0 2px 8px #d6249f22', letterSpacing:1, marginTop:4}}>
                  Se connecter
                </button>
              </form>
              <div className="text-center" style={{fontWeight:500, fontSize:15, color:'#b0b0b0', margin:'1.7rem 0 1.2rem 0'}}>
                ─────── OU ───────
              </div>
              <div className="text-center" style={{fontSize:16, marginTop:10}}>
                Vous n’avez pas de compte ?{' '}
                <span
                  className="text-primary fw-bold"
                  style={{cursor:'pointer', textDecoration:'underline', color:'#d6249f'}}
                  onClick={() => navigate('/register')}
                >
                  Inscrivez-vous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}