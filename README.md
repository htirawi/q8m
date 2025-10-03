# Vue 3 Quiz Platform

A professional, multi-framework interview preparation application built with Vue 3, TypeScript, and Tailwind CSS. Practice with **500+ curated questions** across Angular, React, Next.js, Redux, and more.

## 🚀 Features

- **Multi-Framework Support**: Practice questions for Angular, React, Next.js, Redux, and Random topics
- **Interactive Quiz System**: Dynamic quiz interface with multiple question types
- **Enhanced Question Cards**: Rich markdown rendering with syntax highlighting
- **Study Features**: Bookmarks, notes, progress tracking, and study timer
- **Study Analytics**: Comprehensive performance tracking and analytics dashboard
- **Offline Support**: Progressive Web App with offline capabilities
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **PWA Support**: Install as a Progressive Web App
- **Keyboard Shortcuts**: Navigate efficiently with keyboard controls
- **Bilingual Support**: English and Arabic language support
- **Payment Integration**: Secure payment processing with multiple providers
- **Accessibility**: WCAG AA compliant with screen reader support

## 🛠️ Tech Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Internationalization**: Vue-i18n
- **Testing**: Vitest, Vue Test Utils, Playwright
- **Code Quality**: ESLint, Prettier, Husky
- **Security**: CSRF protection, secure cookies, input validation
- **Deployment**: Vercel, GitHub Pages

## 📁 Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base UI components (Button, Input, Modal, etc.)
│   │   ├── layout/          # Layout components (AppLayout, etc.)
│   │   ├── payment/         # Payment-related components
│   │   └── content/         # Content-specific components
│   ├── views/               # Main application pages
│   ├── stores/              # Pinia stores (auth, payment, theme)
│   ├── composables/         # Vue 3 composables
│   ├── router/              # Vue Router configuration
│   ├── locales/             # Internationalization files
│   ├── styles/              # Global styles and design tokens
│   └── types/               # TypeScript type definitions
server/
├── src/
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── models/              # Database models
│   ├── middlewares/         # Express middlewares
│   └── config/              # Configuration files
shared/
├── types/                   # Shared TypeScript types
├── schemas/                 # Zod validation schemas
└── constants/               # Shared constants
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/htirawi/quiz-platform.git
   cd quiz-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start client (Vue 3)
   cd client && pnpm dev
   
   # Start server (Node.js)
   cd server && pnpm dev
   ```

5. **Open your browser**
   - Client: http://localhost:5173
   - Server: http://localhost:3000

## 🧪 Testing

### Unit Tests
```bash
cd client
pnpm test
```

### E2E Tests
```bash
cd client
pnpm test:e2e
```

### Coverage Report
```bash
cd client
pnpm test:coverage
```

## 🔧 Development

### Code Quality
```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Run all quality checks
pnpm validate
```

### Pre-commit Hooks
The project uses Husky for pre-commit hooks:
- ESLint checks
- Prettier formatting
- TypeScript type checking
- Test execution

### Git Workflow
- Use conventional commits
- Create feature branches
- Submit pull requests
- Follow the contributing guidelines

## 🚀 Deployment

### Production Build
```bash
cd client
pnpm build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to GitHub Pages
```bash
# Build and deploy
pnpm build
# Follow GitHub Pages setup instructions
```

## 🔒 Security

- **Authentication**: JWT with secure httpOnly cookies
- **CSRF Protection**: Token-based CSRF protection
- **Input Validation**: Zod schema validation
- **XSS Prevention**: Input sanitization
- **Secure Headers**: CSP, HSTS, and other security headers
- **Payment Security**: PCI-compliant payment processing

## 🌐 Internationalization

The platform supports multiple languages:
- English (en)
- Arabic (ar)

To add a new language:
1. Create a new locale file in `client/src/locales/`
2. Add the language to the i18n configuration
3. Update the language selector component

## ♿ Accessibility

- **WCAG AA Compliance**: Meets accessibility standards
- **Screen Reader Support**: Proper ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus indicators
- **Color Contrast**: Meets contrast requirements

## 📊 Performance

- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Lazy loading and optimization
- **Caching**: Service worker for offline support
- **Bundle Analysis**: Regular bundle size monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API best practices
- Use TypeScript for type safety
- Write tests for new features
- Follow the existing code style
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors who help improve this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/htirawi/quiz-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/htirawi/quiz-platform/discussions)
- **Email**: support@quiz-platform.com

---

Made with ❤️ by [Hussein Tirawi](https://github.com/htirawi)