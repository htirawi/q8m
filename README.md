# Q8M - Professional Quiz & Learning Platform

<div align="center">

![Q8M Logo](client/public/logo.svg)

**Enterprise-grade multilingual quiz and learning platform for modern web development frameworks**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/htirawi/q8m)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-green?style=for-the-badge)](https://github.com/htirawi/q8m)

</div>

## 🌟 Overview

Q8M is a comprehensive, enterprise-ready quiz and learning platform designed for developers, educators, and organizations seeking to create interactive learning experiences. Built with modern web technologies and following industry best practices, Q8M provides a scalable, multilingual solution for technical skill assessment and knowledge validation.

### Key Differentiators

- **🏗️ Enterprise Architecture**: Monorepo structure with shared types and schemas
- **🌍 Global Ready**: Full RTL support for Arabic with comprehensive i18n
- **⚡ Performance Optimized**: PWA with service workers and advanced caching
- **🔒 Security First**: OWASP compliant with comprehensive security measures
- **📱 Mobile Native**: Responsive design with mobile-first approach
- **🎯 Framework Agnostic**: Support for Angular, React, Vue, Next.js, and Redux

## 🚀 Features

### Core Learning Platform

- **Interactive Study Mode**: Structured learning with progress tracking and bookmarking
- **Adaptive Quiz System**: Dynamic question selection based on difficulty and framework
- **Multi-Difficulty Levels**: Easy, Medium, Hard progression with tiered access
- **Real-time Progress**: Live tracking with detailed analytics and performance metrics

### Technical Excellence

- **Type-Safe Development**: Full TypeScript implementation with strict mode
- **Comprehensive Testing**: Unit, integration, and E2E testing with 95%+ coverage
- **Modern Build System**: Vite-powered development with optimized production builds
- **Advanced State Management**: Pinia with reactive stores and persistence

### Enterprise Features

- **Multi-Tier Subscription**: Flexible pricing with Free, Intermediate, Advanced, and Pro tiers
- **Payment Integration**: Stripe, PayPal, and regional payment providers (APS, HyperPay)
- **Admin Dashboard**: Comprehensive analytics and user management
- **API-First Design**: RESTful APIs with OpenAPI documentation

### Developer Experience

- **Monorepo Management**: pnpm workspaces with shared dependencies
- **Hot Module Replacement**: Instant development feedback
- **ESLint + Prettier**: Automated code formatting and linting
- **Conventional Commits**: Standardized commit messages with automated changelogs

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client (SPA)  │    │   API Gateway   │    │   Database      │
│                 │    │                 │    │                 │
│  Vue 3 + TS     │◄──►│  Node.js +      │◄──►│  MongoDB +      │
│  PWA + RTL      │    │  Express        │    │  Mongoose       │
│  Tailwind CSS   │    │  Authentication │    │  Migrations     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN + Edge    │    │   Payment       │    │   Analytics     │
│                 │    │   Processing    │    │   & Monitoring  │
│  Static Assets  │    │  Stripe/PayPal  │    │  Performance    │
│  Caching        │    │  Webhooks       │    │  Error Tracking │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Monorepo Structure

```
q8m/
├── 📁 client/                 # Vue 3 frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-based modules
│   │   ├── composables/       # Vue 3 composables
│   │   ├── stores/           # Pinia state management
│   │   ├── services/         # API services and HTTP clients
│   │   ├── types/            # TypeScript type definitions
│   │   ├── config/           # Application configuration
│   │   └── assets/           # Static assets and styles
│   ├── tests/                # Test suites (unit, e2e)
│   └── public/               # Public assets and PWA manifests
│
├── 📁 server/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── models/           # MongoDB models and schemas
│   │   ├── middleware/       # Express middleware stack
│   │   ├── services/         # Business logic services
│   │   ├── migrations/       # Database migrations
│   │   └── utils/            # Server utilities and helpers
│   └── tests/                # Backend test suites
│
├── 📁 shared/                 # Shared code and types
│   ├── types/                # Shared TypeScript interfaces
│   ├── schemas/              # Validation schemas (Zod)
│   └── constants/            # Shared constants and enums
│
├── 📁 docs/                   # Comprehensive documentation
│   ├── architecture/         # System architecture docs
│   ├── deployment/           # Deployment guides
│   ├── development/          # Development setup
│   └── api/                  # API documentation
│
├── 📁 deployment/             # Infrastructure and deployment
│   ├── configs/              # Nginx, Docker configs
│   └── scripts/              # Deployment automation
│
└── 📁 tools/                  # Development tools and utilities
    └── qguard/               # Custom development tools
```

## 🛠️ Technology Stack

### Frontend Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript (Strict Mode)
- **Build Tool**: Vite (Fast HMR, optimized builds)
- **Styling**: Tailwind CSS (Utility-first, responsive)
- **State Management**: Pinia (Vue 3 store)
- **Routing**: Vue Router (SPA routing)
- **Internationalization**: Vue I18n (EN/AR with RTL)
- **Testing**: Vitest + Vue Test Utils + Testing Library
- **E2E Testing**: Playwright (Cross-browser testing)

### Backend Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js (RESTful APIs)
- **Language**: TypeScript (Full type safety)
- **Database**: MongoDB (Document store)
- **ODM**: Mongoose (Schema modeling)
- **Authentication**: JWT + HTTP-only cookies
- **Validation**: Zod (Runtime type validation)
- **Testing**: Vitest + Supertest

### DevOps & Infrastructure

- **Package Manager**: pnpm (Fast, efficient)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (Automated testing/deployment)
- **Monitoring**: Performance tracking + error monitoring
- **Security**: OWASP compliance + security headers

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0+ (LTS recommended)
- **pnpm**: 8.0+ (package manager)
- **MongoDB**: 5.0+ (database)
- **Git**: 2.30+ (version control)

### Installation

```bash
# Clone the repository
git clone https://github.com/htirawi/q8m.git
cd q8m

# Install dependencies (monorepo)
pnpm install

# Set up environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env

# Configure your environment variables
# - MongoDB connection string
# - JWT secrets
# - Payment provider keys
# - Analytics keys

# Run database migrations
pnpm migrate

# Start development servers
pnpm dev
```

### Development Commands

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:client       # Client only (Vue 3 + Vite)
pnpm dev:server       # Server only (Node.js + Express)

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests (Vitest)
pnpm test:e2e         # E2E tests (Playwright)
pnpm test:coverage    # Coverage reports

# Code Quality
pnpm lint             # ESLint + Prettier
pnpm typecheck        # TypeScript compilation
pnpm build            # Production builds

# Database
pnpm migrate          # Run database migrations
pnpm seed             # Seed development data
```

## 📊 Performance & Quality

### Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: Optimized with code splitting and tree shaking
- **Load Time**: < 2s initial load, < 100ms navigation
- **PWA Score**: 100% (Service Worker, Offline Support)

### Code Quality

- **TypeScript**: 100% strict mode coverage
- **Test Coverage**: 95%+ (Unit + Integration + E2E)
- **ESLint**: Zero warnings, strict rules
- **Security**: OWASP Top 10 compliance

## 🌐 Internationalization

Q8M provides comprehensive internationalization support:

- **Languages**: English (EN) and Arabic (AR)
- **RTL Support**: Full right-to-left layout for Arabic
- **Cultural Adaptation**: Date formats, number formats, currency
- **Accessibility**: Screen reader support, keyboard navigation
- **SEO**: Multi-language meta tags and structured data

## 💳 Payment Integration

### Supported Providers

- **Stripe**: Global payment processing
- **PayPal**: International payment gateway
- **APS (Arab Payment Solutions)**: MENA region
- **HyperPay**: Regional payment provider

### Features

- **Secure Processing**: PCI DSS compliant
- **Webhook Handling**: Real-time payment updates
- **Subscription Management**: Automated billing cycles
- **Multi-Currency**: Support for multiple currencies
- **Fraud Prevention**: Advanced risk assessment

## 🔒 Security

### Security Measures

- **Authentication**: JWT with HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API protection against abuse
- **CORS**: Configured cross-origin resource sharing
- **Security Headers**: CSP, HSTS, X-Frame-Options

### Compliance

- **OWASP Top 10**: Full compliance checklist
- **GDPR**: Data protection and privacy
- **PCI DSS**: Payment card industry standards
- **SOC 2**: Security and availability controls

## 🚀 Deployment

### Production Deployment

```bash
# Build for production
pnpm build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platforms
# - Vercel (Frontend)
# - Railway (Backend)
# - MongoDB Atlas (Database)
```

### Environment Configuration

```bash
# Production Environment Variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=your-paypal-client-id
```

## 📚 Documentation

- **[Architecture Guide](./docs/architecture/ARCHITECTURE.md)** - System design and patterns
- **[API Documentation](./docs/server/)** - REST API reference
- **[Development Guide](./docs/development/)** - Setup and contribution
- **[Deployment Guide](./docs/deployment/)** - Production deployment
- **[Security Guide](./docs/audit/SECURITY_AUDIT.md)** - Security best practices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Zero warnings policy
- **Testing**: Required for new features
- **Documentation**: Update docs for API changes
- **Commits**: Conventional commit format

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/htirawi/q8m/issues)
- **Discussions**: [GitHub Discussions](https://github.com/htirawi/q8m/discussions)
- **Documentation**: [Wiki](https://github.com/htirawi/q8m/wiki)

### Professional Support

For enterprise support, custom development, or consulting services, please contact us at [support@q8m.dev](mailto:support@q8m.dev).

---

<div align="center">

**Built with ❤️ by the Q8M Team**

_Empowering developers worldwide with interactive learning experiences_

[![GitHub stars](https://img.shields.io/github/stars/htirawi/q8m?style=social)](https://github.com/htirawi/q8m/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/htirawi/q8m?style=social)](https://github.com/htirawi/q8m/network)
[![GitHub issues](https://img.shields.io/github/issues/htirawi/q8m)](https://github.com/htirawi/q8m/issues)

</div>
