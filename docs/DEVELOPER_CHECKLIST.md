# Developer Checklist - Preventing Build Failures

## 🎯 Overview

This guide explains how to catch all errors **before pushing** to avoid CI/CD failures.

## ❓ Why Errors Slip Through to CI

### Common Reasons:

1. **Type checking was disabled** - The `typecheck` command was a no-op echo statement
2. **Dev mode is lenient** - `vite dev` doesn't catch template syntax errors
3. **Missing `vue-tsc`** - Vue SFC type checking requires `vue-tsc`, not just `tsc`
4. **Bypassing hooks** - Using `git push --no-verify` skips pre-push hooks
5. **Different environments** - Local vs CI may have different strictness levels

## ✅ Complete Pre-Push Validation

### Option 1: Automatic (Git Hooks - Recommended)

The pre-push hook (`.husky/pre-push`) automatically runs when you push:

```bash
git push
```

It will:

1. ✅ Lint modified files
2. ✅ Run Prettier format check
3. ✅ Run TypeScript type checking (`vue-tsc`)
4. ✅ Run unit tests
5. ✅ **Build the entire project** (catches ALL errors)

**Note:** This is the same validation that runs in CI!

### Option 2: Manual Validation (Interactive)

Run comprehensive validation with a nice UI:

```bash
pnpm validate:interactive
```

This gives you a detailed report of each check with colors and clear output.

### Option 3: Quick Validation

Run validation without build (faster):

```bash
pnpm validate
```

Run full validation including build:

```bash
pnpm validate:full
```

## 🔧 What Each Check Does

### 1. **Format Check** (`pnpm format:check`)

- Validates Prettier formatting
- **Fix:** `pnpm format`

### 2. **Type Check** (`pnpm typecheck`)

- Runs `vue-tsc --noEmit` to check Vue SFC types
- Catches:
  - ❌ Interface name mismatches (`interface props` vs `Props`)
  - ❌ Unresolvable type references
  - ❌ Missing type imports
- **Fix:** Manually fix type errors shown in output

### 3. **Lint** (`pnpm lint`)

- Runs ESLint on TypeScript and Vue files
- **Fix:** `pnpm lint:fix`

### 4. **Unit Tests** (`pnpm test:unit`)

- Runs Vitest test suite
- **Fix:** Fix failing tests

### 5. **Build** (`pnpm build`)

- **MOST IMPORTANT CHECK**
- Runs `vue-tsc --noEmit && vite build`
- Catches:
  - ❌ Template syntax errors (malformed interpolations)
  - ❌ Emit type errors
  - ❌ Build configuration issues
  - ❌ Missing dependencies
- **Fix:** See error messages and fix issues

## 🚨 Common Errors and Fixes

### Error: `Unresolvable type reference`

**Cause:** Interface defined with lowercase but used with uppercase

```vue
<!-- ❌ Wrong -->
<script setup lang="ts">
interface props {
  // lowercase
  value: string;
}
const props = defineProps<Props>(); // uppercase - MISMATCH
</script>

<!-- ✅ Correct -->
<script setup lang="ts">
interface Props {
  // match the usage
  value: string;
}
const props = defineProps<Props>();
</script>
```

### Error: `Error parsing JavaScript expression`

**Cause:** Malformed template expressions

```vue
<!-- ❌ Wrong -->
<template>
  {{ count }} item{{ count > 1 ? 's' : ''1 }}
  <!-- Extra "1" -->
</template>

<!-- ✅ Correct -->
<template>{{ count }} item{{ count > 1 ? "s" : "" }}</template>
```

### Error: `Unexpected token in emit definition`

**Cause:** Incomplete emit type definitions

```vue
<!-- ❌ Wrong -->
<script setup lang="ts">
defineEmits<{
  accept: [;  // incomplete
}>();
</script>

<!-- ✅ Correct -->
<script setup lang="ts">
defineEmits<{
  accept: [id: string];
}>();
</script>
```

## 🛠️ Development Workflow

### Recommended Workflow:

1. **During Development:**

   ```bash
   pnpm dev  # Run dev server
   ```

2. **Before Committing:**

   ```bash
   pnpm format      # Auto-format code
   pnpm lint:fix    # Auto-fix lint issues
   ```

   Git hooks will run lint-staged automatically on commit.

3. **Before Pushing:**

   ```bash
   pnpm validate:interactive  # Run full validation
   ```

   Or just push - the pre-push hook will validate automatically.

4. **If Pre-Push Hook Fails:**
   - **Don't bypass it!** (`--no-verify` is dangerous)
   - Fix the reported issues
   - Run `pnpm build` locally to verify
   - Push again

## 📊 CI/CD Alignment

Your local validation now **exactly matches** CI checks:

| Check      | Local                        | CI      |
| ---------- | ---------------------------- | ------- |
| Format     | `pnpm format:check`          | ✅ Same |
| Type Check | `pnpm typecheck` (`vue-tsc`) | ✅ Same |
| Lint       | `pnpm lint`                  | ✅ Same |
| Tests      | `pnpm test:unit`             | ✅ Same |
| Build      | `pnpm build`                 | ✅ Same |

## 🚫 What NOT to Do

### ❌ Don't bypass hooks:

```bash
git push --no-verify  # DANGEROUS - skips all validation
```

### ❌ Don't disable type checking:

```json
// In package.json - DON'T DO THIS
"typecheck": "echo 'skipped'"  // ❌ Wrong
"typecheck": "vue-tsc --noEmit"  // ✅ Correct
```

### ❌ Don't push without local testing:

Always run `pnpm build` locally before pushing significant changes.

## 🎓 Best Practices

1. **Enable VS Code Extensions:**
   - ESLint
   - Prettier
   - Vue - Official (Volar)
   - TypeScript Vue Plugin

2. **Run validation frequently:**

   ```bash
   pnpm validate  # Quick check
   ```

3. **Watch mode during development:**

   ```bash
   pnpm test:watch  # Auto-run tests
   ```

4. **Use strict mode:**
   Your `tsconfig.json` should have `"strict": true`

5. **Check types on save:**
   Configure your editor to run type checking on file save.

## 💡 Pro Tips

### Faster Iteration:

```bash
# Check only what changed
git diff --name-only | grep -E '\.(ts|vue)$' | xargs pnpm eslint

# Type check specific file
pnpm vue-tsc --noEmit src/components/MyComponent.vue

# Build without type check (when iterating on non-TS changes)
pnpm build:skip-check
```

### Troubleshooting:

```bash
# Clear caches if you see weird errors
rm -rf node_modules/.vite
rm -rf dist
pnpm install

# Verify hooks are installed
ls -la .git/hooks/
```

## 📚 Additional Resources

- [Vue 3 TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [Vite Configuration](https://vitejs.dev/config/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

## 🆘 Getting Help

If validation fails and you're stuck:

1. Read the error message carefully
2. Check this guide for common errors
3. Run `pnpm validate:interactive` for detailed output
4. Check the CI logs for additional context
5. Ask the team in #dev-help

---

**Remember:** Every check that fails in CI could have been caught locally. Use these tools! 🚀
