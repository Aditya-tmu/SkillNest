import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { profileAPI } from '../api';
import { Send, User, Phone, Video, Info } from 'lucide-react';

const Chat = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    fetchReceiverProfile();
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [username]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchReceiverProfile = async () => {
    try {
      const res = await profileAPI.getProfile(username);
      setReceiver(res.data);
    } catch (error) {
      console.error("Error fetching receiver profile");
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get('/messages/');
      const filtered = res.data.filter(msg => 
        (msg.sender_username === user.username && msg.receiver_username === username) ||
        (msg.sender_username === username && msg.receiver_username === user.username)
      );
      setMessages(filtered);
    } catch (error) {
      console.error("Error fetching chat history");
    }
  };

  const connectWebSocket = () => {
    if (socketRef.current) socketRef.current.close();

    const roomName = [user.username, username].sort().join('_');
    const wsUrl = `ws://localhost:8000/ws/chat/${roomName}/`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => setIsConnected(true);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => {
        // Prevent duplicate messages if needed
        const alreadyExists = prev.some(m => m.id === data.id);
        if (alreadyExists) return prev;

        return [...prev, {
          sender_username: data.sender_username,
          content: data.message,
          timestamp: new Date().toISOString()
        }];
      });
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 3000);
    };
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !receiver || !isConnected) return;

    socketRef.current.send(JSON.stringify({
      'message': input,
      'receiver_id': receiver.user.id
    }));
    setInput('');
  };

  return (
    <div className="container" style={{ height: 'calc(100vh - var(--header-height))', display: 'flex', flexDirection: 'column', paddingTop: '1rem', paddingBottom: '1rem', maxWidth: '1000px' }}>
      {/* Chat Header */}
      <div className="card" style={{ padding: '0.75rem 1.5rem', marginBottom: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-4">
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--background)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
            {receiver?.image ? <img src={receiver.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} style={{ margin: '12px' }} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>{username}</h3>
            <span style={{ fontSize: '0.75rem', color: isConnected ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
               {isConnected ? '● Online' : '○ Connecting...'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-muted">
           <button className="btn-ghost" style={{ padding: '8px' }}><Phone size={20} /></button>
           <button className="btn-ghost" style={{ padding: '8px' }}><Video size={20} /></button>
           <button className="btn-ghost" style={{ padding: '8px' }}><Info size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="card" style={{ flex: 1, marginBottom: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div 
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.1)' }}
        >
          {messages.map((msg, idx) => {
            const isMe = msg.sender_username === user.username;
            return (
              <div key={idx} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}>
                <div style={{ 
                  padding: '10px 16px', 
                  borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: isMe ? 'var(--primary)' : 'var(--background)',
                  color: isMe ? 'white' : 'var(--text)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontSize: '0.95rem'
                }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} style={{ padding: '1.25rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={!isConnected}
              style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--border)' }}
            />
            <button type="submit" className="btn-primary" disabled={!isConnected || !input.trim()} style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0 }}>
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
