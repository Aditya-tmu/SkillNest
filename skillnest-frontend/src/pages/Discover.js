import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api';
import { MapPin, Navigation, User, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Discover = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [radius, setRadius] = useState(50);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!coords.lat || !coords.lng) {
      alert("Please enter or detect your coordinates.");
      return;
    }

    setLoading(true);
    try {
      const res = await profileAPI.discover(coords.lat, coords.lng, radius);
      setProfiles(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(true);
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1 className="flex items-center gap-2"><Navigation color="var(--primary)" /> Discover Students</h1>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} className="flex flex-col md-flex-row gap-4 items-end">
          <div className="flex flex-col gap-2" style={{ flex: 1 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latitude</label>
            <input 
              type="number" step="any"
              value={coords.lat} 
              onChange={(e) => setCoords({...coords, lat: e.target.value})}
              placeholder="e.g. 28.6139"
            />
          </div>
          <div className="flex flex-col gap-2" style={{ flex: 1 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Longitude</label>
            <input 
              type="number" step="any"
              value={coords.lng} 
              onChange={(e) => setCoords({...coords, lng: e.target.value})}
              placeholder="e.g. 77.2090"
            />
          </div>
          <div className="flex flex-col gap-2" style={{ width: '120px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Radius (km)</label>
            <input 
              type="number" 
              value={radius} 
              onChange={(e) => setRadius(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleGetCurrentLocation} className="btn-ghost" style={{ padding: '12px' }}>
              <MapPin size={20} />
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Search size={20} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Finding students near you...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {profiles.map(profile => (
            <motion.div 
              key={profile.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card flex flex-col items-center"
              style={{ textAlign: 'center', padding: '2rem' }}
            >
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--border)', marginBottom: '1rem', overflow: 'hidden' }}>
                 <div className="flex items-center justify-center" style={{ height: '100%' }}><User size={50} /></div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{profile.username}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', minHeight: '3em' }}>
                {profile.bio ? (profile.bio.substring(0, 80) + '...') : 'No bio available.'}
              </p>
              
              <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <Navigation size={14} />
                <span>{profile.distance.toFixed(2)} km away</span>
              </div>

              <Link to={`/profile/${profile.username}`} className="btn-primary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                View Profile
              </Link>
            </motion.div>
          ))}
          {!loading && profiles.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              No students found in this area. Try increasing the radius.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
