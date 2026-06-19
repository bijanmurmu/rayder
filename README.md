# Rayder ☁️ - Cinematic Weather Engine

A visually stunning, high-performance weather application built with Next.js 16. Rayder abandons the standard, cluttered weather app UI in favor of a **Cinematic Minimalist** aesthetic—featuring deep translucent glassmorphism, dynamic contextual gradients, and highly polished micro-interactions. 

![Rayder Weather App](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Premium Features

- 🎭 **Cinematic Minimalist UX:** Deep slate tones, vibrant accent colors, and precise geometric layouts.
- 🌓 **Dynamic Modal Shifting:** Forecast popups dynamically tint based on the weather—warm amber for sun, deep slate for rain, and frosted white for snow.
- 📉 **Interactive SVG Temperature Curves:** View bespoke, mathematically generated SVG line graphs plotting the precise temperature and rain probability over the next 24 hours.
- 🌍 **Quad-Layer Radar Engine:** High-performance integration with Windy.com offering Temperature, Precipitation, Cloud Cover, and Wind Speed maps.
- 📍 **"Recenter" Map Auto-Pan:** A sleek, frosted-glass Floating Action Button on the radar map to instantly snap back to your location.
- ☀️ **Solar Trajectory Widget:** A beautiful, real-time geometric arc visualizing the sun's exact position between sunrise and sunset.
- 💨 **Contextual Metrics Grid:** Metrics (Wind, Humidity, Pressure, AQI) with meticulously colorized icons for instant scannability.
- 🔍 **Free, No-Key Geocoding:** Powered entirely by the open-source Nominatim engine (no API keys required).
- ☁️ **High-Fidelity Weather Data:** Powered by the incredibly accurate and free Open-Meteo API.

## 🛠️ Architecture & Tech Stack

Rayder is engineered to be **100% free to run and host**, eliminating legacy dependencies on paid weather keys (like OpenWeatherMap). 

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Native Vanilla CSS Tokens)
- **Icons**: Lucide React
- **Weather Provider**: [Open-Meteo](https://open-meteo.com/) (100% Free & Open Source)
- **Geocoding**: [Nominatim OpenStreetMap](https://nominatim.org/)
- **Radar Engine**: Windy.com Embed API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bijanmurmu/Rayder.git
   cd Rayder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`. **No API keys are required for weather or geocoding!** You only need to set the `NEXT_PUBLIC_APP_URL` for SEO generation:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Rayder/
├── app/                          # Next.js App Router
│   ├── api/                      
│   │   ├── weather-all/          # Consolidated Open-Meteo endpoint (Forecast, Current, AQI)
│   │   └── geocode/              # Nominatim reverse-geocoding endpoint
│   ├── globals.css               # Core Cinematic CSS Tokens
│   ├── layout.tsx                # Root layout & Metadata
│   └── page.tsx                  # Main dashboard layout
├── components/                   # React components
│   ├── weather-forecast.tsx      # Interactive 7-Day Forecast & SVG Graphs
│   ├── weather-map.tsx           # Quad-Layer Windy Radar Engine
│   └── theme-provider.tsx        # Next-Themes provider
├── public/                       # Static assets
│   └── icon.svg                  # Custom Geometric Radar Icon
├── .env.local                    # Local environment variables (URL only)
├── tailwind.config.js            # Tailwind configuration
└── next.config.mjs               # Next.js configuration
```

## 🌐 Deployment

Rayder is perfectly optimized for seamless deployment on **Vercel**:

1. Push your code to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Set your Production `NEXT_PUBLIC_APP_URL` environment variable to your final Vercel domain (e.g., `https://rayder.vercel.app`).
4. Deploy!

Because the application uses Open-Meteo and Nominatim, there are **no secret API keys** to leak, making it incredibly secure and easy to fork.

## 🤝 Contributing

We welcome contributions to push the Cinematic Minimalist design even further! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Designed and Engineered with ❤️ by [Bijan Murmu](https://github.com/bijanmurmu)**

⭐ Star this repository if you love the cinematic design!
