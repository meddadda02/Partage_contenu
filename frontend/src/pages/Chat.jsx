import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { io } from 'socket.io-client';

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user } = useUserStore();

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io('YOUR_WEBSOCKET_URL', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch online users
    socketRef.current.on('users', (onlineUsers) => {
      setUsers(onlineUsers);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleUserSelect = (chatUser) => {
    setSelectedUser(chatUser);
    fetchMessages(chatUser.id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    socketRef.current?.emit('sendMessage', {
      content: newMessage,
      receiverId: selectedUser.id,
    });

    setNewMessage('');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Users list */}
        <div className="col-md-4 col-lg-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Chats</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {users.map(chatUser => (
                  <button
                    key={chatUser.id}
                    className={`list-group-item list-group-item-action ${selectedUser?.id === chatUser.id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(chatUser)}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={chatUser.avatar || 'https://via.placeholder.com/40'}
                        alt={chatUser.username}
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                      />
                      <div>
                        <h6 className="mb-0">{chatUser.username}</h6>
                        <small className="text-muted">Online</small>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="col-md-8 col-lg-9">
          <div className="card">
            {selectedUser ? (
              <>
                <div className="card-header">
                  <div className="d-flex align-items-center">
                    <img
                      src={selectedUser.avatar || 'https://via.placeholder.com/40'}
                      alt={selectedUser.username}
                      className="rounded-circle me-2"
                      width="40"
                      height="40"
                    />
                    <h5 className="mb-0">{selectedUser.username}</h5>
                  </div>
                </div>
                <div className="card-body" style={{ height: '60vh', overflowY: 'auto' }}>
                  <div className="d-flex flex-column">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`message mb-2 ${message.senderId === user?.id ? 'align-self-end' : 'align-self-start'}`}
                      >
                        <div
                          className={`p-2 rounded ${
                            message.senderId === user?.id ? 'bg-primary text-white' : 'bg-light'
                          }`}
                          style={{ maxWidth: '70%' }}
                        >
                          {message.content}
                        </div>
                        <small className="text-muted">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </small>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <div className="card-footer">
                  <form onSubmit={handleSendMessage}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary">
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="card-body text-center">
                <p className="mb-0">Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}