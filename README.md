# 🌿 MoodAware — Intelligent Wellness & Mood Tracker

> A modern, mobile-first wellness web application featuring gamified mindfulness, guided breathwork, voice journaling, and predictive health insights.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ganesh-moodawareapp.onrender.com)
[![GitHub License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

---

### 🌐 Live Application
🔗 **[https://ganesh-moodawareapp.onrender.com](https://ganesh-moodawareapp.onrender.com)**

---

## 🌟 Key Features

### 1. 🌿 Living "Mood Garden" (Gamified Wellness Avatar)
- A digital plant that levels up with your check-in streaks and mindfulness habits:
  - 🌱 **Level 1**: Sprouting Seed
  - 🌿 **Level 2**: Young Sapling
  - 🪴 **Level 3**: Lush Plant
  - 🌸 **Level 4**: Blooming Bonsai
  - 🌳 **Level 5**: Serenity Tree
- Interactive **Water Garden 💧** and **Give Sun ☀️** actions with joyful animations.

### 2. 🫁 Guided Breathwork Sanctuary
- Science-backed breathing exercises:
  - **4-4-4-4 Box Breathing** (Navy SEAL anti-anxiety technique)
  - **4-7-8 Deep Calm** (Natural nervous system tranquilizer)
  - **Resonant Balance** (5.5s equal pacing for heart rate variability)
- **Built-in 432Hz harmonic singing chime** generated on-the-fly using the native Web Audio API (100% offline).

### 3. 🎙️ 1-Tap Voice Journaling & Dictation
- Native browser speech-to-text with audio waveform animations.
- Speak freely to transcribe your thoughts into daily check-ins and feelings journal notes without typing.

### 4. 💌 "Future Self" Emotional Time Capsules
- Write an uplifting reminder on high-energy days (4–5/5 mood).
- MoodAware seals the message and automatically delivers it to your dashboard on days when you feel low or stressed.

### 5. 🔮 Predictive Wellness Engine
- Statistical correlation engine that links your sleep duration, screen time, and physical activity with your mood.
- Delivers actionable insights (e.g. *"Sleeping 7+ hours boosts your mood by +35%"*).

### 6. 🔒 Enterprise-Grade Privacy & Security
- **Scrypt salted password hashing** (passwords are never saved in plaintext or returned in API responses).
- **Session-based authentication** with `httpOnly`, `sameSite: lax`, and SSL protection.
- **Strict User Isolation**: All check-ins, journals, plans, and time capsules are scoped to the individual user.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, Lucide React, Wouter
- **Backend**: Node.js, Express, TypeScript, Passport.js, Express-Session
- **Database & ORM**: PostgreSQL (Production) / SQLite / In-Memory (Dev), Drizzle ORM
- **Web APIs**: Web Audio API (Tone synthesis), Web Speech API (Voice dictation)
- **Hosting**: Render.com

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/3132Ganesh/Mood-Aware.git
cd Mood-Aware
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open `http://localhost:5000` in your browser.

### 4. Build for production
```bash
npm run build
npm start
```

---

## 📱 Mobile App / PWA Support
MoodAware is optimized for mobile screens and can be added as a Progressive Web App (PWA):
1. Open `https://ganesh-moodawareapp.onrender.com` on your mobile browser (Chrome / Safari).
2. Tap **Share** or **Browser Menu (⋮)** $\rightarrow$ **"Add to Home Screen"**.
3. Launch MoodAware directly from your phone's home screen with full-screen experience.

---

## 🤝 Contributing (Open Source)

Contributions are welcome! Feel free to open an issue or submit a Pull Request:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author
**Ganesh** — [GitHub (@3132Ganesh)](https://github.com/3132Ganesh)
- Email: meghavathganeshnayak@gmail.com
- Live Project: [https://ganesh-moodawareapp.onrender.com](https://ganesh-moodawareapp.onrender.com)
