import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useUserStore } from '../store/userStore';

export default function Feed() {
  const { isAuthenticated, token } = useUserStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'texte',
    location: '',
    file: null
  });

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

        if (!response.ok) throw new Error('Failed to fetch posts');

        const data = await response.json();
        const sortedPosts = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);
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
    Object.entries(newPost).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await fetch('http://localhost:8000/posts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error();

      const createdPost = await response.json();
      setPosts(prev => [createdPost, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setNewPost({ title: '', content: '', type: 'texte', location: '', file: null });
    } catch {
      setError('Failed to create post');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewPost(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleEditPost = (updatedPost) => {
    setPosts(prev => prev.map(p => (p.id === updatedPost.id ? updatedPost : p)));
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
          {/* Post Creation Form */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dbdbdb', padding: '20px 18px 14px 18px', marginBottom: '28px', boxShadow: 'none' }}>
            <form onSubmit={handleCreatePost}>
              <div className="mb-2">
                <textarea
                  className="form-control border-0"
                  name="content"
                  value={newPost.content}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Quoi de neuf ?"
                  style={{ backgroundColor: '#fafafa', borderRadius: '14px', padding: '14px', fontSize: '15px', resize: 'none', boxShadow: 'none' }}
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
                  style={{ borderRadius: '10px', fontSize: '14px', background: '#fafafa', border: '1px solid #efefef' }}
                />
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={newPost.location}
                  onChange={handleChange}
                  placeholder="Localisation"
                  style={{ borderRadius: '10px', fontSize: '14px', background: '#fafafa', border: '1px solid #efefef' }}
                />
              </div>
              <div className="mb-2 d-flex gap-2 align-items-center">
                <select
                  className="form-select"
                  name="type"
                  value={newPost.type}
                  onChange={handleChange}
                  style={{ borderRadius: '10px', fontSize: '14px', background: '#fafafa', border: '1px solid #efefef', width: '140px' }}
                >
                  <option value="texte">Texte</option>
                  <option value="image">Image</option>
                  <option value="video">Vidéo</option>
                  <option value="pdf">PDF</option>
                </select>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*,video/*,.pdf"
                  style={{ borderRadius: '10px', fontSize: '14px', background: '#fafafa', border: '1px solid #efefef' }}
                />
              </div>
              <button type="submit" className="w-100" style={{ background: 'linear-gradient(90deg, #fd5949 0%, #d6249f 60%, #285AEB 100%)', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 0', fontWeight: 600, fontSize: '16px', boxShadow: 'none', marginTop: '6px' }}>
                Publier
              </button>
            </form>
          </div>

          {/* Posts Display */}
          <div>
            {posts.length === 0 ? (
              <p className="text-center text-muted">Aucun post disponible</p>
            ) : (
              posts.map((post) => {
                let mediaUrl = post.file_url;
                if (mediaUrl && !mediaUrl.startsWith('http')) {
                  mediaUrl = `http://localhost:8000/images/${mediaUrl.split('/').pop()}`;
                }

                const avatar = post.user?.photo
                  ? post.user.photo.startsWith('http')
                    ? post.user.photo
                    : `http://localhost:8000/images/${post.user.photo.split('/').pop()}`
                  : 'https://via.placeholder.com/40';

                return (
                  <div key={post.id}>
                    <PostCard
                      id={post.id}
                      user={{
                        username: post.user?.username || 'Utilisateur inconnu',
                        avatar
                      }}
                      content={post.content}
                      type={post.type}
                      location={post.location}
                      image={mediaUrl}
                      createdAt={post.created_at}
                      comments={post.comments}
                      onDelete={handleDeletePost}
                      onEdit={handleEditPost}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
