import { useState } from 'react';
import { MessageCircle, Share2, Heart, MoreHorizontal } from 'lucide-react';

export default function PostCard({ id, user, content, type, location, image, comments, createdAt, onDelete, onEdit }) {
  if (!user) {
    console.error('User data is missing:', { id, user });
    return <div className="alert alert-danger">Error: User data is missing.</div>;
  }

  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState(comments || []);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    type: '',
    location: '',
    file: null,
  });

  const handleCommentChange = (e) => setCommentText(e.target.value);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const newComment = {
      user: { username: 'currentUser' },
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    setPostComments([...postComments, newComment]);
    setCommentText('');
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce post ?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      if (onDelete) onDelete(id);
    } catch (err) {
      alert('Erreur lors de la suppression du post.');
    }
    setShowMenu(false);
  };

  const openEditForm = () => {
    setEditData({
      title: '',
      content: content || '',
      type: type || 'texte',
      location: location || '',
      file: null,
    });
    setShowEditForm(true);
    setShowMenu(false);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('content', editData.content);
      formData.append('type', editData.type);
      formData.append('location', editData.location);
      if (editData.file) formData.append('file', editData.file);
      const response = await fetch(`http://localhost:8000/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Erreur lors de la modification');
      const updatedPost = await response.json();
      if (onEdit) onEdit(updatedPost);
      setShowEditForm(false);
    } catch (err) {
      alert('Erreur lors de la modification du post.');
    }
  };

  // Affichage du média selon le type
  let media = null;
  if (type === 'image' && image) {
    media = (
      <img 
        src={image}
        className="img-fluid w-100 rounded-0"
        alt="Post content"
        style={{ objectFit: 'cover', maxHeight: '400px' }}
      />
    );
  } else if (type === 'video' && image) {
    media = (
      <video controls className="w-100" style={{ maxHeight: '400px' }}>
        <source src={image} type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>
    );
  } else if (type === 'pdf' && image) {
    media = (
      <div className="text-center my-2">
        <a href={image} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
          Voir le PDF
        </a>
      </div>
    );
  }

  // Gestion du menu 3 points
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };
  const handleCloseMenu = () => setShowMenu(false);

  return (
    <div className="card mb-4 shadow-sm" style={{ maxWidth: '600px', margin: 'auto', position: 'relative' }}>
      <div className="card-header bg-white d-flex align-items-center border-0 pb-0 justify-content-between">
        <div className="d-flex align-items-center">
          <img 
            src={user.avatar || 'https://via.placeholder.com/40'} 
            className="rounded-circle me-2"
            alt={user.username}
            style={{ width: '36px', height: '36px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          />
          <div>
            <strong>{user.username}</strong><br />
            <small className="text-muted">{new Date(createdAt).toLocaleDateString()}</small>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-link p-0 border-0"
            style={{ color: '#333' }}
            onClick={handleMenuClick}
            aria-label="Options"
          >
            <MoreHorizontal size={24} />
          </button>
          {showMenu && (
            <div
              className="card shadow-sm"
              style={{ position: 'absolute', right: 0, top: '110%', zIndex: 10, minWidth: '140px' }}
              onMouseLeave={handleCloseMenu}
            >
              <ul className="list-group list-group-flush mb-0">
                <li className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={openEditForm}>
                  Edit post
                </li>
                <li className="list-group-item list-group-item-action text-danger" style={{ cursor: 'pointer' }} onClick={handleDelete}>
                  Delete post
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showEditForm ? (
        <div className="card-body">
          <form onSubmit={handleEditSubmit}>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                placeholder="Titre"
                required
              />
            </div>
            <div className="mb-2">
              <textarea
                className="form-control"
                name="content"
                value={editData.content}
                onChange={handleEditChange}
                rows="3"
                placeholder="Contenu"
                required
              />
            </div>
            <div className="mb-2">
              <select
                className="form-select"
                name="type"
                value={editData.type}
                onChange={handleEditChange}
              >
                <option value="texte">Texte</option>
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                name="location"
                value={editData.location}
                onChange={handleEditChange}
                placeholder="Localisation"
              />
            </div>
            <div className="mb-2">
              <input
                type="file"
                className="form-control"
                name="file"
                onChange={handleEditChange}
                accept="image/*,video/*,.pdf"
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">Enregistrer</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {media}
          <div className="card-body py-2">
            <div className="d-flex mb-2 gap-3">
              <Heart size={22} className="text-danger" />
              <MessageCircle size={22} />
              <Share2 size={22} />
            </div>

            <p className="mb-1"><strong>{user.username}</strong> {content}</p>
            <small className="text-muted d-block mb-2">{location || 'Lieu inconnu'} · {type || 'Type inconnu'}</small>

            <hr />

            <div className="mb-2">
              {postComments.map((comment, idx) => (
                <div key={idx}>
                  <strong>{comment.user.username}</strong> {comment.content}
                  <div><small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small></div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="d-flex mt-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Add a comment..."
                value={commentText}
                onChange={handleCommentChange}
              />
              <button className="btn btn-primary" type="submit">Post</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}