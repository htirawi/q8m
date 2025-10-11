# Contributing to Vue 3 Quiz Platform

Thank you for your interest in contributing to the Vue 3 Quiz Platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/quiz-platform.git
   cd quiz-platform
   ```

3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/htirawi/quiz-platform.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit the files with your configuration
```

### 3. Start Development Servers

```bash
# Terminal 1: Start client
cd client
pnpm dev

# Terminal 2: Start server
cd server
pnpm dev
```

### 4. Verify Setup

- Client: http://localhost:5173
- Server: http://localhost:3000
- Run tests: `pnpm test`

## 📝 Contributing Guidelines

### Types of Contributions

- **Bug Fixes**: Fix existing issues
- **Features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code
- **Accessibility**: Improve accessibility features

### Before You Start

1. Check existing issues and pull requests
2. Create an issue for significant changes
3. Discuss major changes with maintainers
4. Ensure your changes align with project goals

## 🔄 Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Follow coding standards
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

Use conventional commits:

```bash
git commit -m "feat: add new payment method"
git commit -m "fix: resolve authentication issue"
git commit -m "docs: update API documentation"
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

### 5. PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] PR description is clear
- [ ] Issue is linked (if applicable)

## 📏 Coding Standards

### Vue 3 Best Practices

- Use Composition API with `<script setup>`
- Prefer `ref` and `reactive` appropriately
- Use TypeScript for type safety
- Follow Vue 3 naming conventions

```vue
<template>
  <div class="component">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: string];
}>();

const localValue = ref("");
const computedValue = computed(() => props.title.toUpperCase());
</script>
```

### TypeScript Guidelines

- Use strict type checking
- Define interfaces for complex objects
- Use type guards for runtime checks
- Prefer `interface` over `type` for object shapes

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const isUser = (obj: unknown): obj is User => {
  return typeof obj === "object" && obj !== null && "id" in obj;
};
```

### Destructuring & Optional Chaining Patterns

- **Object Destructuring**: Use for function parameters and local variables
- **Optional Chaining**: Use `?.` for safe property access
- **Nullish Coalescing**: Use `??` for default values (preserves falsy values)
- **Vue 3 Reactivity**: Use `toRefs()` for props and `storeToRefs()` for Pinia stores

```typescript
// ✅ CORRECT: Function parameter destructuring
function handlePayment({ planId, currency }: PaymentRequest) {
  const { amount, description } = getPlanDetails(planId) ?? {};
  // ...
}

// ✅ CORRECT: Vue 3 props with reactivity
const { title, price } = toRefs(props);

// ✅ CORRECT: Optional chaining and nullish coalescing
const userRole = user?.permissions?.role ?? "guest";
const errorMessage = error?.message ?? "Unknown error occurred";

// ✅ CORRECT: Pinia store destructuring
const { user, isAuthenticated } = storeToRefs(useAuthStore());

// ❌ INCORRECT: Direct destructuring from reactive objects
const { title } = props; // Breaks Vue reactivity!
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow BEM methodology for custom CSS
- Use CSS custom properties for theming
- Ensure responsive design

```vue
<template>
  <div class="card bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 class="card__title text-xl font-bold text-gray-900 dark:text-white">
      {{ title }}
    </h2>
  </div>
</template>
```

## 🧪 Testing Guidelines

### Unit Tests

- Test components in isolation
- Mock external dependencies
- Test both happy and error paths
- Aim for 80%+ coverage

```typescript
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import MyComponent from "./MyComponent.vue";

describe("MyComponent", () => {
  it("renders correctly", () => {
    const wrapper = mount(MyComponent, {
      props: { title: "Test Title" },
    });

    expect(wrapper.text()).toContain("Test Title");
  });
});
```

### Integration Tests

- Test component interactions
- Test store integration
- Test API integration
- Use realistic test data

### E2E Tests

- Test critical user flows
- Test payment processes
- Test authentication flows
- Use Playwright for browser testing

## 📚 Documentation

### Code Documentation

- Document complex functions
- Use JSDoc for API documentation
- Include examples in documentation
- Keep documentation up to date

````typescript
/**
 * Creates a payment session for the given plan
 * @param planId - The ID of the plan to purchase
 * @param currency - The currency for the payment
 * @returns Promise resolving to payment session data
 * @throws {PaymentError} When payment creation fails
 *
 * @example
 * ```typescript
 * const session = await createPayment('INTERMEDIATE', 'USD')
 * console.log(session.checkoutUrl)
 * ```
 */
async function createPayment(planId: string, currency: string): Promise<PaymentSession> {
  // Implementation
}
````

### README Updates

- Update README for new features
- Include setup instructions
- Add troubleshooting sections
- Keep examples current

## 🐛 Issue Reporting

### Bug Reports

Include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Alternatives considered

### Issue Templates

Use the provided issue templates:

- Bug report template
- Feature request template
- Documentation template

## 🔍 Code Review Process

### For Contributors

- Respond to review feedback promptly
- Make requested changes
- Ask questions if unclear
- Be open to suggestions

### For Reviewers

- Be constructive and respectful
- Focus on code quality and correctness
- Check for security issues
- Verify tests and documentation

## 🚀 Release Process

1. **Version Bumping**: Use semantic versioning
2. **Changelog**: Update CHANGELOG.md
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update relevant docs
5. **Release**: Create GitHub release

## 📞 Getting Help

- **Discord**: Join our community Discord
- **GitHub Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers directly
- **Issues**: Create an issue for bugs or features

## 🏆 Recognition

Contributors are recognized in:

- README contributors section
- Release notes
- GitHub contributors page
- Annual contributor awards

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Vue 3 Quiz Platform! 🎉
