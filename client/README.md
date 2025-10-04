# q8m Client - Development Commands

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Development Commands

### Code Quality

```bash
# Type checking
pnpm typecheck

# Linting (with auto-fix)
pnpm lint

# Formatting
pnpm format

# Check formatting
pnpm format:check
```

### Testing

```bash
# Run unit tests
pnpm test:unit

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Pre-push Validation

```bash
# Run all quality checks locally
pnpm validate

# Run pre-push checks (typecheck + lint + test + build)
pnpm pre-push
```

## Pre-push Hooks

The project uses Husky to run quality checks before commits and pushes:

- **pre-commit**: Runs `lint-staged` to format and lint staged files
- **pre-push**: Runs typecheck, lint, unit tests, and build

To run pre-push checks manually:

```bash
cd client
pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build
```

## Project Structure

```
client/src/
├── features/           # Feature-based organization
│   └── home/          # Home page feature
│       ├── pages/     # Page components
│       └── components/ # Feature-specific components
├── layouts/           # Layout components
├── components/ui/     # Reusable UI primitives
├── assets/styles/    # Design system tokens & globals
├── store/            # Pinia store configuration
├── i18n/             # Internationalization
└── router/           # Vue Router configuration
```
