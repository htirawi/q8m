# q8m - Quiz 8 Mastery

A professional, multi-framework interview preparation platform built with Vue 3, TypeScript, and Tailwind CSS. Master technical interviews with **500+ curated questions** across Angular, React, Next.js, Redux, and advanced topics.

> **🎯 Mission**: Empower developers to master technical interviews through comprehensive practice, real-time feedback, and personalized learning paths.

> **⚠️ Important**: This is a Vue 3 project only. React/Next.js artifacts are forbidden and guarded in CI.

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
- **Code Quality**: Comprehensive pre-push validation system
- **Architecture**: Clean separation of concerns with Vue 3 Composition API and Pinia
- **Path Aliases**: Modern import organization with TypeScript path mapping
- **Bilingual Support**: English and Arabic language support
- **Payment Integration**: Secure payment processing with multiple providers
- **Accessibility**: WCAG AA compliant with screen reader support

## 🛠️ Tech Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS
- **State Management**: Pinia
- **Build Tool**: Vite
- **Testing**: Vitest, Vue Test Utils, Playwright
- **Code Quality**: ESLint, Prettier, Husky, Pre-push validation
- **Architecture**: Composition API, Composables, Services
- **Routing**: Vue Router
- **Internationalization**: Vue-i18n
- **Security**: CSRF protection, secure cookies, input validation
- **Deployment**: Vercel, Netlify ready, GitHub Pages
- **Backend**: Node.js, Express, TypeScript

## 📁 Project Structure

```
client/                 # Vue 3 Frontend Application
├── src/
│   ├── components/     # Vue components
│   │   ├── ui/         # Reusable UI components
│   │   ├── layout/     # Layout components (AppLayout, etc.)
│   │   ├── auth/       # Authentication components
│   │   ├── payment/    # Payment components
│   │   └── content/    # Content components
│   ├── views/          # Page components
│   ├── composables/    # Vue 3 composables
│   ├── stores/         # Pinia stores
│   ├── types/          # TypeScript type definitions
│   │   ├── domain/     # Domain types (auth, payment)
│   │   ├── dto/        # API contracts
│   │   ├── ui/         # UI component types
│   │   └── core/       # Core utility types
│   ├── router/         # Vue Router configuration
│   ├── locales/        # Internationalization files
│   ├── styles/         # Global styles
│   └── tests/          # Test files
├── public/             # Static assets
└── package.json        # Frontend dependencies

server/                 # Node.js Backend API
├── src/
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   ├── middlewares/    # Express middlewares
│   ├── config/         # Configuration
│   └── utils/          # Utility functions
└── package.json        # Backend dependencies

shared/                 # Shared code between client/server
├── types/              # Shared TypeScript types
├── schemas/            # Validation schemas
└── constants/          # Shared constants

docs/                   # Comprehensive documentation
├── development/        # Development guides
├── deployment/         # Deployment guides
├── design/             # UI/UX documentation
└── project-management/ # Project management docs

fixtures/                # Development data and scripts
├── questions/          # Question datasets
└── scripts/            # Development tools

scripts/                # Build and deployment scripts
├── guard-react.cjs     # React detection guard
├── guard-data.cjs      # Data file guard
└── guard-inline-types.cjs # Inline types guard
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/htirawi/q8m.git
   cd q8m
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

#### **CI Guards**

```bash
# Check for React artifacts (forbidden in Vue 3 project)
npm run guard:react

# Check for data files outside fixtures
npm run guard:data

# Check for inline type declarations
npm run guard:types:inline

# Run all guards
npm run guard:all
```

### **Pre-Push Validation Features**

The validation system automatically checks:

- ✅ **TypeScript Compilation**: Ensures no type errors
- ✅ **ESLint Quality**: Enforces coding standards
- ✅ **Prettier Formatting**: Consistent code formatting
- ✅ **Production Build**: Verifies build success
- ✅ **Test Suite**: Runs all tests
- ✅ **Any Type Detection**: Finds `any` types (excluding example code)
- ✅ **Unused Variables**: Identifies unused variables and imports
- ✅ **Console Statements**: Detects `console.log` usage
- ✅ **React Detection**: Prevents React artifacts in Vue 3 project
- ✅ **Data File Management**: Ensures proper data file organization
- ✅ **Type Organization**: Enforces proper TypeScript type structure

### Pre-commit Hooks
The project uses Husky for pre-commit hooks:
- ESLint checks
- Prettier formatting
- TypeScript type checking
- Test execution

### **Architecture Improvements**

The codebase has been refactored with modern Vue 3 best practices:

- **Path Aliases**: Clean imports using `@/components`, `@/services`, `@/types`, etc.
- **Composables**: `useFrameworkManager`, `useQuestionNavigation`, `useProgressManager`, `useStudyAnalytics`
- **Pinia Stores**: Centralized state management with type safety
- **Type Safety**: Comprehensive TypeScript types and interfaces
- **Component Composition**: Reusable components and utilities
- **Performance**: Lazy loading, code splitting, and optimized bundles
- **Offline Support**: Service worker integration for offline functionality

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

## 📚 Documentation

- **[📖 Complete Documentation](./docs/README.md)** - Comprehensive documentation index
- **[🚀 q8m Enhancement Plan](./docs/q8m-enhancement-plan.md)** - Detailed enhancement roadmap
- [Architecture](./docs/development/ARCHITECTURE.md) - System design and architecture
- [Features](./docs/development/FEATURES.md) - Detailed feature documentation
- [Deployment](./docs/deployment/DEPLOYMENT.md) - Deployment guides
- [Project Structure](./docs/development/PROJECT-STRUCTURE.md) - Detailed project organization
- [Types Guidelines](./docs/types-guidelines.md) - TypeScript organization best practices

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
- **Image Optimization**: WebP support and lazy loading
- **Caching**: Service worker for offline functionality
- **Bundle Analysis**: Regular bundle size monitoring

## 🆕 Recent Updates

### **v2.0 - q8m Rebranding & Enhancement**

- ✅ **Complete Rebranding**: Transformed to q8m - Quiz 8 Mastery
- ✅ **Vue 3 Focus**: Confirmed Vue 3-only architecture with React guards
- ✅ **TypeScript Organization**: Comprehensive type structure and CI guards
- ✅ **Enhanced Documentation**: Complete enhancement plan and guidelines
- ✅ **PWA Optimization**: Updated manifest and meta tags for q8m branding
- ✅ **CI Guards**: Automated quality checks for React, data files, and types

### **v1.0 - Production Ready & Modern Architecture**

- ✅ **Path Aliases**: Modern import organization with TypeScript path mapping
- ✅ **Console Log Cleanup**: Removed all console.log statements from production code
- ✅ **Interactive Quiz System**: Complete quiz interface with multiple question types
- ✅ **Study Analytics**: Comprehensive performance tracking and analytics dashboard
- ✅ **Offline Support**: Progressive Web App with service worker integration
- ✅ **Component Organization**: Clean folder structure with feature-based organization
- ✅ **Type Safety**: Enhanced TypeScript types and interfaces
- ✅ **Performance**: Lazy loading and code splitting optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. **Run pre-push validation**: `pnpm pre-push`
5. Ensure all checks pass
6. Submit a pull request

### **Development Workflow**

```bash
# Before making changes
git checkout -b feature/your-feature

# Make your changes, then validate
pnpm pre-push

# Commit and push (validation runs automatically)
git add .
git commit -m "feat: your changes"
git push
```

## 🎯 Benefits of Pre-Push Validation

- **🛡️ Quality Assurance**: Prevents bad code from reaching the repository
- **⚡ Faster Development**: Automated checks instead of manual code review
- **🔄 Consistency**: Ensures all team members follow the same standards
- **🐛 Early Bug Detection**: Catches issues before they become problems
- **📚 Learning**: Developers learn best practices through validation feedback
- **🚀 Production Ready**: Ensures code is always deployable

## 📊 Project Statistics

- **Total Questions**: 500+ across 5 categories
- **Code Quality**: 95/100 production readiness score
- **Test Coverage**: Comprehensive test suite
- **Type Safety**: 100% TypeScript coverage
- **Performance**: Optimized for fast loading and smooth UX

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 👨‍💻 Author

**Hussein Tirawi** - [GitHub](https://github.com/htirawi)

---

Built with ❤️ for the frontend developer community.

_Last updated: January 2025 - q8m Enhancement Plan v2.0_