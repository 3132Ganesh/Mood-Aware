# 🎯 Mood-Aware: Wellness Application

> A comprehensive mood-aware wellness application designed to help users track their emotional well-being, manage personalized wellness plans, build positive habits, and maintain a feelings journal for mental health awareness.

![Mood-Aware Badge](https://img.shields.io/badge/status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🌟 Overview

Mood-Aware is an intelligent wellness application that combines mood tracking, personalized wellness planning, habit formation, and emotional journaling into a single comprehensive platform. The application uses mood-aware insights to provide personalized recommendations and wellness strategies tailored to the user's emotional state and patterns.

### Key Objectives:
- **Emotional Awareness**: Help users understand their mood patterns and emotional triggers
- **Wellness Planning**: Provide personalized wellness plans based on mood data
- **Habit Building**: Encourage positive habits that improve mental well-being
- **Journaling**: Maintain a reflective journal to track feelings and progress
- **Analytics**: Visual insights into mood trends and patterns over time

---

## ✨ Features

### 1. **Mood Tracking**
   - Daily mood logging with emoji/visual indicators
   - Mood intensity scale (1-10)
   - Mood categorization (Happy, Sad, Anxious, Calm, Energetic, etc.)
   - Historical mood data visualization
   - Mood trend analysis

### 2. **Personalized Wellness Plans**
   - AI-driven wellness recommendations based on current mood
   - Customizable daily/weekly wellness activities
   - Exercise recommendations
   - Meditation and mindfulness suggestions
   - Nutrition guidance
   - Sleep optimization tips
   - Social interaction recommendations

### 3. **Habit Tracking**
   - Create and track daily habits
   - Habit completion streaks
   - Mood-based habit suggestions
   - Progress analytics
   - Habit reminders and notifications
   - Habit categories (Exercise, Reading, Meditation, Hydration, etc.)

### 4. **Feelings Journal**
   - Write detailed journal entries
   - Mood association with each entry
   - Emotion keywords tagging
   - Entry timestamps
   - Search and filter journal entries
   - Reflective insights from entries
   - Sentiment analysis of journal entries

### 5. **Dashboard Analytics**
   - Mood distribution charts
   - Weekly/monthly mood trends
   - Habit completion statistics
   - Wellness activity compliance
   - Emotional pattern recognition
   - Correlation between activities and mood improvement

### 6. **Notifications & Reminders**
   - Daily mood check-in reminders
   - Habit completion notifications
   - Wellness activity alerts
   - Journal prompt suggestions

---
## Tech Stack
- **Backend**: Node.js + TypeScript + MCP Server
- **Database**: SQLite + Drizzle ORM  
- **Frontend**: React + Vite + Tailwind + shadcn/ui
- **AI Layer**: Anthropic MCP Protocol
```

**2. Add a `.gitignore` entry** — make sure these are ignored:
```
node_modules/
.env
*.db
mood_tracker.db

---

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git
- (Optional) Docker and Docker Compose

### Step 1: Clone the Repository

```bash
git clone https://github.com/3132Ganesh/Mood-Aware.git
cd Mood-Aware
```

### Step 2: Create Virtual Environment

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies (if applicable)
cd frontend
npm install
```

### Step 4: Set Up Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://user:password@localhost/mood_aware
# SECRET_KEY=your_secret_key_here
# JWT_SECRET=your_jwt_secret
```

### Step 5: Initialize Database

```bash
# Run migrations
python manage.py migrate

# Create superuser (if using Django)
python manage.py createsuperuser
```

### Step 6: Run the Application

```bash
# Start backend server
python app.py
# or
python manage.py runserver

# In another terminal, start frontend
cd frontend
npm start
```

The application will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` or `http://localhost:8000` (backend).

---

## 📁 Project Structure

```
Mood-Aware/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── mood.py
│   │   │   ├── habit.py
│   │   │   ├── wellness_plan.py
│   │   │   └── journal.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── mood.py
│   │   │   ├── habits.py
│   │   │   ├── wellness.py
│   │   │   └── journal.py
│   │   ├── services/
│   │   │   ├── mood_analyzer.py
│   │   │   ├── recommendation_engine.py
│   │   │   └── analytics.py
│   │   └── utils/
│   │       ├── validators.py
│   │       └── helpers.py
│   ├── config.py
│   ├── requirements.txt
│   └── app.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MoodTracker.jsx
│   │   │   ├── HabitTracker.jsx
│   │   │   ├── Journal.jsx
│   │   │   └── WellnessPlans.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── tests/
│   ├── test_models.py
│   ├── test_routes.py
│   └── test_services.py
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── README.md
└── LICENSE
```

---

## 💻 Usage

### For Users

1. **Sign Up/Login**: Create an account and log in to the application

2. **Track Your Mood**:
   - Navigate to "Mood Tracker"
   - Select your current mood
   - Rate the intensity (1-10)
   - Add optional notes about what triggered this mood
   - Save the entry

3. **View Wellness Plans**:
   - Go to "Wellness Plans" section
   - Review AI-generated recommendations
   - Accept or customize suggestions
   - Track your progress

4. **Manage Habits**:
   - Create new habits in "Habits" section
   - Set frequency (daily, weekly)
   - Check off completed habits
   - View habit streaks and statistics

5. **Write Journal Entries**:
   - Go to "Journal" section
   - Write detailed feelings and thoughts
   - Tag associated emotions
   - Review past entries for self-reflection

6. **Analyze Progress**:
   - View dashboard analytics
   - Check mood trends over time
   - Identify correlations between activities and mood
   - Download mood reports

---

## 🧠 How It Works

### Mood Analysis Algorithm
The application uses sentiment analysis and mood pattern recognition to:
- Identify mood trends and cycles
- Detect emotional triggers
- Predict mood changes based on activities
- Generate personalized insights

### Recommendation Engine
- Analyzes user's mood, habits, and journal entries
- Recommends wellness activities with highest success rate
- Suggests habits to build based on mood patterns
- Provides real-time wellness suggestions

### Data Privacy
- All user data is encrypted and securely stored
- User mood data is kept private and never shared
- GDPR compliant data handling

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Guidelines:
- Follow PEP 8 for Python code
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Comment your code

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

**Author**: Ganesh (3132Ganesh)

**Connect With Me**:
- GitHub:https://github.com/3132Ganesh
- Email:meghavathganeshnayak@gmail.com
- LinkedIn: Meghavath Ganeshnayak

**Report Issues**: Please use the [GitHub Issues](https://github.com/3132Ganesh/Mood-Aware/issues) page

---

## 🚀 Future Enhancements

- [ ] AI chatbot for wellness coaching
- [ ] Integration with wearable devices (Apple Watch, Fitbit)
- [ ] Mobile app (React Native / Flutter)
- [ ] Group wellness challenges
- [ ] Integration with music streaming for mood-based playlists
- [ ] Video meditation library
- [ ] Community forum for peer support
- [ ] Export mood data to PDF reports
- [ ] Integration with Google Calendar for activity scheduling
- [ ] Machine learning model for mood prediction

---

## 📊 Statistics & Metrics

- **Lines of Code**: ~5000+
- **Database Tables**: 6+
- **API Endpoints**: 20+
- **Frontend Components**: 15+

---

## ⭐ Support

If you find this project helpful, please consider:
- Giving it a ⭐ on GitHub
- Sharing it with others
- Contributing to the project
- Providing feedback and suggestions

---

**Made with ❤️ by [Ganesh](https://github.com/3132Ganesh)**
