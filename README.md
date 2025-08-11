# Phrasa - French Language Learning App

A modern, AI-powered French language learning application built with React and OpenAI API. Phrasa helps users learn French through personalized sentence exercises tailored to their proficiency level.

## Features

- **Personalized Learning**: AI-generated French sentences based on your proficiency level
- **Interactive Exercises**: Decipher and translate French sentences
- **Progress Tracking**: Monitor your improvement over time
- **Beautiful UI**: Modern, responsive design with smooth animations
- **User Authentication**: Secure sign up and login functionality

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Modern CSS with gradient backgrounds and glassmorphism effects
- **Icons**: Lucide React
- **AI Integration**: OpenAI API for content generation
- **Build Tool**: Vite for fast development and building

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phrasa
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.jsx   # Authentication modal
│   └── AuthModal.css   # Authentication modal styles
├── services/           # API and external service integrations
│   └── openai.js      # OpenAI API service
├── HomePage.jsx       # Main home page component
├── HomePage.css       # Home page styles
├── App.jsx           # Main app component
├── App.css           # Global app styles
└── index.css         # Global CSS reset and base styles
```

## Upcoming Features

- User profile and progress tracking
- Multiple proficiency levels (Beginner, Intermediate, Advanced)
- Audio pronunciation with speech-to-text
- Gamification with points and achievements
- Community features and leaderboards
- Mobile app version

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Lucide React for beautiful icons
- The React and Vite communities for excellent development tools
# Phrasa
