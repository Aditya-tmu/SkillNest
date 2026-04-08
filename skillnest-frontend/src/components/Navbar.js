import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Search, Map, Layout, Bell, Home, MessageSquare } from 'lucide-react';
import { notificationAPI } from '../api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.list();
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread count");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      height: 'var(--header-height)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container flex justify-between items-center" style={{ width: '100%' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          SkillNest
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link to="/feed" className="nav-icon-link" title="Feed">
              <Layout size={24} />
            </Link>
            <Link to="/discover" className="nav-icon-link" title="Discover">
              <Map size={24} />
            </Link>
            <Link to="/chats" className="nav-icon-link" title="Messages">
              <MessageSquare size={24} />
            </Link>
            <Link to="/notifications" className="nav-icon-link" title="Notifications" style={{ position: 'relative' }}>
              <Bell size={24} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--error)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to={`/profile/${user.username}`} className="nav-icon-link" title="Profile">
              <User size={24} />
            </Link>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--error)', padding: '4px' }} title="Logout">
              <LogOut size={24} />
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <a href="/#about" className="btn-ghost hide-mobile" style={{ textDecoration: 'none', color: 'var(--text)' }}>About</a>
            <a href="/#contact" className="btn-ghost hide-mobile" style={{ textDecoration: 'none', color: 'var(--text)' }}>Contact</a>
            <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
