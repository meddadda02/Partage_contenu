import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    photo: null,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
        {/* Illustration */}
        <div className="col-lg-6 d-none d-lg-flex" style={{display:'flex', justifyContent:'center', alignItems:'center', padding:'32px 0'}}>
          <img src="https://interexy.com/wp-content/uploads/2021/11/61d3b99c361d2623653b81d5bc623791.jpg" alt="illustration" style={{maxWidth: 400, width: '100%', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,100,0.13)', objectFit: 'cover', border: '3px solid #fff'}} />
        </div>

        {/* Formulaire */}
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
                <h2 className="card-title text-center mb-4" style={{fontFamily:'Grand Hotel, cursive', fontSize:'2.3rem', color:'#222', fontWeight:400}}>Inscription</h2>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nom d'utilisateur"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:16, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:16, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:16, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Bio (facultatif)"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={2}
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:15, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{borderRadius:16, background:'#fafafa', border:'1px solid #efefef', fontSize:15, padding:'12px 16px', marginBottom:8, boxShadow:'0 1px 4px #e0e7ef55'}}
                  />
                </div>
                <button type="submit" className="btn w-100" style={{background:'linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)', border:'none', fontWeight:600, fontSize:18, padding:'12px 0', borderRadius:999, boxShadow:'0 2px 8px #d6249f22', letterSpacing:1, marginTop:4}}>
                  S'inscrire
                </button>
              </form>

              <div className="text-center" style={{fontWeight:500, fontSize:15, color:'#b0b0b0', margin:'1.7rem 0 1.2rem 0'}}>
                ─────── OU ───────
              </div>
              <div className="text-center" style={{fontSize:16, marginTop:10}}>
                Vous avez déjà un compte ?{' '}
                <span
                  className="text-primary fw-bold"
                  style={{cursor:'pointer', textDecoration:'underline', color:'#d6249f'}}
                  onClick={() => navigate('/login')}
                >
                  Connectez-vous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
