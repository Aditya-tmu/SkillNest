import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, skillAPI, projectAPI, bookingAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Book, Briefcase, Award, Plus, Github, ExternalLink, Edit2, CheckCircle, User, Mail, Phone, Calendar, Info, X, Upload, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Form States
  const [editData, setEditData] = useState({});
  const [newSkill, setNewSkill] = useState({ skill_name: '', level: 'Beginner' });
  const [newProject, setNewProject] = useState({ title: '', description: '', github_link: '', image: null });
  const [profileImage, setProfileImage] = useState(null);
  const [bookingData, setBookingData] = useState({ message: '', scheduled_time: '', price: 0 });

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const pRes = await profileAPI.getProfile(username);
      setProfile(pRes.data);
      setEditData(pRes.data);
      
      const sRes = await skillAPI.userSkills(username);
      setSkills(sRes.data);
      
      const prRes = await projectAPI.list(username);
      setProjects(prRes.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(editData).forEach(key => {
      if (editData[key] !== null && key !== 'image' && key !== 'user') {
        formData.append(key, editData[key]);
      }
    });
    if (profileImage) {
      formData.append('image', profileImage);
    }

    try {
      await profileAPI.updateProfile(username, formData);
      setShowEditProfile(false);
      fetchProfileData();
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handleFollow = async () => {
    try {
      await profileAPI.follow(profile.user.id);
      fetchProfileData();
    } catch (error) {
      alert("Follow failed");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await bookingAPI.create({
        provider: profile.user.id,
        ...bookingData
      });
      alert("Booking request sent!");
      setShowBookingModal(false);
    } catch (error) {
      alert("Failed to send booking request");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await skillAPI.addSkill(newSkill);
      setNewSkill({ skill_name: '', level: 'Beginner' });
      setShowAddSkill(false);
      fetchProfileData();
    } catch (error) {
      alert("Failed to add skill");
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newProject.title);
    formData.append('description', newProject.description);
    formData.append('github_link', newProject.github_link);
    if (newProject.image) {
      formData.append('image', newProject.image);
    }

    try {
      await projectAPI.addProject(formData);
      setNewProject({ title: '', description: '', github_link: '', image: null });
      setShowAddProject(false);
      fetchProfileData();
    } catch (error) {
      alert("Failed to add project");
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading profile...</div>;
  if (!profile) return (
    <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <h2>Profile Not Found</h2>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>Back Home</button>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', opacity: 0.15 }}></div>
        
        <div className="flex flex-col md-flex-row gap-6 items-end" style={{ position: 'relative', paddingTop: '60px' }}>
          <div style={{ 
            width: '160px', 
            height: '160px', 
            borderRadius: '50%', 
            border: '6px solid var(--surface)',
            background: 'var(--background)',
            overflow: 'hidden',
            marginLeft: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            {profile.image ? (
              <img src={profile.image} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="flex items-center justify-center" style={{ height: '100%' }}>
                <User size={80} color="var(--text-muted)" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1" style={{ paddingBottom: '15px' }}>
            <div className="flex items-center gap-4">
              <h1 style={{ fontSize: '2.8rem', fontWeight: 800 }}>{profile.username}</h1>
              {isOwnProfile ? (
                <button onClick={() => setShowEditProfile(true)} className="nav-icon-link" style={{ background: 'var(--surface)' }}>
                  <Edit2 size={20} />
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleFollow} className={profile.is_following ? "btn-ghost" : "btn-primary"} style={{ padding: '8px 24px', borderRadius: '24px' }}>
                    {profile.is_following ? 'Following' : 'Follow'}
                  </button>
                  <button onClick={() => setShowBookingModal(true)} className="btn-primary" style={{ padding: '8px 24px', borderRadius: '24px', background: 'var(--secondary)' }}>
                    Book Session
                  </button>
                  <button onClick={() => navigate(`/chat/${username}`)} className="nav-icon-link" style={{ background: 'var(--surface)' }}>
                    <MessageSquare size={20} />
                  </button>
                </div>
              )}
            </div>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '800px' }}>{profile.bio || 'Building the future, one line of code at a time.'}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Stats Card */}
          <div className="card flex justify-around py-4">
             <div className="text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{profile.followers_count}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</div>
             </div>
             <div className="text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{profile.following_count}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Following</div>
             </div>
             <div className="text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{projects.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Projects</div>
             </div>
          </div>

          {/* Personal Details */}
          <div className="card">
            <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <Info size={22} color="var(--primary)" /> Personal Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div style={{ color: 'var(--text-muted)' }}><Calendar size={20} /></div>
                <span>Age: <strong style={{ color: 'var(--text)' }}>{profile.age || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ color: 'var(--text-muted)' }}><Phone size={20} /></div>
                <span>Contact: <strong style={{ color: 'var(--text)' }}>{profile.contact_no || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ color: 'var(--text-muted)' }}><MapPin size={20} /></div>
                <span>Location: <strong style={{ color: 'var(--text)' }}>{profile.address || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="card">
            <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <Book size={22} color="var(--primary)" /> Educational Details
            </h3>
            <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>{profile.education || 'Sharing my educational journey.'}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h3 className="flex items-center gap-2"><Award size={22} color="var(--primary)" /> Skills</h3>
              {isOwnProfile && <button onClick={() => setShowAddSkill(true)} className="nav-icon-link" style={{ background: 'var(--background)' }}><Plus size={20} /></button>}
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-2 p-2 px-4" style={{ background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{skill.skill_name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{skill.level}</span>
                  {skill.verified ? (
                    <CheckCircle size={16} color="var(--success)" />
                  ) : (
                    isOwnProfile && (
                      <button 
                        onClick={() => navigate(`/quiz/${skill.id}`)}
                        style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px' }}
                      >
                        Verify
                      </button>
                    )
                  )}
                </div>
              ))}
              {skills.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No skills added yet.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Projects */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h3 className="flex items-center gap-2"><Briefcase size={22} color="var(--primary)" /> Projects</h3>
              {isOwnProfile && <button onClick={() => setShowAddProject(true)} className="nav-icon-link" style={{ background: 'var(--background)' }}><Plus size={20} /></button>}
            </div>
            <div className="flex flex-col gap-5">
              {projects.map(project => (
                <div key={project.id} className="flex flex-col gap-3 p-4" style={{ background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  {project.image && (
                    <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{project.title}</h4>
                    <div className="flex gap-2">
                      {project.github_link && (
                        <a href={project.github_link} target="_blank" rel="noreferrer" className="nav-icon-link">
                          <Github size={20} />
                        </a>
                      )}
                      <button className="nav-icon-link"><ExternalLink size={20} /></button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{project.description}</p>
                </div>
              ))}
              {projects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Showcase your best work here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Booking Modal */}
        {showBookingModal && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="card" style={{ width: '100%', maxWidth: '450px' }}>
              <div className="flex justify-between items-center mb-6">
                <h2>Book Help Session</h2>
                <button onClick={() => setShowBookingModal(false)} className="btn-ghost" style={{ padding: '8px' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleBooking} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label>Message to {profile.username}</label>
                  <textarea value={bookingData.message} onChange={(e) => setBookingData({...bookingData, message: e.target.value})} rows={3} required placeholder="What do you need help with?" />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Preferred Time</label>
                  <input type="datetime-local" value={bookingData.scheduled_time} onChange={(e) => setBookingData({...bookingData, scheduled_time: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Offered Price (₹)</label>
                  <input type="number" value={bookingData.price} onChange={(e) => setBookingData({...bookingData, price: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', background: 'var(--secondary)' }}>Send Request</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-6">
                <h2>Edit Profile</h2>
                <button onClick={() => setShowEditProfile(false)} className="btn-ghost" style={{ padding: '8px' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3 mb-2">
                   <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--background)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                      {profileImage ? <img src={URL.createObjectURL(profileImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.image ? <img src={profile.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={50} style={{ margin: '25px' }} />)}
                   </div>
                   <label className="btn-ghost flex gap-2 items-center" style={{ fontSize: '0.85rem' }}>
                      <Upload size={16} /> Change Photo
                      <input type="file" hidden onChange={(e) => setProfileImage(e.target.files[0])} accept="image/*" />
                   </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label>Bio</label>
                  <textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} rows={3} />
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                    <label>Age</label>
                    <input type="number" value={editData.age} onChange={(e) => setEditData({...editData, age: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                    <label>Contact No</label>
                    <input type="text" value={editData.contact_no} onChange={(e) => setEditData({...editData, contact_no: e.target.value})} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label>Address</label>
                  <input type="text" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Education</label>
                  <textarea value={editData.education} onChange={(e) => setEditData({...editData, education: e.target.value})} rows={2} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Update Profile</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Skill Modal */}
        {showAddSkill && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="card" style={{ width: '100%', maxWidth: '400px' }}>
              <div className="flex justify-between items-center mb-6">
                <h2>Add Skill</h2>
                <button onClick={() => setShowAddSkill(false)} className="btn-ghost" style={{ padding: '8px' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label>Skill Name</label>
                  <input type="text" value={newSkill.skill_name} onChange={(e) => setNewSkill({...newSkill, skill_name: e.target.value})} required placeholder="e.g. Python, React, Design" />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Level</label>
                  <select value={newSkill.level} onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Add to Profile</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Project Modal */}
        {showAddProject && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="card" style={{ width: '100%', maxWidth: '500px' }}>
              <div className="flex justify-between items-center mb-6">
                <h2>Add Project</h2>
                <button onClick={() => setShowAddProject(false)} className="btn-ghost" style={{ padding: '8px' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleAddProject} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label>Project Title</label>
                  <input type="text" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} required placeholder="Awesome Web App" />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Description</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} rows={3} required placeholder="What did you build?" />
                </div>
                <div className="flex flex-col gap-1">
                  <label>GitHub Link (Optional)</label>
                  <input type="url" value={newProject.github_link} onChange={(e) => setNewProject({...newProject, github_link: e.target.value})} placeholder="https://github.com/..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Project Image</label>
                  <input type="file" onChange={(e) => setNewProject({...newProject, image: e.target.files[0]})} accept="image/*" />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Create Project</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
