# SmartAgriSense 🌱

**SmartAgriSense** is an AI-powered advisory platform designed to empower small and marginal farmers in India with real-time, data-driven agricultural intelligence. 

Leveraging cutting-edge technologies like Large Language Models (LLMs), real-time weather forecasting, and market data, this platform acts as an all-in-one assistant (Krishi Mitra) for farmers to maximize their yield and income.

![SmartAgriSense Dashboard Preview](./public/noise.png)

## 🚀 Key Features

*   🌍 **Multilingual AI Advisory:** Crop guidance and chat support powered by Groq & Gemini available in English, Hindi, Tamil, Telugu, Marathi, Kannada, Bengali, and Punjabi.
*   🌤️ **Weather Intelligence:** Real-time forecasts, precipitation alerts, and daily farming advice tailored to the weather.
*   🚜 **Smart Scheme Recommender (Yojana Sahayak):** An intelligent engine that matches a farmer’s profile (age, land size, category) against live Indian Government schemes (PM-KISAN, PMFBY, KCC, etc.) and provides direct application links.
*   📈 **Market Price Dashboard:** Live Mandi prices and Minimum Support Price (MSP) analytics to help farmers make better selling decisions.
*   🐛 **Pest & Disease Diagnosis:** AI-based analysis for identifying crop health issues and recommending actionable treatments.
*   🧪 **Soil Health & Fertilizer Calculator:** Dynamic calculators to estimate precise NPK requirements based on farm size and crop type.

## 🛠️ Technology Stack

*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
*   **Icons:** Lucide React
*   **Language:** TypeScript
*   **AI Integration:** Groq API (LLaMA 3) & Google Gemini API

## 📂 Project Structure

```
smart-agri-sense/
├── src/
│   ├── app/                # App Router pages and API routes
│   │   ├── api/            # Backend endpoints for AI and Dashboards
│   │   ├── dashboard/      # Protected dashboard modules
│   │   └── ...             # Public pages (Login, Signup, Yojana Sahayak)
│   ├── components/         # Reusable UI components (Navbar, Hero, Cards)
│   ├── lib/                # Utility functions, AI Prompts, and Data Models
│   └── middleware.ts       # Route protection and authentication logic
├── public/                 # Static assets (icons, manifest)
└── tailwind.config.ts      # Tailwind CSS configuration
```

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/UDaygupta12512/smart-agri-sense.git
cd smart-agri-sense
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env.local` file in the root directory and add your API keys:
```env
# Required for AI Advisory and Chat features
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Run the Development Server
```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application. 

## 🔐 Authentication Flow
- The application uses a custom cookie-based session simulator for demonstration purposes.
- New users must click **"Start for Free"** to create an account before accessing the `/dashboard` routes.
- Once registered, the user state is persisted locally.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
