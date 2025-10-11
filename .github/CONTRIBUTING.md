# 🤝 Contributing to Angular Interview Prep

First off, thank you for considering contributing! Every contribution helps developers worldwide prepare for their Angular interviews.

## 🎯 Ways to Contribute

### 1. Report Bugs

- Use the GitHub issue tracker
- Include steps to reproduce
- Include screenshots if applicable
- Mention your environment (browser, OS)

### 2. Suggest Features

- Open an issue with the `enhancement` label
- Explain the use case
- Provide mockups if applicable

### 3. Submit Questions

- Add new Angular interview questions
- Follow the existing format
- Include category, difficulty, and tags

### 4. Improve Documentation

- Fix typos
- Add examples
- Clarify explanations
- Translate (future)

### 5. Fix Bugs

- Check open issues
- Comment to claim an issue
- Submit a PR with tests

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git
- Code editor (VS Code recommended)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/angular-interview-prep.git
cd angular-interview-prep

# 3. Add upstream remote
git remote add upstream https://github.com/htirawi/angular-interview-prep.git

# 4. Install dependencies
pnpm install

# 5. Create a branch
git checkout -b feature/your-feature-name

# 6. Start development server
pnpm dev

# 7. Run tests in watch mode
pnpm test:watch
```

## 📝 Coding Standards

### TypeScript

- Use strict mode (no `any` types)
- Define explicit return types for functions
- Use const assertions where appropriate
- Prefer interfaces for objects, types for unions

### React

- Functional components only
- Custom hooks for reusable logic
- Proper dependency arrays in hooks
- Memoization when appropriate

### Styling

- Tailwind CSS utility classes
- No inline styles (use utilities)
- Responsive design (mobile-first)
- Dark mode support required

### Testing

- Write tests for new features
- Maintain 70%+ coverage
- Test user interactions
- Test edge cases

### Naming Conventions

- **Components**: PascalCase (`QuestionCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useLocalStorage.ts`)
- **Utils**: camelCase (`exportProgress.ts`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`)
- **Types**: PascalCase (`QuestionData`)

## 🔄 Git Workflow

### Branch Naming

```
feature/add-search-filter
fix/bookmark-persistence
docs/update-readme
refactor/split-components
perf/optimize-rendering
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance
- `ci`: CI/CD changes

**Examples:**

```bash
git commit -m "feat(search): add category filter with auto-complete"
git commit -m "fix(bookmark): persist state on page refresh"
git commit -m "docs(readme): add deployment instructions"
git commit -m "perf(render): memoize question list computation"
```

### Pull Request Process

1. **Update your branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**

   ```bash
   pnpm lint          # No linting errors
   pnpm type-check    # No TypeScript errors
   pnpm test          # All tests pass
   pnpm build         # Build succeeds
   ```

3. **Push and create PR**

   ```bash
   git push origin feature/your-feature
   # Create PR on GitHub
   ```

4. **PR Checklist**
   - [ ] PR title follows conventional commits
   - [ ] Description explains what and why
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes (or clearly marked)
   - [ ] Screenshots for UI changes

5. **Wait for review**
   - Address feedback
   - Update PR as needed
   - Maintain clean commit history

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// Good: Descriptive test names
it("displays search results when user types query", () => {
  // Arrange: Set up test state
  const mockQuestions = [...];

  // Act: Perform user action
  fireEvent.change(searchInput, { target: { value: "signals" } });

  // Assert: Verify expected outcome
  expect(screen.getByText(/signal/i)).toBeInTheDocument();
});
```

### Test Coverage

- New components: 80%+ coverage
- New utilities: 90%+ coverage
- Critical paths: 100% coverage
- Run: `pnpm test:coverage`

## 📦 Adding Questions

### Question Format

```typescript
{
  id: 101,                          // Sequential, unique
  question: "Clear, specific question?",
  answer: "Detailed answer with examples...",
  category: "Category Name",         // Use existing categories
  difficulty: "advanced",            // intermediate | advanced | expert
  tags: ["tag1", "tag2", "tag3"]    // Relevant keywords
}
```

### Guidelines

- **Question**: Clear, interview-style, no typos
- **Answer**: Detailed, with examples and tradeoffs
- **Category**: Use existing categories (see `CATEGORIES` in app.ts)
- **Difficulty**:
  - `intermediate`: Standard senior questions
  - `advanced`: Deep knowledge required
  - `expert`: Architecture/scaling level
- **Tags**: 2-4 relevant keywords for search

## 🎨 UI/UX Guidelines

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast (WCAG AA)
- Screen reader tested

### Responsive Design

- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly (min 44x44px targets)
- Test on real devices

### Dark Mode

- All new components must support dark mode
- Use Tailwind `dark:` variants
- Test both themes

## 🔒 Security

### Best Practices

- No inline scripts
- Sanitize user input
- No sensitive data in localStorage
- HTTPS only in production
- CSP headers configured

### Reporting Vulnerabilities

Email security concerns privately to: [your-email]
Do not open public issues for security vulnerabilities.

## 📊 Performance

### Guidelines

- Keep bundle size < 250 KB
- Lazy load heavy features
- Optimize images
- Minimize re-renders
- Profile before optimizing

### Tools

```bash
pnpm build          # Check bundle size
pnpm preview        # Test production build
# Run Lighthouse in Chrome DevTools
```

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested
- `wontfix`: This will not be worked on

## 💬 Communication

- Be respectful and constructive
- Ask questions if unclear
- Provide context in issues
- Respond to feedback promptly
- English for all communication

## 🎓 Code Review Process

### For Contributors

- Be patient
- Be open to feedback
- Explain your reasoning
- Update based on feedback
- Ask questions if unclear

### For Reviewers

- Be constructive
- Explain the "why"
- Suggest improvements
- Approve when ready
- Merge when approved

## 🌟 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in the community

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## ❓ Questions?

- Open a discussion on GitHub
- Ask in issues (label: `question`)
- Check existing documentation

**Thank you for making Angular Interview Prep better for everyone!** 🙏

---

_Last updated: October 2025_
