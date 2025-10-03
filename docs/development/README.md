# Development Documentation

Technical documentation for developers working on the Frontend Interview Prep application.

## 📋 Core Documentation

### System Overview

- **[Architecture](./ARCHITECTURE.md)** - System architecture, design patterns, and technical decisions
- **[Project Structure](./PROJECT-STRUCTURE.md)** - Detailed project organization and file structure
- **[Features](./FEATURES.md)** - Comprehensive feature documentation and implementation details

## 🏗️ Architecture Overview

The application follows a modern React architecture with:

- **Component-based design** with TypeScript
- **Feature-based organization** for scalability
- **Shared utilities** and reusable components
- **Type-safe** data management
- **PWA capabilities** for offline usage

## 🛠️ Development Workflow

1. **Setup**: Follow the [Getting Started](../getting-started/) guide
2. **Development**: Use `pnpm dev` for local development
3. **Testing**: Run `pnpm test` for unit tests
4. **Linting**: Use `pnpm lint` for code quality
5. **Building**: Use `pnpm build` for production builds

## 📁 Key Directories

- `src/components/` - Reusable UI components
- `src/pages/` - Main application pages
- `src/data/` - Question data and framework definitions
- `src/features/` - Feature-specific components
- `src/shared/` - Shared utilities and components
- `src/types/` - TypeScript type definitions

## 🔧 Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build**: Vite, PostCSS
- **Testing**: Vitest, Testing Library
- **Code Quality**: ESLint, Prettier, Husky
- **Deployment**: Vercel, Netlify ready

## 📚 Related Documentation

- [Getting Started](../getting-started/) - Setup and basic usage
- [Deployment](../deployment/) - Production deployment
- [Design](../design/) - UI/UX design decisions

---

_For deployment information, see [Deployment Documentation](../deployment/)._
