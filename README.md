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
[![Test Coverage](https://img.shields.io/badge/tests-561%20passing-green?style=for-the-badge)](https://github.com/htirawi/q8m)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict%20mode-blue?style=for-the-badge)](https://www.typescriptlang.org/)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Why Q8M?](#-why-q8m)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Testing](#-testing)
- [Code Quality](#-code-quality)
- [Project Structure](#-project-structure)
- [Key Features & Modules](#-key-features--modules)
- [API Integration](#-api-integration)
- [State Management](#-state-management)
- [Internationalization](#-internationalization)
- [Payment Integration](#-payment-integration)
- [Security](#-security)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

Q8M (Quiz 8 Mastery) is a comprehensive, enterprise-ready quiz and learning platform designed for developers, educators, and organizations seeking to create interactive learning experiences. Built with modern web technologies and following industry best practices, Q8M provides a scalable, multilingual solution for technical skill assessment and knowledge validation.

### Key Highlights

- 🏗️ **Enterprise Architecture** - Monorepo structure with shared types and robust type safety
- 🌍 **Global Ready** - Full RTL support for Arabic with comprehensive i18n
- ⚡ **Performance Optimized** - PWA with service workers, code splitting, and advanced caching
- 🔒 **Security First** - OWASP compliant with comprehensive security measures and secret scanning
- 📱 **Mobile Native** - Responsive design with mobile-first approach
- 🎯 **Framework Agnostic** - Support for Angular, React, Vue, Next.js, and Redux
- 🧪 **Type-Safe & Tested** - 100% TypeScript strict mode with 561+ passing tests
- 🤝 **Social Learning** - Friend system, challenges, discussions, and leaderboards

---

## 💡 Why Q8M?

### The Problem

Developers preparing for frontend framework interviews face several challenges:

- Scattered resources across multiple platforms
- Inconsistent question quality and difficulty
- Lack of structured learning paths
- No progress tracking or performance analytics
- Limited hands-on practice opportunities

### The Solution

Q8M provides a comprehensive, all-in-one platform that:

- ✅ Curates **500+ high-quality interview questions** across multiple frameworks
- ✅ Offers **structured learning paths** from beginner to expert
- ✅ Tracks **detailed performance metrics** and progress analytics
- ✅ Enables **social learning** through friend challenges and discussions
- ✅ Provides **gamification** with XP, badges, streaks, and leaderboards
- ✅ Supports **multiple study modes** (quiz, study, practice, timed)
- ✅ Offers **multi-tier access** with flexible subscription plans

---

## 🚀 Features

### 🎓 Core Learning Platform

- **Interactive Study Mode** - Structured learning with progress tracking, bookmarking, and note-taking
- **Adaptive Quiz System** - Dynamic question selection based on difficulty and framework
- **Multi-Difficulty Levels** - Easy, Medium, Hard, Expert progression with tiered access
- **Real-time Progress** - Live tracking with detailed analytics and performance metrics
- **Learning Paths** - Curated certification-style learning paths (e.g., Vue.js Foundations, React Advanced)
- **Smart Recommendations** - AI-powered question suggestions based on performance

### 🎮 Gamification & Social

- **XP & Leveling System** - Earn experience points and level up through learning
- **Badge System** - Unlock achievements for milestones and accomplishments
- **Streak Tracking** - Daily study streaks with visual indicators and rewards
- **Leaderboards** - Global and friend-based rankings
- **Friend System** - Connect with peers, send challenges, track progress together
- **Challenges** - Create and participate in timed quiz challenges with friends
- **Discussions** - Community-driven Q&A and knowledge sharing
- **Confetti Celebrations** - Visual feedback for achievements and milestones

### 💼 Enterprise Features

- **Multi-Tier Subscriptions** - Free, Junior, Intermediate, Senior, and Bundle plans
- **Payment Integration** - Stripe, PayPal, APS (Arab Payment Solutions), HyperPay
- **Admin Dashboard** - Comprehensive analytics, user management, content moderation
- **API-First Design** - RESTful APIs with Swagger/OpenAPI documentation
- **Subscription Management** - Self-service upgrades, downgrades, cancellations
- **Billing History** - Invoice generation and payment history
- **Multi-Currency Support** - USD, EUR, AED with automatic currency conversion

### 🛠️ Technical Excellence

- **Type-Safe Development** - 100% TypeScript strict mode with zero `any` types
- **Comprehensive Testing** - 561+ unit, integration, and E2E tests
- **Modern Build System** - Vite-powered development with optimized production builds
- **Advanced State Management** - Pinia with reactive stores, persistence, and devtools
- **Code Quality Gates** - Pre-commit hooks, CI/CD validation, automated formatting
- **Performance Monitoring** - Lighthouse scores, bundle size tracking, runtime metrics
- **Error Tracking** - Comprehensive error boundaries and monitoring

### 👨‍💻 Developer Experience

- **Monorepo Management** - pnpm workspaces with shared dependencies and types
- **Hot Module Replacement** - Instant development feedback with Vite HMR
- **ESLint + Prettier** - Automated code formatting and linting with strict rules
- **Conventional Commits** - Standardized commit messages with automated validation
- **Type Error Prevention** - 4-layer defense system (IDE → pre-commit → pre-push → CI)
- **Documentation** - Comprehensive API docs, architecture guides, and developer docs

---

## 🏗️ Tech Stack

### Frontend Stack

| Category                 | Technology                       | Purpose                              |
| ------------------------ | -------------------------------- | ------------------------------------ |
| **Framework**            | Vue 3 (Composition API)          | Modern reactive UI framework         |
| **Language**             | TypeScript 5.6+ (Strict Mode)    | Type safety and developer experience |
| **Build Tool**           | Vite 5.4+                        | Fast HMR, optimized builds           |
| **Styling**              | Tailwind CSS 3.4+                | Utility-first responsive design      |
| **State Management**     | Pinia 2.1+                       | Vue 3 native store with persistence  |
| **Routing**              | Vue Router 4.2+                  | SPA routing with guards              |
| **Internationalization** | Vue I18n 9.8+                    | EN/AR with RTL support               |
| **Form Validation**      | Vee-Validate + Zod               | Type-safe form handling              |
| **UI Components**        | Headless UI + Heroicons          | Accessible component library         |
| **Utilities**            | VueUse 13.9+                     | Composition API utilities            |
| **PWA**                  | Vite PWA Plugin                  | Service workers, offline support     |
| **Unit Testing**         | Vitest 2.1+                      | Fast unit test runner                |
| **Component Testing**    | Vue Test Utils + Testing Library | Component testing utilities          |
| **E2E Testing**          | Playwright 1.40+                 | Cross-browser E2E testing            |

### Backend Stack

| Category           | Technology                 | Purpose                         |
| ------------------ | -------------------------- | ------------------------------- |
| **Runtime**        | Node.js 18+ (LTS)          | JavaScript server runtime       |
| **Framework**      | Fastify 4.24+              | High-performance REST API       |
| **Language**       | TypeScript 5.6+ (Strict)   | Full type safety on backend     |
| **Database**       | MongoDB 5.0+               | Document store                  |
| **ODM**            | Mongoose 8.0+              | Schema modeling and validation  |
| **Authentication** | JWT + HTTP-only cookies    | Secure auth with refresh tokens |
| **Validation**     | Zod 3.22+                  | Runtime type validation         |
| **Email**          | Nodemailer 6.9+            | Transactional emails            |
| **OAuth**          | Firebase Admin             | Google/Apple authentication     |
| **Payments**       | Stripe, PayPal SDKs        | Payment processing              |
| **Caching**        | Redis (via Fastify plugin) | Session and data caching        |
| **Scheduling**     | node-cron 4.2+             | Scheduled tasks                 |
| **Testing**        | Vitest 2.1+                | Backend unit testing            |

### DevOps & Infrastructure

| Category              | Technology              | Purpose                          |
| --------------------- | ----------------------- | -------------------------------- |
| **Package Manager**   | pnpm 9.12+              | Fast, efficient monorepo manager |
| **Containerization**  | Docker + Docker Compose | Consistent dev/prod environments |
| **CI/CD**             | GitHub Actions          | Automated testing and deployment |
| **Code Quality**      | ESLint + Prettier       | Linting and formatting           |
| **Git Hooks**         | Husky 8.0+              | Pre-commit validation            |
| **Commit Linting**    | Commitlint              | Conventional commit enforcement  |
| **Secret Scanning**   | TruffleHog              | Security secret detection        |
| **API Documentation** | Swagger/OpenAPI         | Auto-generated API docs          |
| **Performance**       | Lighthouse CI           | Performance monitoring           |

---

## 🏛️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client (SPA)  │    │   API Server    │    │   Database      │
│                 │    │                 │    │                 │
│  Vue 3 + TS     │◄──►│  Fastify +      │◄──►│  MongoDB +      │
│  PWA + RTL      │    │  TypeScript     │    │  Mongoose       │
│  Tailwind CSS   │    │  JWT Auth       │    │  Migrations     │
│  Pinia Store    │    │  Rate Limiting  │    │  Indexes        │
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
├── 📁 client/                    # Vue 3 frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components (50+)
│   │   │   ├── layout/          # Layout components (AppLayout, UserMenu)
│   │   │   ├── ui/              # Base UI (Button, Card, Input, Toast)
│   │   │   ├── ai/              # AI features (Chatbot, Explanations)
│   │   │   ├── analytics/       # Analytics components
│   │   │   ├── auth/            # Auth components
│   │   │   ├── common/          # Shared components (MarkdownRenderer)
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   ├── gamification/    # Gamification UI
│   │   │   ├── marketing/       # Marketing components
│   │   │   ├── notifications/   # Notification system
│   │   │   ├── payment/         # Payment forms
│   │   │   ├── pricing/         # Pricing tables
│   │   │   ├── quiz/            # Quiz UI components
│   │   │   ├── select/          # Selection components
│   │   │   ├── skeletons/       # Loading skeletons
│   │   │   └── study/           # Study mode components
│   │   ├── features/            # Feature-based modules (20+ features)
│   │   │   ├── account/         # Account management
│   │   │   ├── auth/            # Authentication (login, register, OAuth)
│   │   │   ├── challenges/      # Friend challenges
│   │   │   ├── checkout/        # Payment checkout
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── discussions/     # Community discussions
│   │   │   ├── friends/         # Social features
│   │   │   ├── gamification/    # XP, badges, streaks
│   │   │   ├── home/            # Landing pages
│   │   │   ├── onboarding/      # User onboarding
│   │   │   ├── paths/           # Learning paths
│   │   │   ├── payment/         # Payment processing
│   │   │   ├── pricing/         # Pricing pages
│   │   │   ├── quiz/            # Quiz system
│   │   │   ├── shares/          # Social sharing
│   │   │   ├── study/           # Study mode
│   │   │   └── test/            # API testing pages
│   │   ├── composables/         # Vue 3 composables (30+)
│   │   │   ├── useAuth.ts       # Authentication logic
│   │   │   ├── useAnalytics.ts  # Analytics tracking
│   │   │   ├── useFriends.ts    # Friend management
│   │   │   ├── useNotifications.ts  # Notification handling
│   │   │   ├── usePayment.ts    # Payment processing
│   │   │   ├── usePlans.ts      # Subscription plans
│   │   │   └── ...              # And more
│   │   ├── stores/              # Pinia state management (15+ stores)
│   │   │   ├── auth.store.ts    # User authentication
│   │   │   ├── quiz.store.ts    # Quiz state
│   │   │   ├── study.store.ts   # Study mode state
│   │   │   ├── gamification.store.ts  # XP, badges
│   │   │   ├── friends.store.ts # Social features
│   │   │   └── ...              # And more
│   │   ├── services/            # API services and HTTP clients
│   │   │   ├── api.service.ts   # Base API client
│   │   │   ├── auth.service.ts  # Auth API
│   │   │   ├── payment.service.ts  # Payment API
│   │   │   └── ai/              # AI services
│   │   ├── types/               # TypeScript type definitions
│   │   │   ├── components/      # Component prop types
│   │   │   ├── domain/          # Domain models
│   │   │   └── ...              # Organized type definitions
│   │   ├── config/              # Application configuration
│   │   │   ├── features.ts      # Feature flags
│   │   │   ├── plans.ts         # Subscription plans
│   │   │   └── routes.ts        # Route definitions
│   │   ├── router/              # Vue Router configuration
│   │   ├── locales/             # i18n translations (EN/AR)
│   │   ├── styles/              # Global styles and Tailwind
│   │   ├── utils/               # Utility functions
│   │   └── assets/              # Static assets and images
│   ├── tests/                   # Test suites
│   │   ├── unit/                # Unit tests (Vitest)
│   │   └── e2e/                 # E2E tests (Playwright)
│   ├── public/                  # Public assets
│   ├── vite.config.ts           # Vite configuration
│   ├── vitest.config.ts         # Vitest configuration
│   ├── playwright.config.ts     # Playwright configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   └── tsconfig.json            # TypeScript configuration
│
├── 📁 server/                    # Node.js backend API
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.routes.ts   # Authentication endpoints
│   │   │   ├── quiz.routes.ts   # Quiz endpoints
│   │   │   ├── payment.routes.ts  # Payment endpoints
│   │   │   └── ...              # And more
│   │   ├── models/              # MongoDB models and schemas
│   │   │   ├── User.model.ts    # User model
│   │   │   ├── Question.model.ts  # Question model
│   │   │   ├── Progress.model.ts  # Progress tracking
│   │   │   └── ...              # And more
│   │   ├── middleware/          # Express middleware stack
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   │   ├── planGuard.middleware.ts  # Subscription checks
│   │   │   └── ...              # And more
│   │   ├── services/            # Business logic services
│   │   │   ├── auth.service.ts  # Authentication logic
│   │   │   ├── payment.service.ts  # Payment processing
│   │   │   ├── email.service.ts  # Email sending
│   │   │   └── ...              # And more
│   │   ├── migrations/          # Database migrations
│   │   ├── scripts/             # Utility scripts (seeding, etc.)
│   │   └── utils/               # Server utilities and helpers
│   ├── tests/                   # Backend test suites
│   └── tsconfig.json            # TypeScript configuration
│
├── 📁 shared/                    # Shared code and types
│   ├── types/                   # Shared TypeScript interfaces
│   │   ├── api.types.ts         # API request/response types
│   │   ├── models.types.ts      # Database model types
│   │   └── composables.ts       # Composable types
│   ├── schemas/                 # Validation schemas (Zod)
│   └── constants/               # Shared constants and enums
│
├── 📁 docs/                      # Comprehensive documentation
│   ├── architecture/            # System architecture docs
│   ├── audit/                   # Security and quality audits
│   ├── changelog/               # Version changelogs
│   ├── deployment/              # Deployment guides
│   ├── development/             # Development setup
│   ├── getting-started/         # Getting started guides
│   ├── guides/                  # Feature guides
│   ├── project-management/      # Project management docs
│   ├── scripts/                 # Script documentation
│   └── server/                  # Backend API docs
│
├── 📁 deployment/                # Infrastructure and deployment
│   ├── configs/                 # Nginx, Docker configs
│   └── scripts/                 # Deployment automation
│
├── 📁 tools/                     # Development tools and utilities
│   └── qguard/                  # Custom development guard tools
│
├── 📁 scripts/                   # Monorepo scripts
│   ├── quick-typecheck.sh       # Fast type checking
│   ├── pre-commit-typecheck.sh  # Pre-commit validation
│   ├── validate-before-push.sh  # Pre-push checks
│   └── ...                      # And more
│
├── 📁 .github/                   # GitHub configuration
│   └── workflows/               # GitHub Actions CI/CD
│       └── ci.yml               # Main CI/CD pipeline
│
├── 📁 .husky/                    # Git hooks
│   ├── pre-commit               # Pre-commit validation
│   ├── pre-push                 # Pre-push validation
│   └── commit-msg               # Commit message linting
│
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── tsconfig.json                # Root TypeScript configuration
└── README.md                    # This file
```

### Type Error Prevention Architecture

Q8M implements a comprehensive 4-layer type error prevention system:

1. **IDE Layer** - Real-time feedback in development
   - VSCode TypeScript server with strict mode
   - Immediate error highlighting
   - Auto-save and format on save

2. **Pre-Commit Layer** - Fast validation before commits
   - Husky git hooks
   - Quick type check on staged files only
   - ESLint + Prettier validation
   - Fails fast if type errors detected

3. **Pre-Push Layer** - Comprehensive validation before push
   - Full project type check
   - All unit tests must pass (561+ tests)
   - Build verification
   - Coverage validation

4. **CI/CD Layer** - Final validation in GitHub Actions
   - Automated type checking
   - Full test suite execution
   - Build verification
   - Security scanning (TruffleHog)
   - Dependency auditing

**Result**: Zero type errors reach production, maintaining code quality and developer productivity.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 18.0+ (LTS recommended)
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```
- **pnpm**: 9.0+ (package manager)
  ```bash
  npm install -g pnpm
  pnpm --version  # Should be 9.0.0 or higher
  ```
- **MongoDB**: 5.0+ (database)
  - [Download MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud-hosted)
- **Git**: 2.30+ (version control)
  ```bash
  git --version  # Should be 2.30.0 or higher
  ```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/htirawi/q8m.git
   cd q8m
   ```

2. **Install dependencies** (monorepo installation)

   ```bash
   pnpm install
   ```

   This will install dependencies for all workspaces (client, server, shared).

3. **Set up environment variables**

   **Client environment** (`client/.env`):

   ```bash
   cp client/.env.example client/.env
   ```

   Edit `client/.env`:

   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=Q8M
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

   **Server environment** (`server/.env`):

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env`:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/q8m

   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

   # Payment Providers
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret

   # OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password

   # App
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**

   ```bash
   # macOS (if installed via Homebrew)
   brew services start mongodb-community

   # Or start manually
   mongod --config /usr/local/etc/mongod.conf

   # Verify MongoDB is running
   mongosh  # Should connect successfully
   ```

5. **Run database migrations**

   ```bash
   pnpm migrate
   ```

   This will:
   - Create necessary collections
   - Set up indexes for performance
   - Seed initial data (frameworks, question templates, etc.)

6. **Start development servers**

   ```bash
   # Start both client and server concurrently
   pnpm dev:all

   # Or start them separately in different terminals:
   # Terminal 1 - Server (runs on http://localhost:3000)
   pnpm dev:server

   # Terminal 2 - Client (runs on http://localhost:5173)
   pnpm dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api
   - API Docs (Swagger): http://localhost:3000/documentation

### Quick Start with Docker (Alternative)

If you prefer using Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 💻 Development

### Available Scripts

#### Root-level scripts (run from project root):

```bash
# Development
pnpm dev              # Start client dev server only
pnpm dev:server       # Start server dev server only
pnpm dev:all          # Start both client and server concurrently

# Build
pnpm build            # Build both client and server for production

# Testing
pnpm test             # Run all tests (client + server)
pnpm test:unit        # Run unit tests only
pnpm test:coverage    # Run tests with coverage reports

# Code Quality
pnpm lint             # Lint all code (client + server)
pnpm lint:fix         # Lint and auto-fix issues
pnpm format           # Format all code with Prettier
pnpm format:check     # Check if code is formatted correctly

# Type Checking
pnpm typecheck        # Type check all packages
pnpm typecheck:quick  # Quick type check (faster)
pnpm typecheck:watch  # Type check in watch mode
pnpm typecheck:client # Client type check only
pnpm typecheck:server # Server type check only

# Validation
pnpm validate         # Run format check, typecheck, lint, and tests
pnpm validate:full    # Full validation including build
pnpm pre-push         # Pre-push validation (same as validate:full)

# Database
pnpm migrate          # Run database migrations
```

#### Client-specific scripts (run from `client/` directory):

```bash
cd client

# Development
pnpm dev              # Start Vite dev server on port 5173

# Build
pnpm build            # Build for production (with type checking)
pnpm build:skip-check # Build without type checking (faster)
pnpm preview          # Preview production build locally

# Testing
pnpm test:unit        # Run unit tests (Vitest)
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Open Vitest UI
pnpm test:coverage    # Generate coverage reports
pnpm test:e2e         # Run E2E tests (Playwright)

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm lint:css         # Lint CSS/Vue styles with Stylelint
pnpm lint:strict      # Strict linting (zero warnings)
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript type checking
```

#### Server-specific scripts (run from `server/` directory):

```bash
cd server

# Development
pnpm dev              # Start server with auto-reload (tsx watch)

# Build & Start
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Open Vitest UI
pnpm test:coverage    # Generate coverage reports
pnpm test:integration # Run integration tests only

# Database
pnpm migrate          # Run all migrations
pnpm migrate:001      # Run specific migration
pnpm db:seed          # Seed database with sample data
pnpm db:seed:framework-access  # Seed framework access data
pnpm db:seed:rich-questions    # Seed rich question data
pnpm db:seed:learning-paths    # Seed learning paths
pnpm db:reset         # Reset database (CAUTION: deletes all data)

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm typecheck        # TypeScript type checking
```

### Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code with TypeScript strict mode
   - Add unit tests for new functionality
   - Update types as needed

3. **Validate your changes**

   ```bash
   # Quick validation (runs automatically on commit)
   pnpm typecheck:quick
   pnpm lint
   pnpm test:unit

   # Full validation (runs automatically on push)
   pnpm pre-push
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Build process or auxiliary tool changes

5. **Push to your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

   Pre-push hooks will automatically run full validation.

6. **Create a Pull Request**
   - Open PR on GitHub
   - CI/CD pipeline will run automatically
   - Wait for review and approval

---

## 🧪 Testing

### Testing Strategy

Q8M implements a comprehensive testing strategy:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test interactions between modules
3. **E2E Tests** - Test complete user flows in a real browser
4. **Visual Regression Tests** - Catch unintended UI changes

### Test Statistics

- **Total Tests**: 561+ passing tests
- **Coverage**: Comprehensive coverage across critical paths
- **Frameworks**: Vitest (unit), Playwright (E2E)

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run tests in watch mode (great for TDD)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Open Vitest UI for interactive testing
pnpm test:ui

# Run E2E tests (Playwright)
cd client
pnpm test:e2e

# Run E2E tests in UI mode
cd client
pnpm test:e2e --ui
```

### Test File Structure

```
client/src/
├── tests/
│   ├── unit/
│   │   ├── components/          # Component tests
│   │   ├── composables/         # Composable tests
│   │   ├── stores/              # Store tests
│   │   └── utils/               # Utility function tests
│   └── e2e/
│       ├── auth.spec.ts         # Authentication flow
│       ├── quiz.spec.ts         # Quiz functionality
│       └── payment.spec.ts      # Payment flow

server/src/
└── tests/
    ├── unit/
    │   ├── services/            # Service tests
    │   ├── models/              # Model tests
    │   └── utils/               # Utility tests
    └── integration/
        └── api/                 # API endpoint tests
```

### Writing Tests

**Component Test Example (Vitest + Vue Test Utils)**:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "@/components/ui/Button.vue";

describe("Button.vue", () => {
  it("renders button text correctly", () => {
    const wrapper = mount(Button, {
      props: { label: "Click Me" },
    });
    expect(wrapper.text()).toBe("Click Me");
  });

  it("emits click event when clicked", async () => {
    const wrapper = mount(Button);
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });
});
```

**E2E Test Example (Playwright)**:

```typescript
import { test, expect } from "@playwright/test";

test("user can complete quiz", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.click("text=Start Quiz");

  // Answer questions
  await page.click('[data-testid="answer-0"]');
  await page.click("text=Next");

  // Check results
  await expect(page.locator("text=Quiz Complete")).toBeVisible();
});
```

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Critical paths (auth, payments, quiz logic) aim for 90%+ coverage.

---

## 🔍 Code Quality

### Quality Standards

Q8M maintains high code quality through:

1. **TypeScript Strict Mode** - 100% type coverage, zero `any` types
2. **ESLint** - Enforces consistent code style and catches bugs
3. **Prettier** - Automated code formatting
4. **Husky** - Git hooks for pre-commit/pre-push validation
5. **Commitlint** - Conventional commit message enforcement

### Linting

```bash
# Lint all code
pnpm lint

# Lint and auto-fix issues
pnpm lint:fix

# Lint CSS/styles
cd client
pnpm lint:css

# Strict linting (zero warnings)
cd client
pnpm lint:strict
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck

# Quick type check (faster, staged files only)
pnpm typecheck:quick

# Watch mode (continuous type checking)
pnpm typecheck:watch

# Type check specific package
pnpm typecheck:client
pnpm typecheck:server
```

### Code Formatting

```bash
# Format all code
pnpm format

# Check if code is formatted
pnpm format:check
```

### Pre-Commit Hooks

Automatically runs on `git commit`:

- Lints staged files
- Type checks staged TypeScript/Vue files
- Formats code with Prettier
- Validates commit message format

### Pre-Push Hooks

Automatically runs on `git push`:

- Full TypeScript type checking
- All unit tests must pass
- Build verification
- Coverage validation

### Manual Quality Check

```bash
# Run all quality checks manually
pnpm validate

# Full validation including build
pnpm validate:full
```

---

## 📂 Project Structure

### Feature-Based Architecture

Q8M uses a feature-based architecture where each major feature is self-contained:

```
client/src/features/
├── auth/               # Authentication feature
│   ├── components/     # Auth-specific components
│   ├── pages/          # Auth pages (Login, Register, etc.)
│   └── composables/    # Auth-specific composables
├── quiz/               # Quiz feature
│   ├── components/     # Quiz components
│   ├── pages/          # Quiz pages
│   └── store/          # Quiz state (if needed)
└── ...                 # Other features
```

### Key Directories Explained

- **`/components`** - Reusable UI components shared across features
- **`/features`** - Feature modules with pages, components, and logic
- **`/composables`** - Vue 3 composition functions for reusable logic
- **`/stores`** - Pinia stores for state management
- **`/services`** - API services and HTTP clients
- **`/types`** - TypeScript type definitions
- **`/utils`** - Utility functions and helpers
- **`/config`** - Application configuration files
- **`/router`** - Vue Router configuration
- **`/locales`** - i18n translation files
- **`/styles`** - Global styles and Tailwind config

---

## 🎯 Key Features & Modules

### 🔐 Authentication Module

**Location**: `client/src/features/auth`

**Features**:

- Email/password authentication with JWT tokens
- OAuth (Google, Apple) via Firebase
- Email verification flow
- Password reset with secure tokens
- Multi-step registration (email → password → profile)
- HTTP-only refresh token rotation
- Secure session management

**Key Components**:

- `LoginPage.vue` - Login interface
- `RegisterPage.vue` - Multi-step registration
- `OAuthCallbackPage.vue` - OAuth redirect handling
- `EmailStep.vue`, `ProfileStep.vue` - Registration steps

**API Endpoints**:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request

### 📝 Quiz Module

**Location**: `client/src/features/quiz`

**Features**:

- Multiple quiz modes (practice, timed, challenge)
- Dynamic question selection by difficulty and framework
- Real-time answer feedback
- Progress tracking and analytics
- Detailed result screens with explanations
- Bookmark questions for later review
- Report incorrect questions

**Key Components**:

- `QuizPage.vue` - Main quiz interface
- `QuizQuestion.vue` - Question display and interaction
- `QuizResults.vue` - Results screen with analytics
- `QuizHeader.vue` - Timer, progress, and controls

**State Management**:

- `quiz.store.ts` - Quiz state (current question, answers, timer)

### 📚 Study Module

**Location**: `client/src/features/study`

**Features**:

- Structured study sessions with curated questions
- Framework-specific study paths
- Difficulty-based progression
- Smart bookmarking and note-taking
- Progress persistence
- Resume interrupted sessions

**Key Components**:

- `StudyModePage.vue` - Main study interface
- `StudyQuestion.vue` - Question display with explanations
- `StudyNavigation.vue` - Navigate between questions
- `StudyFilters.vue` - Filter by framework, difficulty

**State Management**:

- `study.store.ts` - Study session state

### 🏆 Gamification Module

**Location**: `client/src/features/gamification`

**Features**:

- XP system with level progression
- 50+ unlockable badges
- Daily study streaks with rewards
- Leaderboards (global and friends)
- Achievement milestones
- Confetti celebrations for achievements

**Key Components**:

- `GamificationDashboard.vue` - Overview dashboard
- `XPDisplay.vue` - XP bar with level
- `BadgesGrid.vue` - Badge collection
- `StreakDisplay.vue` - Streak counter
- `Leaderboard.vue` - Rankings
- `LevelUpCelebration.vue` - Level-up animation

**State Management**:

- `gamification.store.ts` - XP, badges, streaks

### 👥 Friends Module

**Location**: `client/src/features/friends`

**Features**:

- Send/accept friend requests
- Friend suggestions based on activity
- View friends' progress and achievements
- Friend-based leaderboards
- Create and join challenges

**Key Components**:

- `FriendsPage.vue` - Friends management
- `FriendList.vue` - Display friends
- `FriendRequests.vue` - Pending requests
- `FriendSuggestions.vue` - Suggested friends
- `UserSearch.vue` - Search users

**State Management**:

- `friends.store.ts` - Friend list and requests

### 🎯 Challenges Module

**Location**: `client/src/features/challenges`

**Features**:

- Create custom challenges (timed quizzes)
- Challenge friends to compete
- Track challenge results
- Leaderboards for each challenge
- Rematch functionality

**Key Components**:

- `ChallengePage.vue` - Challenge interface
- `ChallengeList.vue` - Active challenges
- `CreateChallengeModal.vue` - Challenge creation
- `ChallengeCard.vue` - Challenge display

### 💬 Discussions Module

**Location**: `client/src/features/discussions`

**Features**:

- Question-based discussions
- Upvote/downvote answers
- Nested replies
- Mark as solution
- Community moderation

**Key Components**:

- `DiscussionsPage.vue` - Main discussions view
- `DiscussionList.vue` - Discussion threads
- `DiscussionItem.vue` - Single discussion
- `ReplyForm.vue` - Reply interface

### 🛤️ Learning Paths Module

**Location**: `client/src/features/paths`

**Features**:

- Curated learning paths (e.g., "Vue.js Foundations")
- Structured progression through topics
- Certificate generation on completion
- Track path progress
- Unlock advanced paths

**Key Components**:

- `PathsBrowsePage.vue` - Browse available paths
- `PathDetailsPage.vue` - Path information
- `PathLearningPage.vue` - Path content
- `CertificatePage.vue` - Certificate display

### 💳 Payment & Subscription Module

**Location**: `client/src/features/payment`, `client/src/features/checkout`

**Features**:

- Multi-tier subscription plans
- Stripe and PayPal integration
- Subscription management (upgrade, downgrade, cancel)
- Billing history
- Invoice generation
- Promo codes and discounts

**Key Components**:

- `CheckoutPage.vue` - Payment checkout
- `CheckoutForm.vue` - Payment form
- `OrderSummary.vue` - Order details
- `SubscriptionPage.vue` - Manage subscription

**State Management**:

- `subscription.store.ts` - Subscription state

### 📊 Dashboard Module

**Location**: `client/src/features/dashboard`

**Features**:

- Overview of progress and achievements
- Recent activity feed
- Performance analytics
- Personalized recommendations
- Quick actions

**Key Components**:

- `DashboardPage.vue` - Main dashboard
- `ProgressDashboard.vue` - Progress widgets
- `RecentActivity.vue` - Activity feed
- `Recommendations.vue` - Smart suggestions

---

## 🔌 API Integration

### API Service Architecture

Q8M uses a centralized API service with type-safe request/response handling:

```typescript
// client/src/services/api.service.ts
import axios, { AxiosInstance } from "axios";
import type { ApiResponse } from "@shared/types/api.types";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true, // Send HTTP-only cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor (handle errors, refresh tokens)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle 401 (unauthorized) with token refresh
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.client(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  // ... put, delete, etc.
}

export const apiService = new ApiService();
```

### Error Handling

All API errors are handled consistently:

```typescript
try {
  const response = await apiService.post("/api/quiz/submit", quizData);
  return response.data;
} catch (error) {
  if (error.response?.status === 403) {
    // Handle permission errors (e.g., plan upgrade required)
    showUpgradeModal();
  } else if (error.response?.status === 429) {
    // Handle rate limiting
    showToast("Too many requests. Please try again later.");
  } else {
    // Handle general errors
    showToast("An error occurred. Please try again.");
  }
  throw error;
}
```

### API Endpoints

**Authentication**:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

**Quiz**:

- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/:id` - Get quiz results
- `GET /api/quiz/history` - Get quiz history

**Study**:

- `GET /api/study/questions` - Get study questions
- `POST /api/study/progress` - Update study progress
- `POST /api/study/bookmark` - Bookmark question

**Gamification**:

- `GET /api/gamification/profile` - Get user XP, level, badges
- `GET /api/gamification/leaderboard` - Get leaderboard
- `POST /api/gamification/claim-reward` - Claim daily reward

**Friends**:

- `GET /api/friends` - Get friend list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept friend request
- `DELETE /api/friends/:id` - Remove friend

**Challenges**:

- `GET /api/challenges` - Get challenges
- `POST /api/challenges` - Create challenge
- `POST /api/challenges/:id/join` - Join challenge
- `GET /api/challenges/:id/results` - Get challenge results

**Payments**:

- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook
- `POST /api/subscriptions/upgrade` - Upgrade subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

**Learning Paths**:

- `GET /api/paths` - Get all learning paths
- `GET /api/paths/:id` - Get specific path
- `POST /api/paths/:id/enroll` - Enroll in path
- `POST /api/paths/:id/progress` - Update path progress

---

## 🗄️ State Management

### Pinia Stores

Q8M uses Pinia for state management with the following stores:

#### Authentication Store

**File**: `client/src/stores/auth.store.ts`

```typescript
export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials);
    user.value = response.user;
    accessToken.value = response.accessToken;
  }

  async function logout() {
    await authService.logout();
    user.value = null;
    accessToken.value = null;
  }

  return { user, isAuthenticated, login, logout };
});
```

**State**:

- `user` - Current user object
- `accessToken` - JWT access token
- `isAuthenticated` - Computed authentication status

**Actions**:

- `login()` - Authenticate user
- `logout()` - Clear user session
- `register()` - Register new user
- `refreshToken()` - Refresh access token

#### Quiz Store

**File**: `client/src/stores/quiz.store.ts`

**State**:

- `currentQuestion` - Active question
- `answers` - User answers
- `timeRemaining` - Timer countdown
- `quizResults` - Quiz results

**Actions**:

- `startQuiz()` - Initialize quiz session
- `submitAnswer()` - Submit answer
- `nextQuestion()` - Navigate to next question
- `finishQuiz()` - Complete quiz and get results

#### Study Store

**File**: `client/src/stores/study.store.ts`

**State**:

- `questions` - Study questions
- `currentIndex` - Current question index
- `bookmarks` - Bookmarked questions
- `progress` - Study progress

**Actions**:

- `loadQuestions()` - Load study questions
- `bookmarkQuestion()` - Bookmark for later
- `updateProgress()` - Save progress

#### Gamification Store

**File**: `client/src/stores/gamification.store.ts`

**State**:

- `xp` - Total experience points
- `level` - Current level
- `badges` - Unlocked badges
- `streak` - Current daily streak

**Actions**:

- `addXP()` - Add experience points
- `unlockBadge()` - Unlock achievement badge
- `updateStreak()` - Update daily streak

### State Persistence

Critical stores are persisted to localStorage:

```typescript
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useAuthStore = defineStore("auth", () => {
  // Automatically syncs with localStorage
  const user = useLocalStorage<User | null>("user", null);

  return { user };
});
```

Persisted stores:

- **Auth** - User session (auto-login)
- **Quiz** - Resume interrupted quizzes
- **Study** - Study progress
- **Preferences** - User preferences (theme, language)

---

## 🌐 Internationalization

### Supported Languages

- **English (EN)** - Primary language
- **Arabic (AR)** - Full RTL support

### i18n Implementation

Q8M uses Vue I18n for internationalization:

```typescript
// client/src/i18n/index.ts
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: { en, ar },
});

export default i18n;
```

### Translation Files

**English** (`client/src/locales/en.json`):

```json
{
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard",
    "quiz": "Quiz",
    "study": "Study"
  },
  "quiz": {
    "start": "Start Quiz",
    "submit": "Submit Answer",
    "next": "Next Question",
    "finish": "Finish Quiz"
  }
}
```

**Arabic** (`client/src/locales/ar.json`):

```json
{
  "nav": {
    "home": "الرئيسية",
    "dashboard": "لوحة التحكم",
    "quiz": "الاختبار",
    "study": "الدراسة"
  },
  "quiz": {
    "start": "ابدأ الاختبار",
    "submit": "إرسال الإجابة",
    "next": "السؤال التالي",
    "finish": "إنهاء الاختبار"
  }
}
```

### RTL Support

Arabic language automatically enables RTL layout:

```vue
<!-- AppLayout.vue -->
<template>
  <div :dir="locale === 'ar' ? 'rtl' : 'ltr'" :class="{ rtl: locale === 'ar' }">
    <!-- Content -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { locale } = useI18n();
</script>
```

Tailwind CSS RTL utilities:

```css
/* Automatically flips margins, padding, etc. */
.ml-4 /* Becomes .mr-4 in RTL */
.rtl:mr-4 /* RTL-specific styling */
```

### Adding New Translations

1. Add translation keys to `client/src/locales/en.json`
2. Add Arabic translations to `client/src/locales/ar.json`
3. Use in components:

   ```vue
   <template>
     <h1>{{ t("page.title") }}</h1>
   </template>

   <script setup lang="ts">
   import { useI18n } from "vue-i18n";
   const { t } = useI18n();
   </script>
   ```

---

## 💳 Payment Integration

### Supported Payment Providers

1. **Stripe** - Global payment processing
   - Credit/debit cards
   - Apple Pay / Google Pay
   - Subscription management
   - Webhook handling

2. **PayPal** - International payment gateway
   - PayPal accounts
   - Credit/debit cards via PayPal
   - Express checkout

3. **APS (Arab Payment Solutions)** - MENA region
   - Local payment methods
   - Regional cards

4. **HyperPay** - Regional payment provider
   - MENA-specific payment methods

### Payment Flow

1. **User selects plan** → Pricing page
2. **Checkout** → Payment method selection
3. **Payment processing** → Stripe/PayPal SDK
4. **Webhook verification** → Server validates payment
5. **Subscription activation** → User gains access
6. **Confirmation email** → Receipt and details

### Stripe Integration

**Client-side** (checkout):

```typescript
// client/src/composables/usePayment.ts
import { loadStripe } from "@stripe/stripe-js";

export function usePayment() {
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

  async function createCheckoutSession(planId: string) {
    const { sessionId } = await apiService.post("/api/payments/create-session", {
      planId,
    });

    await stripe.redirectToCheckout({ sessionId });
  }

  return { createCheckoutSession };
}
```

**Server-side** (webhook):

```typescript
// server/src/routes/payment.routes.ts
fastify.post("/webhook", async (request, reply) => {
  const sig = request.headers["stripe-signature"];
  const event = stripe.webhooks.constructEvent(
    request.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await subscriptionService.activateSubscription(session);
  }

  return { received: true };
});
```

### Subscription Plans

| Plan             | Price (Monthly) | Price (Yearly) | Features               |
| ---------------- | --------------- | -------------- | ---------------------- |
| **Free**         | $0              | $0             | 50 Easy questions      |
| **Junior**       | $9.99           | $99.99         | All Easy + 100 Medium  |
| **Intermediate** | $19.99          | $199.99        | All Medium + 100 Hard  |
| **Senior**       | $29.99          | $299.99        | All questions + paths  |
| **Bundle**       | $49.99          | $499.99        | All + premium features |

### Security

- **PCI DSS Compliant** - Payment data never touches our servers
- **Secure Webhooks** - Signature verification for all webhooks
- **Encryption** - All payment data encrypted in transit
- **Fraud Detection** - Stripe Radar for fraud prevention

---

## 🔒 Security

### Security Measures

#### 1. Authentication & Authorization

- **JWT with HTTP-only cookies** - Prevents XSS attacks
- **Refresh token rotation** - Enhanced security
- **Role-based access control (RBAC)** - Granular permissions
- **Password hashing** - bcrypt with salt rounds
- **Email verification** - Verify user identity

#### 2. Data Protection

- **Encryption at rest** - MongoDB encryption
- **Encryption in transit** - HTTPS/TLS 1.3
- **Secure headers** - CSP, HSTS, X-Frame-Options
- **CORS configuration** - Restricted origins
- **Input sanitization** - Prevent injection attacks

#### 3. API Security

- **Rate limiting** - Prevent abuse (100 req/min)
- **Request validation** - Zod schema validation
- **SQL injection prevention** - Parameterized queries (Mongoose)
- **XSS prevention** - Content Security Policy
- **CSRF protection** - Token-based validation

#### 4. Secret Management

- **Environment variables** - Never commit secrets
- **Secret scanning** - TruffleHog in CI/CD
- **Webhook signatures** - Verify payment webhooks
- **API key rotation** - Regular rotation policy

#### 5. Monitoring & Logging

- **Error tracking** - Centralized error monitoring
- **Audit logs** - Track sensitive operations
- **Security alerts** - Real-time notifications
- **Dependency scanning** - npm audit in CI/CD

### Security Headers

```javascript
// server/src/middleware/security.middleware.ts
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

### OWASP Top 10 Compliance

Q8M is compliant with the [OWASP Top 10](https://owasp.org/www-project-top-ten/):

- ✅ **A01:2021-Broken Access Control** - RBAC, JWT auth
- ✅ **A02:2021-Cryptographic Failures** - Encryption, HTTPS
- ✅ **A03:2021-Injection** - Input validation, parameterized queries
- ✅ **A04:2021-Insecure Design** - Secure architecture patterns
- ✅ **A05:2021-Security Misconfiguration** - Security headers, CORS
- ✅ **A06:2021-Vulnerable Components** - Dependency scanning
- ✅ **A07:2021-Identification and Authentication Failures** - MFA, secure sessions
- ✅ **A08:2021-Software and Data Integrity Failures** - Webhook signatures
- ✅ **A09:2021-Security Logging and Monitoring Failures** - Audit logs
- ✅ **A10:2021-Server-Side Request Forgery** - URL validation

### Reporting Security Issues

If you discover a security vulnerability, please email security@q8m.dev with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

**Please do not open public GitHub issues for security vulnerabilities.**

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

The CI/CD pipeline runs on every push and pull request:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Type Check
        run: pnpm typecheck

      - name: Run Lint
        run: pnpm lint

      - name: Run Unit Tests
        run: pnpm test:unit

      - name: Security Audit - Dependencies
        run: pnpm audit --audit-level=high

      - name: Security Scan - Secrets
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

      - name: Run Build
        run: pnpm build
```

### CI/CD Stages

1. **Checkout** - Clone repository
2. **Setup** - Install Node.js, pnpm, dependencies
3. **Type Check** - Verify TypeScript compilation
4. **Lint** - Run ESLint on all code
5. **Test** - Run 561+ unit tests
6. **Security Audit** - Check for vulnerable dependencies
7. **Secret Scan** - Scan for exposed secrets (TruffleHog)
8. **Build** - Verify production builds succeed

### TruffleHog Secret Scanning

Recent improvements (October 2024):

- ✅ Fixed BASE=HEAD error for all event types
- ✅ Conditional scanning based on Git event (PR, push to main, other branches)
- ✅ Graceful handling of edge cases
- ✅ Exclusion file for false positives

See `TRUFFLEHOG-FIX.md` for details.

### Quality Gates

CI/CD pipeline enforces:

- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ All tests passing (561+)
- ✅ No high/critical dependency vulnerabilities
- ✅ No exposed secrets
- ✅ Successful production build

**Pipeline fails if any gate fails, preventing broken code from being merged.**

---

## 🚀 Deployment

### Production Deployment

#### Option 1: Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

#### Option 2: Cloud Platform Deployment

**Frontend (Vercel)**:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

**Backend (Railway/Render)**:

```bash
# Railway
railway login
railway init
railway up

# Or use Render.com via Git integration
```

**Database (MongoDB Atlas)**:

- Sign up at https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Update `MONGODB_URI` in environment variables

### Environment Configuration

**Production Environment Variables**:

```env
# Backend (.env)
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/q8m
JWT_SECRET=your-production-jwt-secret-change-this
JWT_REFRESH_SECRET=your-production-refresh-secret-change-this
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=your-production-paypal-client-id
FRONTEND_URL=https://yourdomain.com

# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Build Commands

```bash
# Client build
cd client
pnpm build
# Output: client/dist/

# Server build
cd server
pnpm build
# Output: server/dist/

# Both (from root)
pnpm build
```

### Health Checks

Production endpoints for monitoring:

- `GET /api/health` - API health check
- `GET /api/health/db` - Database connectivity
- `GET /api/health/redis` - Redis connectivity (if used)

### Performance Optimization

**Client**:

- ✅ Code splitting by route and feature
- ✅ Lazy loading for heavy components
- ✅ Image optimization (WebP, lazy loading)
- ✅ Service worker caching (PWA)
- ✅ CDN for static assets

**Server**:

- ✅ Database indexing for frequent queries
- ✅ Redis caching for hot data
- ✅ Rate limiting to prevent abuse
- ✅ Compression middleware
- ✅ Connection pooling

**Bundle Size**:

- Main bundle: ~200KB (gzipped)
- Vendor bundle: ~150KB (gzipped)
- Total initial load: ~350KB

**Lighthouse Scores** (Production):

- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/q8m.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes
6. Run tests: `pnpm test:unit`
7. Commit changes: `git commit -m 'feat: add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Code Standards

#### TypeScript

- ✅ **Strict mode enabled** - No `any` types
- ✅ **Explicit types** - Type all function parameters and returns
- ✅ **Interface over type** - Prefer `interface` for object shapes
- ✅ **Const assertions** - Use `as const` for literal types

#### Vue/React Components

- ✅ **Composition API** - Use `<script setup>` syntax
- ✅ **TypeScript props** - Define props with `defineProps<PropsInterface>()`
- ✅ **Reactive primitives** - Use `ref`, `computed`, `watch` correctly
- ✅ **Component naming** - PascalCase for components

#### Testing

- ✅ **Test new features** - Unit tests required for new functionality
- ✅ **Test coverage** - Aim for 80%+ coverage on new code
- ✅ **Integration tests** - Test feature interactions
- ✅ **E2E tests** - Test critical user flows

#### Documentation

- ✅ **Code comments** - Explain complex logic
- ✅ **JSDoc** - Document public APIs
- ✅ **README updates** - Update docs for new features
- ✅ **Type definitions** - Export shared types

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, tooling

**Examples**:

```bash
feat(quiz): add timed quiz mode
fix(auth): resolve token refresh loop
docs(readme): update installation instructions
refactor(store): simplify quiz state management
test(composables): add tests for useAuth composable
```

### Pull Request Process

1. **Update documentation** - Update README, add JSDoc comments
2. **Add/update tests** - Ensure tests pass
3. **Run validation** - `pnpm validate:full` must pass
4. **Update changelog** - Add entry to CHANGELOG.md
5. **Request review** - Tag relevant maintainers
6. **Address feedback** - Make requested changes
7. **Squash commits** - Clean commit history before merge

### Code Review Checklist

Reviewers should check:

- ✅ Code follows style guide
- ✅ Tests are comprehensive
- ✅ Documentation is updated
- ✅ No security vulnerabilities
- ✅ Performance impact considered
- ✅ Accessibility maintained
- ✅ i18n translations added (if applicable)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Installation Issues

**Problem**: `pnpm install` fails

```bash
# Solution 1: Clear pnpm cache
pnpm store prune
rm -rf node_modules
pnpm install

# Solution 2: Use specific Node version
nvm use 18
pnpm install
```

**Problem**: Lockfile out of sync

```bash
# Solution: Update lockfile
pnpm install --no-frozen-lockfile
```

#### 2. Development Server Issues

**Problem**: `pnpm dev` fails to start

```bash
# Check if port 5173 is in use
lsof -i :5173
kill -9 <PID>

# Start dev server
pnpm dev
```

**Problem**: API connection refused

```bash
# Check if server is running
lsof -i :3000

# Start server
pnpm dev:server

# Check environment variables
cat client/.env | grep VITE_API_URL
```

#### 3. Database Issues

**Problem**: MongoDB connection failed

```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (macOS)
brew services start mongodb-community

# Check connection string
echo $MONGODB_URI
```

**Problem**: Migration failed

```bash
# Reset database (CAUTION: deletes all data)
pnpm db:reset

# Run migrations again
pnpm migrate
```

#### 4. Build Issues

**Problem**: TypeScript errors during build

```bash
# Run type check to see errors
pnpm typecheck

# Fix errors, then rebuild
pnpm build
```

**Problem**: Build succeeds but app doesn't work

```bash
# Check console for errors
# Common issue: Environment variables not set

# Verify .env.production exists
ls -la client/.env.production
```

#### 5. Test Issues

**Problem**: Tests fail with "Cannot find module"

```bash
# Clear test cache
pnpm test:unit --clearCache

# Rebuild and test
pnpm build
pnpm test:unit
```

**Problem**: E2E tests timeout

```bash
# Increase timeout in playwright.config.ts
# Or run with more time
pnpm test:e2e --timeout=60000
```

#### 6. Git Hooks Issues

**Problem**: Pre-commit hook fails

```bash
# Manually run checks
pnpm typecheck:quick
pnpm lint

# Fix issues, then commit
git commit -m "fix: resolve issues"
```

**Problem**: Pre-commit hook takes too long

```bash
# Skip hooks (NOT recommended)
git commit --no-verify -m "message"

# Better: Fix the code to pass checks
```

### Debug Mode

Enable verbose logging:

```bash
# Client
VITE_DEBUG=true pnpm dev

# Server
DEBUG=* pnpm dev:server
```

### Getting Help

If you're still stuck:

1. **Check documentation** - Review docs in `/docs` directory
2. **Search issues** - https://github.com/htirawi/q8m/issues
3. **Open new issue** - Provide reproduction steps
4. **Ask in discussions** - https://github.com/htirawi/q8m/discussions

---

## 📚 Documentation

### Available Documentation

#### Architecture & Design

- **[Architecture Overview](docs/architecture/ARCHITECTURE.md)** - System design and patterns
- **[Type Error Prevention](docs/TYPE-ERROR-PREVENTION-ARCHITECTURE.md)** - Comprehensive type safety
- **[TypeScript Best Practices](docs/TYPESCRIPT-BEST-PRACTICES.md)** - Coding standards

#### Development

- **[Developer Checklist](docs/DEVELOPER_CHECKLIST.md)** - Pre-push validation
- **[Build Error Prevention](docs/BUILD_ERROR_PREVENTION.md)** - Avoid common pitfalls
- **[Quality Gates](docs/QUALITY_GATES.md)** - Quality standards

#### Security

- **[Security Audit](docs/audit/SECURITY_AUDIT.md)** - Security best practices
- **[Security Fixes](docs/SECURITY_FIXES_COMPLETE.md)** - Security improvements
- **[CodeQL Security](docs/CODEQL_SECURITY_FIXES.md)** - Static analysis results

#### Features

- **[Study Mode](docs/STUDY_MODE_PROFESSIONAL_IMPLEMENTATION.md)** - Study mode implementation
- **[Gamification](docs/server/GAMIFICATION_API.md)** - Gamification system
- **[Payment System](docs/PAYMENT_SYSTEM.md)** - Payment integration
- **[Learning Paths](docs/server/LEARNING_PATHS_API.md)** - Learning paths

#### Deployment

- **[Deployment Guide](docs/deployment/)** - Production deployment
- **[Production Guidelines](docs/PRODUCTION_GUIDELINES.md)** - Production best practices

### API Documentation

- **Swagger UI**: http://localhost:3000/documentation (when server running)
- **Server API Docs**: [docs/server/](docs/server/)

---

## 🗺️ Roadmap

### Q1 2025

- [ ] **Mobile Apps** - Native iOS and Android apps
- [ ] **AI-Powered Study Assistant** - GPT-4 integration for personalized learning
- [ ] **Video Explanations** - Video tutorials for complex topics
- [ ] **Live Coding Challenges** - Real-time coding exercises
- [ ] **Certification Program** - Official Q8M certifications

### Q2 2025

- [ ] **Team Accounts** - Organization subscriptions
- [ ] **Custom Quiz Builder** - Create and share custom quizzes
- [ ] **Interview Prep Mode** - Simulated interview sessions
- [ ] **Code Playground** - Integrated code editor
- [ ] **Community Contributions** - User-submitted questions

### Q3 2025

- [ ] **More Frameworks** - Svelte, Solid.js, Qwik support
- [ ] **Advanced Analytics** - ML-powered performance insights
- [ ] **Mentorship Program** - Connect with experienced developers
- [ ] **Job Board Integration** - Connect learners with opportunities

### Long-term Vision

- 🌍 **Expand to 10+ languages**
- 🎓 **10,000+ curated questions**
- 👥 **100,000+ active learners**
- 🏆 **Industry-recognized certifications**
- 🤝 **Partner with tech companies**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```
MIT License

Copyright (c) 2024 Hussein Tirawi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🆘 Support

### Getting Help

**GitHub Issues**: For bug reports and feature requests

- 🐛 [Report a bug](https://github.com/htirawi/q8m/issues/new?labels=bug)
- ✨ [Request a feature](https://github.com/htirawi/q8m/issues/new?labels=enhancement)

**GitHub Discussions**: For questions and community support

- 💬 [Join discussions](https://github.com/htirawi/q8m/discussions)
- 🙋 [Ask a question](https://github.com/htirawi/q8m/discussions/new?category=q-a)

**Documentation**: Comprehensive guides and references

- 📖 [Docs folder](docs/)
- 📚 [Wiki](https://github.com/htirawi/q8m/wiki)

### Professional Support

For enterprise support, custom development, or consulting services:

- 📧 Email: support@q8m.dev
- 💼 Enterprise inquiries: enterprise@q8m.dev

### Community

- 🐦 Twitter: [@q8m_platform](https://twitter.com/q8m_platform)
- 💼 LinkedIn: [Q8M Platform](https://linkedin.com/company/q8m)
- 📱 Discord: [Join our community](https://discord.gg/q8m)

---

<div align="center">

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=htirawi/q8m&type=Date)](https://star-history.com/#htirawi/q8m&Date)

---

**Built with ❤️ for developers worldwide**

_Empowering developers with interactive learning experiences_

[![GitHub stars](https://img.shields.io/github/stars/htirawi/q8m?style=social)](https://github.com/htirawi/q8m/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/htirawi/q8m?style=social)](https://github.com/htirawi/q8m/network)
[![GitHub watchers](https://img.shields.io/github/watchers/htirawi/q8m?style=social)](https://github.com/htirawi/q8m/watchers)

[⬆ Back to Top](#q8m---professional-quiz--learning-platform)

</div>
