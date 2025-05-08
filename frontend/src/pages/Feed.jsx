import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useUserStore } from '../store/userStore';

export default function Feed() {
  const { isAuthenticated, token, user } = useUserStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'texte', location: '', file: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:8000/posts/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const validPosts = data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(validPosts);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated, token, navigate]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    formData.append('type', newPost.type);
    formData.append('location', newPost.location);
    if (newPost.file) {
      formData.append('file', newPost.file);
    }

    try {
      const response = await fetch('http://localhost:8000/posts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const createdPost = await response.json();
      setPosts(prevPosts => 
        [createdPost, ...prevPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setNewPost({ title: '', content: '', type: 'texte', location: '', file: null });
    } catch (err) {
      setError('Failed to create post');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prevPost) => ({ ...prevPost, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewPost((prevPost) => ({ ...prevPost, file: e.target.files[0] }));
  };

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
  };

  const handleEditPost = (updatedPost) => {
    setPosts((prevPosts) => prevPosts.map((p) => p.id === updatedPost.id ? updatedPost : p));
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handleCreatePost}>
                <div className="mb-3">
                  <textarea
                    className="form-control border-0"
                    name="content"
                    value={newPost.content}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Quoi de neuf ?"
                    style={{ backgroundColor: '#f0f2f5', borderRadius: '20px', padding: '15px' }}
                  />
                </div>
                <div className="mb-2 d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={newPost.title}
                    onChange={handleChange}
                    placeholder="Titre"
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={newPost.location}
                    onChange={handleChange}
                    placeholder="Localisation"
                  />
                </div>
                <div className="mb-2">
                  <select
                    className="form-select"
                    name="type"
                    value={newPost.type}
                    onChange={handleChange}
                  >
                    <option value="texte">Texte</option>
                    <option value="image">Image</option>
                    <option value="video">Vidéo</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 rounded-pill">
                  Publier
                </button>
              </form>
            </div>
          </div>

          <div>
            {posts.length === 0 ? (
              <p className="text-center text-muted">Aucun post disponible</p>
            ) : (
              posts.map((post) => {
                console.log('post:', post); // Debug : vérifier la structure du post et la présence de user.photo
                // Correction de l'URL de l'image/vidéo/pdf
                let mediaUrl = post.file_url;
                if (mediaUrl && !mediaUrl.startsWith('http')) {
                  mediaUrl = `http://localhost:8000/images/${mediaUrl.split('/').pop()}`;
                }
                return (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    user={{
                      username: post.user?.username || 'Utilisateur inconnu',
                      avatar: post.user?.photo
                        ? (() => {
                            const photo = post.user.photo;
                            if (photo.startsWith('http')) return photo;
                            // On récupère juste le nom du fichier, même si photo contient un chemin
                            const fileName = photo.split('/').pop();
                            return `http://localhost:8000/images/${fileName}`;
                          })()
                        : 'https://via.placeholder.com/40'
                    }}
                    content={post.content}
                    type={post.type}
                    location={post.location}
                    image={mediaUrl}
                    createdAt={post.created_at}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
