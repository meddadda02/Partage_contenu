import { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    bio: "",
    password: "",
    photo: null,
  });
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("No access token found.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user data.");
        setLoading(false);
      });

    // Récupérer les posts de l'utilisateur
    fetch("http://localhost:8000/posts/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        console.log('POSTS DATA:', data); // Debug: affiche la réponse brute
        setPosts(data);
      })
      .catch(() => {
        setPosts([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const data = new FormData();
    data.append("email", formData.email);
    data.append("bio", formData.bio);
    data.append("New_password", formData.password);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      const response = await fetch("http://localhost:8000/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) throw new Error("Failed to update user");

      const result = await response.json();
      setUser(result.user);
      setIsEditing(false);
    } catch {
      setError("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("access_token");
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      const res = await fetch("http://localhost:8000/user/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete account");

      alert("Account deleted.");
      window.location.href = "/login";
    } catch {
      setError("Failed to delete account.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div>No user data found.</div>;

  const photoUrl = user.photo || "https://via.placeholder.com/140";

  const defaultImage = '/default-image.jpg'; // Place cette image dans public/
  const stats = {
    posts: user.posts_count || 12,
    followers: user.followers_count || 340,
    following: user.following_count || 180,
  };
  const photos = posts.length > 0
    ? posts.filter(p => p.type === 'image' && p.file_url).map((post) => {
        let mediaUrl = post.file_url;
        if (mediaUrl && !mediaUrl.startsWith('http')) {
          mediaUrl = `http://localhost:8000/images/${mediaUrl.split('/').pop()}`;
        }
        return mediaUrl || defaultImage;
      })
    : [];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
          body, #root {
            background: #fafafa !important;
          }
          .profile-ig-container {
            max-width: 900px;
            margin: 40px auto;
            padding: 40px 30px 30px 30px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.08);
            font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
          }
          .profile-ig-header {
            display: flex;
            align-items: center;
            gap: 48px;
            margin-bottom: 32px;
            flex-wrap: wrap;
          }
          .profile-ig-img {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            background: #fafafa;
          }
          .profile-ig-info {
            flex: 1;
            min-width: 220px;
          }
          .profile-ig-username {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
            color: #262626;
          }
          .profile-ig-stats {
            display: flex;
            gap: 32px;
            margin-bottom: 18px;
            font-size: 1.1rem;
          }
          .profile-ig-stat strong {
            font-weight: 700;
            color: #262626;
            font-size: 1.15rem;
          }
          .profile-ig-stat {
            color: #262626;
          }
          .profile-ig-bio {
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: #444;
          }
          .profile-ig-edit-btn {
            background: linear-gradient(90deg, #0095f6 60%, #0057b7 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 24px;
            font-size: 1rem;
            cursor: pointer;
            margin-right: 10px;
            font-weight: 500;
            transition: background 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 8px rgba(0,149,246,0.08);
          }
          .profile-ig-edit-btn:hover {
            background: linear-gradient(90deg, #1877f2 60%, #0095f6 100%);
            box-shadow: 0 4px 16px rgba(0,149,246,0.18);
          }
          .profile-ig-delete-btn {
            background: linear-gradient(90deg, #ed4956 60%, #f56040 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 24px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 8px rgba(237,73,86,0.08);
          }
          .profile-ig-delete-btn:hover {
            background: linear-gradient(90deg, #c82333 60%, #ed4956 100%);
            box-shadow: 0 4px 16px rgba(237,73,86,0.18);
          }
          .profile-ig-divider {
            border: none;
            border-top: 1.5px solid #dbdbdb;
            margin: 18px 0 32px 0;
          }
          .profile-ig-photos-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 32px;
          }
          .profile-ig-photo {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: cover;
            border-radius: 10px;
            background: #eee;
            transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            filter: brightness(0.98);
          }
          .profile-ig-photo:hover {
            transform: scale(1.04);
            box-shadow: 0 6px 24px rgba(0,0,0,0.12);
            filter: brightness(1.05);
            z-index: 2;
          }
          .error-message {
            color: #ed4956;
            text-align: center;
          }
          .profile-ig-edit-form {
            background: #fafafa;
            border-radius: 12px;
            padding: 24px 18px 18px 18px;
            margin-bottom: 32px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            max-width: 420px;
          }
          .profile-ig-edit-form label {
            display: block;
            font-size: 1rem;
            color: #555;
            margin-bottom: 4px;
            margin-top: 12px;
            font-weight: 500;
          }
          .profile-ig-edit-form .input-field {
            width: 100%;
            padding: 8px 12px;
            border: 1.5px solid #dbdbdb;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 8px;
            background: #fff;
            transition: border 0.2s;
          }
          .profile-ig-edit-form .input-field:focus {
            border: 1.5px solid #0095f6;
            outline: none;
          }
          .profile-ig-edit-form .profile-ig-edit-btn {
            width: 100%;
            margin: 18px 0 0 0;
            padding: 10px 0;
            font-size: 1.1rem;
            border-radius: 8px;
          }
          .profile-ig-edit-form .profile-ig-photo-preview {
            display: block;
            margin: 10px auto 10px auto;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #dbdbdb;
            background: #eee;
          }
          @media (max-width: 700px) {
            .profile-ig-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 24px;
            }
            .profile-ig-img {
              width: 110px;
              height: 110px;
            }
            .profile-ig-username {
              font-size: 1.5rem;
            }
            .profile-ig-stats {
              gap: 18px;
              font-size: 1rem;
            }
            .profile-ig-photos-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
          }
          @media (max-width: 480px) {
            .profile-ig-container {
              padding: 10px 2vw;
            }
            .profile-ig-photos-grid {
              grid-template-columns: 1fr;
              gap: 6px;
            }
          }
        `}
      </style>

      <div className="profile-ig-container">
        <div className="profile-ig-header">
          <img
            src={photoUrl}
            alt="Profile"
            className="profile-ig-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/140";
            }}
          />
          <div className="profile-ig-info">
            <div className="profile-ig-username">{user.username}</div>
            <div className="profile-ig-stats">
              <div className="profile-ig-stat"><strong>{stats.posts}</strong> posts</div>
              <div className="profile-ig-stat"><strong>{stats.followers}</strong> followers</div>
              <div className="profile-ig-stat"><strong>{stats.following}</strong> following</div>
            </div>
            <div className="profile-ig-bio">{user.bio || "No bio set."}</div>
            <button className="profile-ig-edit-btn" onClick={() => {
              setFormData({
                email: user.email || "",
                bio: user.bio || "",
                password: "",
                photo: null,
              });
              setIsEditing(true);
            }}>
              Edit Profile
            </button>
            <button className="profile-ig-delete-btn" onClick={handleDelete}>
              Delete Account
            </button>
          </div>
        </div>
        <hr className="profile-ig-divider" />

        {isEditing && (
          <form onSubmit={handleUpdate} className="profile-ig-edit-form">
            <label>Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
            <label>Bio :</label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="input-field"
            />
            <label>Nouveau mot de passe :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
            />
            <label>Photo de profil :</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="input-field"
              style={{ marginBottom: "10px" }}
            />
            {formData.photo && (
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Aperçu"
                className="profile-ig-photo-preview"
              />
            )}
            <button type="submit" className="profile-ig-edit-btn">
              Sauvegarder
            </button>
          </form>
        )}

        <div className="profile-ig-photos-grid">
          {photos.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#888'}}>Aucune photo à afficher</div>
          ) : (
            photos.map((url, idx) => (
              <img key={idx} src={url} alt="post" className="profile-ig-photo" onError={e => {e.target.onerror=null; e.target.src=defaultImage;}} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
