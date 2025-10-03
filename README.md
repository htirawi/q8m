# q8m - Quiz 8 Mastery

A professional, multi-framework interview preparation platform built with Vue 3, TypeScript, and Tailwind CSS. Master technical interviews with **500+ curated questions** across Angular, React, Next.js, Redux, and advanced topics.

> **🎯 Mission**: Empower developers to master technical interviews through comprehensive practice, real-time feedback, and personalized learning paths.

## 🚀 Features

- **Multi-Framework Support**: Practice questions for Angular (227), React (80), Next.js (50), Redux (100), and Random topics (52)
- **Interactive Quiz System**: Dynamic quiz interface with multiple question types (multiple choice, fill-in-blank, true/false, multiple checkbox)
- **Enhanced Question Cards**: Rich markdown rendering with syntax highlighting and comparison tables
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

## 🛠️ Tech Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS
- **State Management**: Pinia
- **Build Tool**: Vite
- **Testing**: Vitest, Vue Test Utils
- **Code Quality**: ESLint, Prettier, Husky, Pre-push validation
- **Architecture**: Composition API, Composables, Services
- **Deployment**: Vercel, Netlify ready
- **Backend**: Node.js, Express, TypeScript

## 📁 Project Structure

```
client/                 # Vue 3 Frontend Application
├── src/
│   ├── components/     # Vue components
│   │   ├── ui/         # Reusable UI components
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

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start development server**:

   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

## 🎯 Usage

### **Study Mode**

1. **Select Framework**: Choose from Angular (227), React (80), Next.js (50), Redux (100), or Random topics (52)
2. **Practice Questions**: Navigate through questions with keyboard shortcuts
3. **Track Progress**: Bookmark questions and add personal notes
4. **Study Modes**: Sequential, random, or bookmarked-only practice

### **Interactive Quiz Mode**

1. **Choose Quiz Type**: Select framework and difficulty level
2. **Multiple Question Types**:
   - Multiple Choice (single answer)
   - Multiple Checkbox (multiple answers)
   - Fill in the Blank
   - True/False
3. **Real-time Feedback**: Immediate scoring and progress tracking
4. **Performance Analytics**: Detailed breakdown of performance by question type
5. **Study Recommendations**: Personalized suggestions for improvement

## 📚 Question Content

### **Angular (227 Questions)**

- Core concepts, components, services, routing
- Forms (template-driven and reactive)
- Component communication and lifecycle hooks
- Authentication & authorization with JWT
- Angular 16-19 features (Signals, Control Flow, SSR improvements)
- Performance optimization and testing

### **React (80 Questions)**

- Hooks, state management, and lifecycle
- Server Components and Concurrent Features
- Error boundaries and context API
- Performance optimization and testing
- Advanced patterns and best practices

### **Next.js (50 Questions)**

- App Router vs Pages Router
- SSG, SSR, ISR, and CSR strategies
- Image optimization and performance
- API routes and middleware
- Deployment and production optimization

### **Redux (100 Questions)**

- State management patterns
- Redux Toolkit and modern practices
- Middleware and async operations
- Testing and debugging

### **Random Topics (52 Questions)**

- Git workflows and advanced commands
- CSS units, Grid, Flexbox, and animations
- SASS features and best practices
- TypeScript advanced features
- Web APIs and modern JavaScript
- Build tools (Webpack, Vite, ESBuild)
- Docker and containerization

## ⌨️ Keyboard Shortcuts

- `←` `→` Navigate between questions
- `A` Toggle answer visibility
- `B` Bookmark/unbookmark question

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## 🔧 Development

### **Code Quality & Validation**

This project includes a comprehensive pre-push validation system that ensures code quality before changes reach the repository.

#### **Pre-Push Validation Script**

```bash
# Run comprehensive validation (automatically runs on git push)
pnpm pre-push

# Individual validation checks
pnpm check:any          # Find any types in source code
pnpm check:unused       # Find unused variables
pnpm check:console      # Find console.log statements
```

#### **Standard Development Commands**

```bash
# Lint code
pnpm lint

# Lint with strict rules (zero warnings)
pnpm lint:strict

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm type-check

# Validate everything
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

### **Architecture Improvements**

The codebase has been refactored with modern Vue 3 best practices:

- **Path Aliases**: Clean imports using `@/components`, `@/services`, `@/types`, etc.
- **Composables**: `useFrameworkManager`, `useQuestionNavigation`, `useProgressManager`, `useStudyAnalytics`
- **Pinia Stores**: Centralized state management with type safety
- **Type Safety**: Comprehensive TypeScript types and interfaces
- **Component Composition**: Reusable components and utilities
- **Performance**: Lazy loading, code splitting, and optimized bundles
- **Offline Support**: Service worker integration for offline functionality

## 📚 Documentation

- **[📖 Complete Documentation](./docs/README.md)** - Comprehensive documentation index
- **[🚀 q8m Enhancement Plan](./docs/q8m-enhancement-plan.md)** - Detailed enhancement roadmap
- [Architecture](./docs/development/ARCHITECTURE.md) - System design and architecture
- [Features](./docs/development/FEATURES.md) - Detailed feature documentation
- [Deployment](./docs/deployment/DEPLOYMENT.md) - Deployment guides
- [Project Structure](./docs/development/PROJECT-STRUCTURE.md) - Detailed project organization
- [Types Guidelines](./docs/types-guidelines.md) - TypeScript organization best practices

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