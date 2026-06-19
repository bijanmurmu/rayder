# Rayder ☁️ - Modern Weather Application

A beautiful, responsive weather application built with Next.js 15, featuring real-time weather data, interactive maps, and a modern UI design.

![Rayder Weather App](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🌤️ **Real-time Weather Data** - Current weather conditions with detailed metrics
- 📊 **6-Day Forecast** - Extended weather predictions with hourly breakdowns
- 🗺️ **Interactive Weather Maps** - Temperature, precipitation, clouds, and wind layers
- 🌍 **Global Location Search** - Search weather for any city worldwide
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark/Light Mode** - Automatic theme detection with manual toggle
- ⭐ **Favorite Locations** - Save and quickly access your preferred locations
- 🔄 **Auto-refresh** - Automatic data updates with manual refresh option
- 💨 **Air Quality Index** - Real-time air pollution data
- ⚠️ **Weather Alerts** - Severe weather warnings and notifications
- 📤 **Share Weather** - Share current weather conditions
- 🎨 **Dynamic Backgrounds** - Weather-responsive background themes
- 🔍 **Search History** - Quick access to recently searched locations
- ♿ **Accessibility** - Full keyboard navigation and screen reader support
- 🚀 **PWA Ready** - Progressive Web App capabilities

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **API**: OpenWeatherMap API
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/bijanmurmu/Rayder.git
   cd Rayder
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your OpenWeatherMap API key:
   \`\`\`env
   OPENWEATHERMAP_API_KEY=your_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Setup

### Getting OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Generate a new API key
5. Add the key to your `.env.local` file

### API Endpoints Used

- **Current Weather**: `/data/2.5/weather`
- **5-Day Forecast**: `/data/2.5/forecast`
- **Air Quality**: `/data/2.5/air_pollution`
- **Weather Alerts**: `/data/2.5/onecall`
- **Geocoding**: `/geo/1.0/direct` & `/geo/1.0/reverse`

## 📁 Project Structure

\`\`\`
Rayder/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── weather/              # Weather data endpoint
│   │   ├── forecast/             # Forecast data endpoint
│   │   ├── air-quality/          # Air quality endpoint
│   │   ├── alerts/               # Weather alerts endpoint
│   │   └── geocode/              # Geocoding endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Loading UI
│   └── page.tsx                  # Main page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── error-boundary.tsx        # Error handling
│   ├── navbar.tsx                # Navigation bar
│   ├── recent-searches.tsx       # Search history
│   ├── weather-alerts.tsx        # Alert notifications
│   ├── weather-forecast.tsx      # Forecast display
│   ├── weather-map.tsx           # Interactive maps
│   └── theme-provider.tsx        # Theme management
├── hooks/                        # Custom React hooks
│   ├── use-weather-api.ts        # Weather API logic
│   ├── use-weather-preferences.ts # User preferences
│   └── use-toast.ts              # Toast notifications
├── lib/                          # Utility functions
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript definitions
│   └── weather.ts                # Weather data types
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables (gitignored)
├── .gitignore                    # Git ignore rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
\`\`\`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy with Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add `OPENWEATHERMAP_API_KEY` with your API key
   - Redeploy if necessary

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**: Use `npm run build` and deploy the `out` folder
- **Railway**: Connect GitHub repo and add environment variables
- **DigitalOcean**: Use App Platform with GitHub integration

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENWEATHERMAP_API_KEY` | Your OpenWeatherMap API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (for PWA) | No |

### Customization

#### Changing Default Location
Edit `app/page.tsx` and modify the fallback city:
\`\`\`typescript
fetchWeather("YourCity") // Change "Kolkata" to your preferred city
\`\`\`

#### Modifying Theme Colors
Edit `tailwind.config.js` to customize the color scheme:
\`\`\`javascript
theme: {
  extend: {
    colors: {
      // Add your custom colors here
    }
  }
}
\`\`\`

### Customizing the Favicon

The app comes with a default weather-themed favicon. To replace it with your own:

1. Replace the source image at `public/favicon.png` with your own SVG
2. Run the favicon generation script:
   \`\`\`bash
   npm run generate-favicons
   \`\`\`
3. This will create all necessary favicon files in various formats and sizes

Alternatively, you can manually replace all icon files in the `public/icons/` directory and the `public/favicon.ico` file.

## 🧪 Testing

\`\`\`bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
\`\`\`

## 📱 PWA Features

The app includes Progressive Web App capabilities:
- **Offline Support**: Basic offline functionality
- **Install Prompt**: Add to home screen on mobile devices
- **App-like Experience**: Full-screen mode on mobile
- **Fast Loading**: Optimized performance and caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add proper error handling
- Include accessibility features
- Test on multiple devices
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for icons
- [Vercel](https://vercel.com/) for hosting platform

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [documentation](https://github.com/bijanmurmu/Rayder/wiki)
- Contact: [your-email@example.com]

## 🔄 Changelog

### v1.0.0 (Latest)
- Initial release
- Real-time weather data
- Interactive maps
- Dark/light mode
- Responsive design
- PWA support

---

**Made with ❤️ by [Bijan Murmu](https://github.com/bijanmurmu)**

⭐ Star this repository if you found it helpful!
