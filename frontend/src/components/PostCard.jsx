import { useState, useRef } from 'react';
import { MessageCircle, Share2, Heart, MoreHorizontal } from 'lucide-react';
import { useUserStore } from '../store/userStore';

export default function PostCard({ id, user, content, type, location, image, comments, createdAt, onDelete, onEdit }) {
  if (!user) {
    console.error('User data is missing:', { id, user });
    return <div className="alert alert-danger">Error: User data is missing.</div>;
  }

  const { token } = useUserStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    type: '',
    location: '',
    file: null,
  });
  const [commentInput, setCommentInput] = useState('');
  const [commentList, setCommentList] = useState(Array.isArray(comments) ? comments : []);
  const [sending, setSending] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const commentInputRef = useRef(null);

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('content', commentInput);
      formData.append('post_id', id);
      const response = await fetch('http://localhost:8000/comments/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error();
      const newComment = await response.json();
      setCommentList(prev => [...prev, newComment]);
      setCommentInput('');
    } catch {
      // Optionnel: afficher une erreur
    } finally {
      setSending(false);
    }
  };

  const handleCommentIconClick = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
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
    <div className="card mb-4" style={{ maxWidth: '470px', margin: 'auto', borderRadius: '16px', border: '1px solid #dbdbdb', boxShadow: 'none', background: '#fff', position: 'relative' }}>
      <div className="card-header bg-white d-flex align-items-center border-0 pb-0 justify-content-between" style={{ borderBottom: '1px solid #efefef', borderRadius: '16px 16px 0 0', padding: '12px 16px' }}>
        <div className="d-flex align-items-center">
          <img 
            src={user.avatar || 'https://via.placeholder.com/40'} 
            className="rounded-circle me-2"
            alt={user.username}
            style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1.5px solid #dbdbdb', boxShadow: 'none' }}
          />
          <div>
            <strong style={{ fontSize: '15px' }}>{user.username}</strong><br />
            <small className="text-muted" style={{ fontSize: '12px' }}>{new Date(createdAt).toLocaleDateString()}</small>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-link p-0 border-0"
            style={{ color: '#333' }}
            onClick={handleMenuClick}
            aria-label="Options"
          >
            <MoreHorizontal size={22} />
          </button>
          {showMenu && (
            <div
              className="card shadow-sm"
              style={{ position: 'absolute', right: 0, top: '110%', zIndex: 10, minWidth: '140px', borderRadius: '10px', border: '1px solid #dbdbdb' }}
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
          <div className="card-body py-2 px-3" style={{ paddingBottom: 0 }}>
            <div className="d-flex mb-2 gap-3 align-items-center" style={{ padding: '4px 0' }}>
              <Heart size={22} className="text-danger" style={{ cursor: 'pointer' }} />
              <MessageCircle size={22} style={{ cursor: 'pointer' }} onClick={handleCommentIconClick} />
              <Share2 size={22} style={{ cursor: 'pointer' }} />
            </div>
            <p className="mb-1" style={{ fontSize: '15px' }}><strong>{user.username}</strong> {content}</p>
            <small className="text-muted d-block mb-2" style={{ fontSize: '12px' }}>{location || 'Lieu inconnu'} · {type || 'Type inconnu'}</small>
            <hr style={{ margin: '8px 0', borderColor: '#efefef' }} />
            <div className="mb-2">
              {commentList.length === 0 && (
                <div className="text-muted" style={{ fontSize: '14px' }}>Aucun commentaire</div>
              )}
              {commentList.length > 2 && !showAllComments && (
                <div style={{ marginBottom: 6 }}>
                  <button type="button" className="btn btn-link p-0" style={{ fontSize: '14px', textDecoration: 'none', color: '#aaa' }} onClick={() => setShowAllComments(true)}>
                    Afficher les {commentList.length} commentaires
                  </button>
                </div>
              )}
              {(showAllComments ? commentList : commentList.slice(-2)).map((comment, idx) => {
                const user = comment.user || {};
                let commentAvatar = user.photo || 'https://via.placeholder.com/32';
                if (user.photo && !user.photo.startsWith('http')) {
                  commentAvatar = `http://localhost:8000/images/${user.photo.split('/').pop()}`;
                }
                return (
                  <div key={comment.id || idx} className="d-flex align-items-start mb-2" style={{ gap: '10px' }}>
                    <a href={`/profile/${user.id || ''}`} style={{ textDecoration: 'none' }}>
                      <img
                        src={commentAvatar}
                        alt="avatar"
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #efefef', marginTop: 2 }}
                      />
                    </a>
                    <div style={{ background: '#fafafa', borderRadius: '14px', padding: '8px 14px', maxWidth: '340px' }}>
                      <a href={`/profile/${user.id || ''}`} style={{ fontSize: '14px', fontWeight: 600, color: '#262626', textDecoration: 'none' }}>
                        {user.username || 'Utilisateur'}
                      </a>
                      <span style={{ fontSize: '14px', marginLeft: 6 }}>{comment.content}</span>
                      {comment.createdAt && (
                        <div><small className="text-muted" style={{ fontSize: '12px' }}>{new Date(comment.createdAt).toLocaleDateString()}</small></div>
                      )}
                    </div>
                  </div>
                );
              })}
              <form onSubmit={handleAddComment} className="d-flex align-items-center mt-2" style={{ gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ajouter un commentaire..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  style={{ borderRadius: '14px', background: '#fafafa', fontSize: '14px', border: '1px solid #efefef' }}
                  disabled={sending}
                  ref={commentInputRef}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '999px', padding: '6px 18px', fontWeight: 500 }} disabled={sending || !commentInput.trim()}>
                  {sending ? '...' : 'Envoyer'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}