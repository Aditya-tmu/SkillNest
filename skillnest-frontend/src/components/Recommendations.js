import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api';
import { User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const res = await profileAPI.recommendations();
      setRecommendations(res.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleFollow = async (profileId) => {
    try {
      await profileAPI.follow(profileId);
      alert("Following!");
      fetchRecommendations();
    } catch (error) {
      console.error("Follow failed:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h4 style={{ marginBottom: '1rem' }}>Recommended for you</h4>
      <div className="flex flex-col gap-4">
        {recommendations.map(profile => (
          <div key={profile.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--background)', overflow: 'hidden' }}>
                {profile.image ? <img src={profile.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} style={{ margin: '8px' }} />}
              </div>
              <div>
                <Link to={`/profile/${profile.username}`} style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', color: 'var(--text)' }}>
                  {profile.username}
                </Link>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skill Match: {profile.recommendation_score}</div>
              </div>
            </div>
            <button onClick={() => handleFollow(profile.user.id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--primary)' }}>
              <Plus size={16} />
            </button>
          </div>
        ))}
        {recommendations.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recommendations yet. Add more skills to see matches!</p>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
