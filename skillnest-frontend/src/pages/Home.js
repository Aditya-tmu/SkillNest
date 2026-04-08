import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, ShieldCheck, MapPin, Mail, Phone, MessageSquare, ChevronRight, Github, Twitter, Linkedin } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero" style={{ 
        padding: '6rem 0', 
        background: 'linear-gradient(135deg, rgba(10, 102, 194, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
        textAlign: 'center'
      }}>
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}
          >
            Empowering Students through <span style={{ color: 'var(--primary)' }}>Skill Sharing</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 2.5rem' }}
          >
            SkillNest is the ultimate student skill marketplace. Showcase your talents, get AI-verified, book help sessions, and network with students worldwide.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Link to="/register" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', textDecoration: 'none' }}>
              Get Started for Free
            </Link>
            <Link to="/login" className="btn-ghost" style={{ padding: '14px 32px', fontSize: '1.1rem', textDecoration: 'none' }}>
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" style={{ padding: '5rem 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why Choose SkillNest?</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to grow your skills and network.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(10, 102, 194, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Users size={28} style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Student Networking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Connect with peers based on shared interests and skills. Expand your professional network early.</p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(10, 102, 194, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <ShieldCheck size={28} style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>AI Skill Verification</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Get your skills verified by our AI-powered quiz system. Earn badges that prove your expertise.</p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(10, 102, 194, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <BookOpen size={28} style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Project Showcase</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Build a professional portfolio. Upload your projects, GitHub links, and PDFs to impress others.</p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(10, 102, 194, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <MapPin size={28} style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Local Discovery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Find students near you for in-person collaborations or study groups using our map-based discovery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', padding: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Get in Touch</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Have questions? We're here to help you navigate your SkillNest journey.</p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div style={{ color: 'var(--primary)' }}><Phone size={24} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Call / WhatsApp</div>
                    <div style={{ color: 'var(--text-muted)' }}>+91 7505762707</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ color: 'var(--primary)' }}><Mail size={24} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Email</div>
                    <div style={{ color: 'var(--text-muted)' }}>hpaditya87857@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ color: 'var(--primary)' }}><MessageSquare size={24} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Support</div>
                    <div style={{ color: 'var(--text-muted)' }}>24/7 Online Support</div>
                  </div>
                </div>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" style={{ background: 'var(--background)' }} />
              <input type="email" placeholder="Your Email" style={{ background: 'var(--background)' }} />
              <textarea placeholder="Your Message" rows={4} style={{ background: 'var(--background)' }}></textarea>
              <button className="btn-primary" style={{ width: 'max-content', padding: '12px 32px' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}>SkillNest</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2024 SkillNest. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="btn-ghost" style={{ padding: '8px' }}><Twitter size={20} /></a>
              <a href="#" className="btn-ghost" style={{ padding: '8px' }}><Linkedin size={20} /></a>
              <a href="#" className="btn-ghost" style={{ padding: '8px' }}><Github size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
