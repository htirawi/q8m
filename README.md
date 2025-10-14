# Quiz Platform

A modern, multilingual quiz and study platform built with Vue 3, TypeScript, and Node.js.

## 🚀 Features

- **Multi-Framework Support**: Angular, React, Vue.js, Next.js, Redux
- **Multilingual**: English and Arabic (RTL) support
- **Study & Quiz Modes**: Interactive learning with progress tracking
- **Tiered Access**: Free, Intermediate, Senior, and Bundle tiers
- **Payment Integration**: Stripe, PayPal, and regional payment providers
- **PWA Support**: Progressive Web App capabilities
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🏗️ Architecture

### Monorepo Structure

```
├── client/          # Vue 3 frontend application
├── server/          # Node.js/Express backend API
├── shared/          # Shared types and schemas
├── local-data/      # Local development content (git-ignored)
└── docs/           # Documentation
```

### Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Testing**: Vitest + Playwright + Testing Library
- **State Management**: Pinia
- **Internationalization**: Vue I18n
- **Payment**: Stripe + PayPal + Regional providers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- MongoDB

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quiz-platform

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Environment Setup

1. Copy `.env.example` to `.env` in both `client/` and `server/` directories
2. Configure your MongoDB connection and API keys
3. Run database migrations: `pnpm migrate`

## 📁 Project Structure

### Client (`/client`)

```
src/
├── components/       # Reusable UI components
├── features/         # Feature-based modules
├── composables/      # Vue 3 composables
├── stores/          # Pinia stores
├── services/        # API services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── config/          # Configuration files
└── assets/          # Static assets
```

### Server (`/server`)

```
src/
├── routes/          # API route handlers
├── models/          # MongoDB models
├── middleware/      # Express middleware
├── services/        # Business logic
├── migrations/      # Database migrations
└── utils/           # Server utilities
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

### Docker

```bash
docker-compose up -d
```

## 📚 Documentation

- [Architecture](./docs/architecture/)
- [API Documentation](./docs/server/)
- [Development Guide](./docs/development/)
- [Deployment Guide](./docs/deployment/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Check the [documentation](./docs/)
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines

---

Built with ❤️ using Vue 3 and modern web technologies.
