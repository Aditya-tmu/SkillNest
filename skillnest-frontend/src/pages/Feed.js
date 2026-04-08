import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { skillAPI, profileAPI } from '../api';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Send, User, Share2, MoreHorizontal, Image, Video, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Recommendations from '../components/Recommendations';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [postMedia, setPostMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, [user.username]);

  const fetchInitialData = async () => {
    try {
      const [postsRes, profileRes, skillsRes] = await Promise.all([
        api.get('/posts/'),
        profileAPI.getProfile(user.username),
        skillAPI.trending()
      ]);
      setPosts(postsRes.data);
      setProfile(profileRes.data);
      setTrendingSkills(skillsRes.data);
    } catch (error) {
      console.error("Error fetching feed data:", error);
    }
    setLoading(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !postMedia) return;

    const formData = new FormData();
    formData.append('content', newPostContent);
    if (postMedia) {
      formData.append('media', postMedia);
    }

    try {
      const res = await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts([res.data, ...posts]);
      setNewPostContent('');
      setPostMedia(null);
    } catch (error) {
      alert("Failed to create post");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post('/likes/', { post: postId, user: user.id });
      // Refresh posts to get updated like count
      const res = await api.get('/posts/');
      setPosts(res.data);
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading your feed...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr', gap: '2rem' }}>
      
      {/* Left Sidebar: Mini Profile */}
      <div className="hide-mobile">
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--background)', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--primary)' }}>
             {profile?.image ? (
               <img src={profile.image} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
               <div className="flex items-center justify-center" style={{ height: '100%' }}><User size={50} /></div>
             )}
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>{user.username}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0 1rem' }}>{profile?.bio || 'SkillNest Student'}</p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />
          <div className="flex flex-col gap-2" style={{ padding: '0 1.5rem' }}>
            <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Followers</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{profile?.followers_count || 0}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Following</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{profile?.following_count || 0}</span>
            </div>
          </div>
          <Link to={`/profile/${user.username}`} className="btn-ghost" style={{ marginTop: '1.5rem', width: '100%', borderRadius: 0, borderTop: '1px solid var(--border)' }}>
            View Profile
          </Link>
        </div>
      </div>

      {/* Center: Feed */}
      <div className="flex flex-col gap-4">
        {/* Create Post */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--background)', flexShrink: 0, overflow: 'hidden' }}>
                {profile?.image ? <img src={profile.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={25} style={{ margin: '12px' }} />}
              </div>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your latest project or a new skill..."
                style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', fontSize: '1.1rem', padding: '8px 0' }}
                rows={2}
              />
            </div>
            
            {postMedia && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', maxHeight: '300px' }}>
                <img src={URL.createObjectURL(postMedia)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setPostMedia(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '5px' }}>
                   <X size={16} color="white" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileInputRef.current.click()} className="btn-ghost" style={{ fontSize: '0.9rem', padding: '8px 12px', color: 'var(--primary)' }}>
                  <Image size={20} className="mr-2" /> Media
                </button>
                <input type="file" ref={fileInputRef} hidden onChange={(e) => setPostMedia(e.target.files[0])} accept="image/*,video/*" />
                <button type="button" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '8px 12px', color: 'var(--secondary)' }}>
                  <Award size={20} className="mr-2" /> Achievement
                </button>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '8px 24px', borderRadius: '24px' }}>Post</button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {posts.map(post => (
          <motion.div 
            key={post.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <div style={{ padding: '1.25rem' }}>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--background)', overflow: 'hidden' }}>
                    {post.user_image ? <img src={post.user_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={25} style={{ margin: '12px' }} />}
                  </div>
                  <div>
                    <Link to={`/profile/${post.username}`} style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--text)', fontSize: '1.05rem' }}>
                      {post.username}
                    </Link>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="nav-icon-link"><MoreHorizontal size={20} /></button>
              </div>
              <p style={{ marginTop: '1.25rem', fontSize: '1.05rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.content}</p>
            </div>

            {post.media && (
              <div style={{ width: '100%', background: 'var(--background)', display: 'flex', justifyContent: 'center' }}>
                <img src={post.media} alt="Post content" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
              </div>
            )}

            {/* Post Interactions */}
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem' }}>
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-2" style={{ background: 'none', color: post.likes_count > 0 ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 600 }}>
                <Heart size={20} fill={post.likes_count > 0 ? 'var(--secondary)' : 'none'} />
                <span>{post.likes_count}</span>
              </button>
              <button className="flex items-center gap-2" style={{ background: 'none', color: 'var(--text-muted)', fontWeight: 600 }}>
                <MessageSquare size={20} />
                <span>{post.comments_count}</span>
              </button>
              <button className="flex items-center gap-2" style={{ background: 'none', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Sidebar: Recommendations & Trending */}
      <div className="hide-mobile flex flex-col gap-6">
        <Recommendations />
        
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <Award size={20} color="var(--primary)" />
            <h4 style={{ fontSize: '1.1rem' }}>Trending Skills</h4>
          </div>
          <div className="flex flex-col gap-3">
            {trendingSkills.map(skill => (
              <div key={skill.id} className="flex justify-between items-center p-3" style={{ background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                  {skill.user_count} Students
                </span>
              </div>
            ))}
            {trendingSkills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No trends yet.</p>}
          </div>
        </div>
      </div>

    </div>
  );
};

const X = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Feed;
