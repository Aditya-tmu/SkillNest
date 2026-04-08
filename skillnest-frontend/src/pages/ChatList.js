import React, { useState, useEffect } from 'react';
import api, { profileAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get('/messages/');
      const allMessages = res.data;
      
      // Group messages by contact
      const threads = {};
      allMessages.forEach(msg => {
        const contact = msg.sender_username === user.username ? msg.receiver_username : msg.sender_username;
        if (!threads[contact] || new Date(msg.timestamp) > new Date(threads[contact].timestamp)) {
          threads[contact] = msg;
        }
      });

      const chatList = await Promise.all(Object.keys(threads).map(async (contact) => {
        try {
          const profileRes = await profileAPI.getProfile(contact);
          return {
            username: contact,
            lastMessage: threads[contact].content,
            timestamp: threads[contact].timestamp,
            image: profileRes.data.image
          };
        } catch {
          return {
            username: contact,
            lastMessage: threads[contact].content,
            timestamp: threads[contact].timestamp,
            image: null
          };
        }
      }));

      setChats(chatList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
    setLoading(false);
  };

  const filteredChats = chats.filter(c => c.username.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading conversations...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-3"><MessageSquare size={28} color="var(--primary)" /> Messages</h1>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 p-2 px-4" style={{ background: 'var(--background)', borderRadius: '12px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', padding: '5px', background: 'transparent' }} 
            />
          </div>
        </div>

        <div className="flex flex-col">
          {filteredChats.map((chat, idx) => (
            <Link 
              key={idx} 
              to={`/chat/${chat.username}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="flex items-center justify-between p-4 chat-item-hover" style={{ borderBottom: idx !== filteredChats.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}>
                <div className="flex gap-4 items-center">
                  <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: 'var(--background)', overflow: 'hidden', border: '2px solid var(--border)' }}>
                    {chat.image ? <img src={chat.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={25} style={{ margin: '15px' }} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{chat.username}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(chat.timestamp).toLocaleDateString() === new Date().toLocaleDateString() 
                      ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date(chat.timestamp).toLocaleDateString()}
                  </span>
                  <ChevronRight size={18} color="var(--border)" />
                </div>
              </div>
            </Link>
          ))}

          {filteredChats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No conversations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
