# Quick Reference - Prevent Build Errors

## 🎯 TL;DR

**Run this before pushing:**

```bash
pnpm validate:interactive
```

Or just push - the pre-push hook will catch errors automatically.

---

## 🐛 Why Errors Reached CI

1. ❌ Type checking was **disabled** (`echo` instead of `vue-tsc`)
2. ❌ Build didn't include type checking
3. ⚠️ You might have used `git push --no-verify`

---

## ✅ What Changed

| Component      | Before          | After                      |
| -------------- | --------------- | -------------------------- |
| **Type Check** | Disabled (echo) | ✅ `vue-tsc --noEmit`      |
| **Build**      | `vite build`    | ✅ `vue-tsc && vite build` |
| **Pre-push**   | Partial         | ✅ Full validation + build |

---

## 🚀 Quick Commands

```bash
# Daily workflow
pnpm dev              # Development server
pnpm format           # Auto-format code
pnpm lint:fix         # Auto-fix lint issues

# Before push
pnpm validate:interactive  # Interactive validation (recommended)
pnpm validate:full         # Full validation including build

# Individual checks
pnpm format:check    # Prettier
pnpm typecheck       # TypeScript (now works!)
pnpm lint           # ESLint
pnpm test:unit      # Tests
pnpm build          # Full build with type checking
```

---

## 🎯 Golden Rule

**Never use `git push --no-verify`**

The pre-push hook catches errors that CI would catch anyway.
Better to catch them in 30 seconds locally than wait 5 minutes for CI to fail.

---

## 📖 Full Documentation

- [Developer Checklist](./docs/DEVELOPER_CHECKLIST.md) - Complete guide
- [Build Error Prevention](./docs/BUILD_ERROR_PREVENTION.md) - Technical details

---

**Questions?** Check the documentation or run `pnpm validate:interactive` to see what's wrong.
