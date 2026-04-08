# 🚀 SkillNest - Student Skill Marketplace & Networking Platform

**SkillNest** is a cutting-edge networking and marketplace platform designed specifically for students to showcase their skills, verify them through AI-driven assessments, book peer-to-peer help sessions, and build a professional network.

---

## ✨ Key Features

### 👤 Profile & Discovery
- **Location-Based Discovery:** Find skilled peers nearby using integrated geolocation and Haversine distance calculations.
- **Smart Recommendations:** Receive personalized peer recommendations based on skill overlap and ratings.
- **Project Showcase:** Display your work with integrated GitHub links and PDF documentation.

### 🤖 AI Skill Verification
- **Automated Quiz Generation:** Verify user skills using **Google Gemini AI** to generate context-aware MCQs.
- **Verification Badges:** Earn "Verified" status upon successful completion of AI assessments to build trust.

### 🤝 Networking & Social
- **Real-time Feed:** Share updates, like, and comment on peer posts.
- **Connections:** Follow fellow students and stay updated on their achievements.
- **Smart Notifications:** Real-time alerts for booking requests, status updates, and new followers.

### 📅 Marketplace & Bookings
- **Help Sessions:** Request or provide help sessions with customizable pricing and scheduling.
- **Booking Management:** Integrated workflow for accepting, rejecting, and tracking session statuses.
- **Reviews & Ratings:** Comprehensive feedback system for completed help sessions.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django & Django REST Framework (DRF)
- **Real-time:** Django Channels & Daphne (WebSockets)
- **Database:** PostgreSQL
- **AI Integration:** Google Gemini API (Generative AI)
- **Geo-Location:** Haversine for distance-based discovery

### Frontend
- **Library:** React.js (TypeScript)
- **Animations:** Framer Motion
- **Icons:** Lucide-React
- **API Client:** Axios

---

## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm
- PostgreSQL

### 🔧 Backend Setup
1. **Navigate to backend:**
   ```bash
   cd skillnest_backend
   ```
2. **Create and Activate Virtual Environment:**
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   DB_NAME=skillnest
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
5. **Database Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. **Run Server:**
   ```bash
   python manage.py runserver
   ```

### 💻 Frontend Setup
1. **Navigate to frontend:**
   ```bash
   cd skillnest-frontend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Run Application:**
   ```bash
   npm start
   ```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developed By
**Aditya**
- [GitHub](https://github.com/your-username)
- [LinkedIn](https://linkedin.com/in/your-profile)

---
*Created with ❤️ for the student community.*
