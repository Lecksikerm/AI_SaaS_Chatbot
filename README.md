# 💬 AI SaaS Chat Frontend

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Paystack](https://img.shields.io/badge/Paystack-00C3F7?style=for-the-badge&logo=stripe&logoColor=white)](https://paystack.com/)

**Modern React frontend for AI-powered chat with real-time streaming, authentication, and payments.**

🌐 **Live URL:** `https://lecksibot.vercel.app`  
🔗 **API Base:** `https://ai-chatbot-58g6.onrender.com`

[![Version](https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Real-time Streaming** | Fast character-by-character AI response streaming like ChatGPT/Kimi |
| 🔐 **Authentication** | JWT login, registration, and Google OAuth integration |
| 💳 **Paystack Payments** | Seamless Pro subscription upgrades with polling verification |
| 💾 **Chat History** | Persistent conversations with MongoDB backend storage |
| 📁 **File Uploads** | Upload images, PDFs, and documents to chat |
| 📱 **Responsive Design** | Mobile-first sidebar and chat interface |
| 🎨 **Modern UI** | Dark theme with gradient accents and smooth animations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running (see [Backend README](../backend/README.md))

### Installation

```bash
# Clone repository
git clone https://github.com/Lecksikerm/AI_SaaS_Chatbot
cd ai-chatbot/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
Build for Production
bash
Copy
npm run build
⚙️ Environment Variables
Create .env.local file:
env
Copy
# API Configuration
VITE_API_URL=https://ai-chatbot-58g6.onrender.com

# Authentication
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Payments
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_key
📁 Project Structure
plain
Copy
frontend/
├── src/
│   ├── components/
│   │   └── Chat.jsx          # Main chat interface
│   ├── contexts/
│   │   └── AuthContext.jsx   # Authentication state
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── Chat.jsx          # Chat page
│   │   └── Payment.jsx       # Subscription upgrade
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
🎨 Key Components
Chat Interface (src/pages/Chat.jsx)
Real-time message streaming with auto-scroll
Markdown rendering with syntax highlighting
File attachment support
Conversation sidebar with hover-delete
Usage tracking for free tier
Authentication (src/contexts/AuthContext.jsx)
JWT token management
Automatic token refresh
Google OAuth integration
Protected route handling
Payments (src/pages/Payment.jsx)
Paystack integration
Automatic payment polling (no webhooks needed)
Pro plan selection (monthly/yearly)
Instant upgrade on success
🛠️ Tech Stack
Table
Copy
Technology	Purpose
React 18	UI library with hooks
Vite	Fast build tool
Tailwind CSS	Utility-first styling
React Router	Client-side routing
Axios	HTTP client
React Paystack	Payment integration
React Google Login	OAuth
React Markdown	Markdown rendering
PrismJS	Syntax highlighting
Lucide React	Icon library
📱 Screenshots
<div align="center">
Table
Copy
Chat Interface	Payment Page	Sidebar
https://via.placeholder.com/300x200/343541/10a37f?text=Chat+Interface	https://via.placeholder.com/300x200/343541/10a37f?text=Payment+Page	https://via.placeholder.com/300x200/343541/10a37f?text=Sidebar
</div>
🔧 Customization
Changing Colors
Edit tailwind.config.js:
JavaScript
Copy
theme: {
  extend: {
    colors: {
      primary: '#10a37f',    // Change brand color
      secondary: '#343541',  // Change background
    }
  }
}
Adjusting Streaming Speed
In src/pages/Chat.jsx, modify the interval:
JavaScript
Copy
const streamInterval = setInterval(() => {
  // ... streaming logic
}, 10); // Lower = faster (current: 10ms)
🐛 Troubleshooting
Table
Copy
Issue	Solution
CORS errors	Ensure VITE_API_URL matches backend CORS settings
Paystack not loading	Check VITE_PAYSTACK_PUBLIC_KEY is correct
Google login fails	Verify Google OAuth credentials and redirect URIs
Build fails	Delete node_modules and run npm install
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📝 License
Distributed under the MIT License. See LICENSE for more information.
<div align="center">
Built with ❤️ by Lecksikerm
https://linkedin.com/in/lecksikerm
mailto:idrisolalekann@gmail.com
</div>
```