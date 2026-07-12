# SmartAgriSense 🌾

**SmartAgriSense** is an AI-powered advisory platform designed to empower small and marginal farmers in India with real-time, data-driven agricultural intelligence.

## 🚀 Features

- **Multilingual AI Advisory**: Personalized crop guidance in regional languages.
- **Weather Intelligence**: Real-time forecasts and predictive alerts.
- **Soil Health Engine**: Nutrient analysis and fertilizer recommendations.
- **Market Price Dashboard**: Live Mandi prices and trend visualization.
- **Pest & Disease Diagnosis**: AI-based image analysis for crop health.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, Framer Motion, Lucide React
- **Language**: TypeScript
- **State Management**: React Hooks

## 📂 Project Structure

```
src/
├── app/                # App Router pages and layouts
│   ├── dashboard/      # Dashboard routes (Weather, Advisory, etc.)
│   ├── globals.css     # Global styles and theme variables
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Hero.tsx
│   └── ...
├── lib/                # Utility functions
└── ...
```

## 🏃‍♂️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Implementation Plan

See [implementation_plan.md](./implementation_plan.md) for the detailed roadmap and architecture.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
