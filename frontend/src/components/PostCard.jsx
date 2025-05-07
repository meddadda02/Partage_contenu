import { useState } from 'react'; 
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useUserStore } from '../store/userStore';

export default function PostCard({ id, user, content, type, location, image, likes, comments, createdAt }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState(comments); // Initialiser les commentaires

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    // TODO: Implémenter l'appel API pour les likes
  };

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    // TODO: Implémenter l'appel API pour envoyer le commentaire
    const newComment = {
      user: { username: 'currentUser' }, // Remplacer par l'utilisateur actuel
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    setPostComments([...postComments, newComment]);
    setCommentText(''); // Réinitialiser le champ de commentaire
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex align-items-center">
        <img 
          src={user.avatar || 'https://via.placeholder.com/40'} 
          className="rounded-circle me-2" 
          alt={user.username}
          width="40"
          height="40"
        />
        <div>
          <h6 className="mb-0">{user.username}</h6>
          <small className="text-muted">{new Date(createdAt).toLocaleDateString()}</small>
        </div>
      </div>
      <div className="card-body">
        <p className="card-text">{content}</p>
        {image && (
          <img src={image} className="img-fluid rounded" alt="Post content" />
        )}
        <div className="mt-3">
          <strong>Location:</strong> {location || 'N/A'}
        </div>
        <div className="mt-2">
          <strong>Type:</strong> {type}
        </div>
      </div>
      <div className="card-footer">
        <div className="d-flex justify-content-between align-items-center">
          <button 
            className={`btn btn-link ${isLiked ? 'text-danger' : 'text-dark'}`}
            onClick={handleLike}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> {likesCount}
          </button>
          <button className="btn btn-link text-dark">
            <MessageCircle size={20} /> {postComments.length}
          </button>
          <button className="btn btn-link text-dark">
            <Share2 size={20} />
          </button>
        </div>

        {/* Formulaire pour ajouter un commentaire */}
        <div className="mt-3">
          <form onSubmit={handleCommentSubmit}>
            <textarea
              className="form-control"
              value={commentText}
              onChange={handleCommentChange}
              placeholder="Add a comment..."
              rows="3"
            />
            <button type="submit" className="btn btn-primary mt-2">Submit</button>
          </form>
        </div>

        {/* Affichage des commentaires */}
        <div className="mt-3">
          {postComments.map((comment, index) => (
            <div key={index} className="border-top pt-2">
              <strong>{comment.user.username}</strong>
              <p>{comment.content}</p>
              <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
