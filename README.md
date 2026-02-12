# 🎙️ AI Interview Assistant

A comprehensive AI-powered platform for interview preparation, resume analysis, and performance feedback.

## 🌟 Features

- **🎯 Smart Interview Creation**: Technical, Behavioral, or Combined interviews
- **📄 Resume Analysis**: AI-powered parsing and ATS scoring
- **🎤 Real-time Voice Interviews**: Natural conversation with AI interviewer
- **📊 Detailed Feedback**: Performance analytics and improvement suggestions
- **📈 Progress Tracking**: Monitor improvement over multiple sessions
- **🔒 Secure & Private**: Firebase authentication and data encryption

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks + SWR
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore

### Backend
- **Framework**: FastAPI (Python)
- **AI Services**:
  - Groq (LLM)
  - AssemblyAI (Speech-to-Text)
  - Murf AI (Text-to-Speech)
  - SerpAPI (Web Search)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Firebase project
- API keys for:
  - Groq
  - AssemblyAI
  - Murf AI
  - SerpAPI

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-interview-assistant.git
cd ai-interview-assistant
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/firebase_admin_key.json`
5. Get your web app config (for frontend .env)

### 3. Environment Configuration

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```bash
GROQ_API_KEY=your_groq_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
MURF_API_KEY=your_murf_key
SERPAPI_KEY=your_serpapi_key
FIREBASE_CREDENTIALS_PATH=./firebase_admin_key.json
```

### 4. Installation

Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ai-interview-assistant/
├── frontend/          # Next.js application
├── backend/           # FastAPI server
├── shared/            # Shared types/utilities
└── docs/              # Documentation
```

## 🔑 Getting API Keys

1. **Groq**: [console.groq.com](https://console.groq.com)
2. **AssemblyAI**: [assemblyai.com](https://www.assemblyai.com)
3. **Murf AI**: [murf.ai](https://murf.ai)
4. **SerpAPI**: [serpapi.com](https://serpapi.com)

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with ❤️ using Next.js, FastAPI, and Firebase