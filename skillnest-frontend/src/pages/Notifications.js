import React, { useState, useEffect } from 'react';
import { notificationAPI, bookingAPI } from '../api';
import { Bell, Check, X, Calendar, User, ArrowRight, Clock, Info, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.list();
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleBookingAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await bookingAPI.accept(id);
      } else {
        await bookingAPI.reject(id);
      }
      alert(`Booking ${action}ed!`);
      fetchNotifications();
    } catch (error) {
      alert(`Failed to ${action} booking.`);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading notifications...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-3"><Bell size={28} color="var(--primary)" /> Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn-ghost" style={{ fontSize: '0.9rem' }}>Mark all as read</button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {notifications.map(notification => {
          const parts = notification.message.split('|');
          const type = parts[0];
          
          let content = null;

          if (type === 'BOOKING_REQUEST') {
            const [_, bId, sender, time, price, msg] = parts;
            content = (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>New Booking Request</p>
                    <p style={{ color: 'var(--text-muted)' }}>From <strong>{sender}</strong></p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex gap-2">
                      <button onClick={() => handleBookingAction(bId, 'accept')} className="btn-primary" style={{ padding: '6px 16px', background: 'var(--success)' }}><Check size={16} /> Accept</button>
                      <button onClick={() => handleBookingAction(bId, 'reject')} className="btn-ghost" style={{ padding: '6px 16px', color: 'var(--error)', border: '1px solid var(--error)' }}><X size={16} /> Reject</button>
                    </div>
                  )}
                </div>
                <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid var(--border)' }}>
                   <div className="flex items-center gap-2 text-sm"><Calendar size={14} color="var(--primary)" /> <strong>Date:</strong> {time}</div>
                   <div className="flex items-center gap-2 text-sm"><span style={{ fontWeight: 800, color: 'var(--success)' }}>₹</span> <strong>Offered:</strong> ₹{price}</div>
                   <div className="flex items-start gap-2 text-sm" style={{ gridColumn: '1/-1' }}>
                      <MessageCircle size={14} color="var(--text-muted)" style={{ marginTop: '3px' }} /> 
                      <span><strong>Message:</strong> "{msg}"</span>
                   </div>
                </div>
              </div>
            );
          } else if (type === 'USER_FOLLOW') {
            const [_, sender, msg] = parts;
            content = (
              <div className="flex items-center justify-between w-full">
                <p><strong>{sender}</strong> {msg}</p>
                <div style={{ color: 'var(--primary)' }}><User size={20} /></div>
              </div>
            );
          } else if (type === 'BOOKING_STATUS') {
            const [_, bId, sender, status] = parts;
            content = (
              <div className="flex items-center justify-between w-full">
                <p>Booking with <strong>{sender}</strong> was <strong style={{ color: status === 'ACCEPTED' ? 'var(--success)' : 'var(--error)' }}>{status}</strong></p>
                <Clock size={20} color="var(--text-muted)" />
              </div>
            );
          } else {
            content = <p>{notification.message}</p>;
          }

          return (
            <motion.div 
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ 
                padding: '1.5rem', 
                borderLeft: notification.is_read ? '1px solid var(--border)' : '4px solid var(--primary)',
                background: notification.is_read ? 'var(--surface)' : 'rgba(99, 102, 241, 0.05)',
                boxShadow: notification.is_read ? 'none' : 'var(--card-shadow)'
              }}
            >
              {content}
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(notification.created_at).toLocaleString()}
              </div>
            </motion.div>
          );
        })}

        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Your notifications will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
