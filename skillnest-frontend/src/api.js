import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/token/', data),
};
export const profileAPI = {
  getProfile: (username) => api.get(`/profiles/${username}/`),
  updateProfile: (username, data) => api.patch(`/profiles/${username}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  discover: (lat, lng, radius) => api.get(`/profiles/discover/?lat=${lat}&lng=${lng}&radius=${radius}`),
  recommendations: () => api.get('/profiles/recommendations/'),
  follow: (followingId) => api.post('/connections/', { following: followingId }),
};

export const skillAPI = {
  list: () => api.get('/skills/'),
  trending: () => api.get('/skills/trending/'),
  userSkills: (username) => api.get(`/user-skills/?username=${username}`),
  addSkill: (data) => api.post('/user-skills/', data),
  verifySkill: (id) => api.post(`/user-skills/${id}/verify_skill/`),
  submitQuiz: (skillId, quizId, answers) => api.post(`/user-skills/${skillId}/submit-quiz/${quizId}/`, { answers }),
};

export const projectAPI = {
  list: (username) => api.get(`/projects/?username=${username}`),
  addProject: (data) => api.post('/projects/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings/', data),
  accept: (id) => api.post(`/bookings/${id}/accept/`),
  reject: (id) => api.post(`/bookings/${id}/reject/`),
  list: () => api.get('/bookings/'),
};

export const notificationAPI = {
  list: () => api.get('/notifications/'),
  markRead: () => api.post('/notifications/mark_all_read/'),
};

export default api;
