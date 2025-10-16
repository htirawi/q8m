# Client Documentation

> **Quiz Platform** - Frontend Architecture and Component Reference  
> Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Composables](#composables)
5. [Stores (Pinia)](#stores-pinia)
6. [Utils](#utils)
7. [Features](#features)
8. [Routing](#routing)
9. [Development Guide](#development-guide)

---

## Overview

The Quiz Platform client is a modern Vue 3 application built with TypeScript, designed to provide an engaging learning experience through quizzes and study modes. The application supports multiple subscription tiers, payment processing, gamification, and full internationalization (i18n) with RTL support for Arabic.

### Tech Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS (mobile-first, tokens-based)
- **Routing**: Vue Router
- **i18n**: vue-i18n (EN + AR with RTL support)
- **Testing**: Vitest + Playwright
- **HTTP Client**: Native Fetch API with helpers

---

## Architecture

### Directory Structure

```
client/src/
├── assets/          # Static assets (images, logos)
├── components/      # Reusable UI components
│   ├── auth/        # Authentication components
│   ├── layout/      # Layout components
│   ├── marketing/   # Marketing/upsell components
│   ├── payment/     # Payment checkout components
│   ├── paywall/     # Paywall UI components
│   ├── pricing/     # Pricing page components
│   ├── study/       # Study mode components
│   └── ui/          # Base UI components
├── composables/     # Vue composables (hooks)
├── config/          # Configuration files
├── constants/       # App constants
├── features/        # Feature-based modules
├── i18n/            # Internationalization
├── router/          # Vue Router configuration
├── schemas/         # Validation schemas
├── services/        # API service layer
├── stores/          # Pinia stores
├── styles/          # Global styles
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

---

## Components

### Auth Components

#### `AuthenticationForm.vue`

Multi-step authentication form supporting both login and registration flows.

- **Props**: `mode: 'login' | 'register'`
- **Features**: Email validation, password strength indicator, terms acceptance
- **Emits**: `success`, `error`, `mode-change`

---

### Layout Components

#### `AppLayout.vue`

Main application layout wrapper providing consistent structure across pages.

- **Features**: Header, footer, navigation, user menu, language switcher
- **Slots**: `default`, `header`, `sidebar`
- **Responsive**: Mobile-first with hamburger menu

---

### Marketing Components

#### `PaymentCheckoutModal.vue`

Full-screen checkout modal for payment processing.

- **Props**: `planType`, `billingCycle`, `currency`
- **Features**: Stripe/PayPal integration, address validation, order summary
- **Emits**: `success`, `cancel`, `error`

#### `PlanComparisonCard.vue`

Side-by-side plan comparison card showing features and pricing.

- **Props**: `plan`, `currentPlan`, `highlighted`
- **Features**: Feature list, CTA button, badge for recommended plans

#### `PlanConversionModal.vue`

Modal for converting free users to paid plans with compelling CTAs.

- **Props**: `trigger`, `source`
- **Features**: Social proof, feature highlights, urgency indicators

#### `PlanUpsellModal.vue`

Upsell modal encouraging users to upgrade their current plan.

- **Props**: `currentPlan`, `targetPlan`, `reason`
- **Features**: Benefits comparison, limited-time offers, discount codes

---

### Payment Components

#### `BillingForm.vue`

Billing information form for checkout process.

- **Props**: `initialData`
- **Features**: Address autocomplete, validation, country selector
- **Emits**: `submit`, `change`

#### `CheckoutForm.vue`

Complete checkout form integrating payment methods and billing.

- **Props**: `planType`, `currency`
- **Features**: Payment method selection, terms acceptance, order summary
- **Emits**: `success`, `error`

#### `CheckoutHeader.vue`

Header component for checkout pages showing progress and security badges.

- **Props**: `step`, `totalSteps`

#### `CheckoutSummary.vue`

Order summary sidebar showing selected plan, pricing, and discounts.

- **Props**: `planType`, `billingCycle`, `currency`, `couponCode`
- **Features**: Line items, tax calculation, total display

#### `OrderSummary.vue`

Detailed order summary for review before payment.

- **Props**: `order`
- **Features**: Itemized breakdown, discount display, payment method info

#### `PaymentMethodSelector.vue`

Component for selecting payment gateway (PayPal, Credit Card, etc.).

- **Props**: `availableMethods`, `selectedMethod`
- **Features**: Gateway logos, method descriptions, availability indicators
- **Emits**: `select`, `change`

---

### Paywall Components

#### `InlineUpsellCard.vue`

Inline card promoting premium features within free tier experience.

- **Props**: `feature`, `placement`
- **Features**: Feature preview, CTA button, dismissible
- **Emits**: `click`, `dismiss`

#### `LockedBadge.vue`

Badge indicating locked/premium content.

- **Props**: `size`, `tooltip`

#### `SoftPaywallModal.vue`

Non-blocking paywall modal for free tier users.

- **Props**: `trigger`, `maxFreeQuestions`, `questionsUsed`
- **Features**: Progress indicator, upgrade benefits, trial offers
- **Emits**: `upgrade`, `dismiss`

---

### Pricing Components

#### `BillingToggle.vue`

Toggle switch for monthly/yearly billing with savings indicator.

- **Props**: `modelValue`, `savings`
- **Emits**: `update:modelValue`

#### `ComparisonTable.vue`

Feature comparison table across all plan tiers.

- **Props**: `plans`, `highlightPlan`
- **Features**: Sticky header, responsive collapse, tooltips

#### `CompetitorComparison.vue`

Comparison against competitors showing value proposition.

- **Props**: `competitors`

#### `FaqAccordion.vue`

FAQ accordion component for pricing page.

- **Props**: `faqs`, `expanded`
- **Features**: Search, categories, smooth expand/collapse

#### `FeatureGrid.vue`

Grid layout showcasing platform features.

- **Props**: `features`, `columns`

#### `FinalCta.vue`

Final call-to-action section on pricing page.

- **Props**: `plan`

#### `GuaranteePanel.vue`

Money-back guarantee and trust signals panel.

- **Props**: `guaranteeDays`

#### `ModernPricingCard.vue`

Modern redesigned pricing card with enhanced visuals.

- **Props**: `plan`, `billingCycle`, `featured`
- **Features**: Animated gradients, feature highlights, social proof

#### `PlanCard.vue`

Standard pricing plan card.

- **Props**: `plan`, `billingCycle`, `popular`
- **Features**: Price display, feature list, CTA button

#### `PricingCards.vue`

Container for multiple pricing cards with layout logic.

- **Props**: `billingCycle`, `highlightPlan`

#### `PricingHero.vue`

Hero section for pricing page.

- **Props**: `headline`, `subheadline`

#### `PricingTestimonials.vue`

Testimonials carousel for pricing page.

- **Props**: `testimonials`

#### `RoiSection.vue`

ROI calculator showing value of premium features.

- **Props**: `assumptions`

---

### Study Components

#### `LevelCard.vue`

Card representing a difficulty level (Junior, Intermediate, Senior).

- **Props**: `level`, `questionCount`, `progress`, `locked`
- **Features**: Progress indicator, locked state, stats display
- **Emits**: `select`, `unlock`
- **Tests**: `LevelCard.spec.ts` (unit tests included)

#### `ModeCard.vue`

Card for selecting study vs quiz mode.

- **Props**: `mode`, `description`, `icon`
- **Emits**: `select`

#### `StartStudyingCta.vue`

Call-to-action component to start studying.

- **Props**: `level`, `mode`
- **Features**: Quick start button, resume session indicator

#### `StickyStartBar.vue`

Sticky bottom bar with start/continue studying button.

- **Props**: `visible`, `text`
- **Features**: Auto-hide on scroll, mobile-optimized

---

### UI Components (Base Components)

#### `Button.vue`

Primary button component with variants and states.

- **Props**: `variant`, `size`, `loading`, `disabled`, `icon`
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
- **Sizes**: `xs`, `sm`, `md`, `lg`, `xl`

#### `Card.vue`

Container card component with optional header and footer.

- **Props**: `title`, `subtitle`, `bordered`, `hoverable`
- **Slots**: `default`, `header`, `footer`, `actions`

#### `CurrencySwitcher.vue`

Dropdown for switching between currencies (USD, JOD, SAR).

- **Props**: `modelValue`
- **Emits**: `update:modelValue`

#### `FormDivider.vue`

Divider with optional text for forms ("OR" divider).

- **Props**: `text`

#### `FormField.vue`

Form field wrapper with label, validation, and error handling.

- **Props**: `label`, `error`, `required`, `hint`
- **Slots**: `default`

#### `HelperText.vue`

Helper text component for forms.

- **Props**: `text`, `type` (`info` | `error` | `success` | `warning`)

#### `Input.vue`

Input field component with validation and icons.

- **Props**: `modelValue`, `type`, `placeholder`, `error`, `disabled`, `icon`
- **Features**: Password toggle, auto-validation, character counter
- **Emits**: `update:modelValue`, `blur`, `focus`

#### `LangSwitch.vue`

Language switcher component (EN/AR with RTL support).

- **Props**: None (uses i18n store)
- **Features**: Smooth transition, flag icons, direction toggle

#### `LoadingSpinner.vue`

Loading spinner with optional text.

- **Props**: `size`, `text`, `overlay`
- **Sizes**: `sm`, `md`, `lg`

#### `LoadingState.vue`

Full-page or contained loading state component.

- **Props**: `fullPage`, `message`

#### `PerformanceMonitor.vue`

Development component for monitoring performance metrics.

- **Features**: FPS counter, memory usage, render time
- **Only in dev mode**

#### `Toast.vue`

Individual toast notification component.

- **Props**: `message`, `type`, `duration`, `closable`
- **Types**: `success`, `error`, `warning`, `info`

#### `ToastContainer.vue`

Container managing all toast notifications.

- **Features**: Auto-dismiss, stacking, animations

#### `UserMenu.vue`

Dropdown menu for authenticated users.

- **Features**: Profile link, settings, logout, avatar display

---

## Composables

### Authentication

#### `useAuthRedirect.ts`

Handles authentication redirects and post-login navigation.

- **Returns**: `{ redirectAfterLogin, setRedirectPath, clearRedirectPath }`
- **Features**: Stores intended route, handles query params

### Analytics & Tracking

#### `useABTest.ts`

A/B testing utilities for feature flags and experiments.

- **Returns**: `{ isVariant, getVariant, trackConversion }`

#### `useAnalytics.ts`

Analytics event tracking integration.

- **Returns**: `{ trackEvent, trackPageView, identify }`

#### `useHomepageAnalytics.ts`

Specialized analytics for homepage interactions.

- **Returns**: `{ trackHeroAction, trackFeatureView, trackPricing }`

#### `useScrollTracking.ts`

Tracks scroll depth and engagement.

- **Returns**: `{ scrollDepth, trackScrollEvent }`

### Checkout & Payments

#### `useCheckout.ts`

Manages checkout flow and payment processing.

- **Returns**: `{ createOrder, capturePayment, cancelOrder, isProcessing }`
- **Features**: PayPal integration, error handling, order state management

#### `useCheckoutForm.ts`

Form state management for checkout process.

- **Returns**: `{ formData, errors, validate, submit, reset }`
- **Features**: Multi-step validation, address autocomplete

#### `useCurrency.ts`

Currency selection and conversion utilities.

- **Returns**: `{ currency, setCurrency, convertPrice, formatPrice }`
- **Supports**: USD, JOD, SAR

### Entitlements & Permissions

#### `useEntitlementGuard.ts`

Guards routes and features based on user entitlements.

- **Returns**: `{ hasAccess, checkEntitlement, requireEntitlement }`
- **Features**: Soft paywall triggers, redirect logic

### UI & Forms

#### `useDropdown.ts`

Dropdown menu state management.

- **Returns**: `{ isOpen, toggle, close, open }`

#### `useErrorHandler.ts`

Global error handling and display.

- **Returns**: `{ handleError, clearErrors, errors }`

#### `useFormValidation.ts`

Form validation utilities.

- **Returns**: `{ validate, validateField, errors, isValid }`
- **Features**: Zod schema support, async validation

#### `useToast.ts`

Toast notification management.

- **Returns**: `{ showToast, success, error, warning, info, dismiss }`

### Gamification

#### `useGamification.ts`

Gamification features (XP, badges, levels).

- **Returns**: `{ xp, level, badges, earnBadge, gainXP }`

#### `useProgress.ts`

User progress tracking and statistics.

- **Returns**: `{ progress, updateProgress, getStats }`

### Pricing & Plans

#### `usePlans.ts`

Plan management and pricing information.

- **Returns**: `{ plans, getPlans, getPlanByType, isLoading }`

#### `usePlanEntry.ts`

Handles plan selection and entry points.

- **Returns**: `{ selectPlan, redirectToCheckout }`

#### `usePricingRoute.ts`

Pricing page routing with query param handling.

- **Returns**: `{ selectedPlan, billingCycle, updateParams }`

#### `useUpsell.ts`

Upsell logic and modal management.

- **Returns**: `{ showUpsell, dismissUpsell, shouldShowUpsell }`

#### `useSoftPaywall.ts`

Soft paywall trigger logic.

- **Returns**: `{ isPaywallActive, triggerPaywall, dismissPaywall }`

### PWA & Performance

#### `usePerformance.ts`

Performance monitoring and optimization.

- **Returns**: `{ metrics, reportMetric, vitals }`

#### `usePWA.ts`

Progressive Web App functionality.

- **Returns**: `{ installPrompt, install, canInstall }`

### Quiz & Study

#### `useQuizResults.ts`

Quiz results and scoring logic.

- **Returns**: `{ results, calculateScore, saveResults }`

#### `useStudy.ts`

Study mode functionality and session management.

- **Returns**: `{ startSession, endSession, sessionStats }`

### Routing & Navigation

#### `usePostLoginRouter.ts`

Post-login navigation logic.

- **Returns**: `{ redirectAfterLogin, getIntendedRoute }`

### SEO & Meta

#### `useSEO.ts`

SEO meta tags and structured data management.

- **Returns**: `{ setTitle, setDescription, setMeta, setOpenGraph }`

### Locale & i18n

#### `useLocale.ts`

Locale management and i18n utilities.

- **Returns**: `{ locale, setLocale, t, availableLocales }`

---

## Stores (Pinia)

### Auth Store (`stores/auth.ts`)

Manages authentication state and user session.

**State**:

- `user: User | null` - Current authenticated user
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `tokens: AuthTokens | null` - Access/refresh tokens
- `isInitialized: boolean` - Initialization status

**Actions**:

- `login(credentials)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `logoutFromAllDevices()` - Logout from all sessions
- `refreshToken()` - Refresh access token
- `getCurrentUser()` - Fetch current user data
- `resendVerificationEmail(email)` - Resend verification email
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, password)` - Reset password
- `changePassword(current, new)` - Change password
- `checkEmailExists(email)` - Check if email is registered
- `initializeAuth()` - Initialize auth from httpOnly cookies

**Getters**:

- `hasEntitlement(entitlement)` - Check user entitlement
- `isEmailVerified` - Email verification status
- `userRole` - Current user role
- `hasRole(role)` - Check user role

### Payment Store (`stores/payment.ts`)

Manages payment flow and order state.

**State**:

- `order: Order | null` - Current order
- `paymentIntent: string | null` - Payment intent ID
- `isProcessing: boolean` - Processing state
- `error: string | null` - Payment error

**Actions**:

- `createOrder(planType, currency)` - Create payment order
- `capturePayment(orderId)` - Capture payment
- `cancelOrder(orderId)` - Cancel order
- `getOrderStatus(orderId)` - Check order status
- `applyDiscount(code)` - Apply coupon code
- `clearOrder()` - Clear order state

### Plan Store (`stores/plan.ts`)

Manages subscription plans and pricing.

**State**:

- `plans: Plan[]` - Available plans
- `selectedPlan: string | null` - Currently selected plan
- `billingCycle: 'monthly' | 'yearly'` - Billing cycle
- `currency: Currency` - Selected currency

**Actions**:

- `fetchPlans()` - Fetch available plans
- `selectPlan(planType)` - Select a plan
- `setBillingCycle(cycle)` - Set billing cycle
- `setCurrency(currency)` - Set currency

### Theme Store (`stores/theme.ts`)

Manages theme and UI preferences.

**State**:

- `theme: 'light' | 'dark' | 'auto'` - Current theme
- `direction: 'ltr' | 'rtl'` - Text direction

**Actions**:

- `setTheme(theme)` - Set theme
- `toggleTheme()` - Toggle theme
- `setDirection(direction)` - Set text direction

---

## Utils

### `abTestAnalysis.ts`

A/B test analysis and variant assignment utilities.

- **Functions**: `assignVariant`, `trackConversion`, `getVariantStats`

### `apiHelpers.ts`

HTTP request helpers and response handling.

- **Functions**:
  - `handleApiResponse<T>(response)` - Safe JSON parsing with error handling
  - `getErrorMessage(error, fallback)` - Extract user-friendly error messages
  - `buildQueryString(params)` - Build URL query string
  - `retryRequest(fn, retries)` - Retry failed requests

### `planMapping.ts`

Maps plan types to entitlements and features.

- **Functions**:
  - `getPlanEntitlements(planType)` - Get entitlements for plan
  - `canAccessLevel(planType, level)` - Check level access
  - `getPlanFeatures(planType)` - Get plan features

### `telemetry.ts`

Lightweight telemetry and event tracking.

- **Functions**:
  - `trackEvent(event, data)` - Track analytics event
  - `trackPageView(path, title)` - Track page view
- **Features**: Fire-and-forget, vendor-agnostic, dev logging

---

## Features

Each feature module is self-contained with its own components and pages.

### Account (`features/account/`)

- **Pages**: `AccountPage.vue`, `SubscriptionPage.vue`
- **Components**: `BillingHistorySection.vue`, `CancelSubscriptionModal.vue`, `CurrentPlanCard.vue`, `SubscriptionActions.vue`

### Admin (`features/admin/`)

- **Pages**: `AdminDashboardPage.vue`

### Auth (`features/auth/`)

- **Pages**: `LoginPage.vue`, `RegisterPage.vue`, `VerifyEmailPage.vue`, `OAuthCallbackPage.vue`
- **Components**: `EmailStep.vue`, `PasswordStrengthIndicator.vue`, `ProfileStep.vue`, `OAuthButtons.vue`

### Checkout (`features/checkout/`)

- **Pages**: `CheckoutPage.vue`

### Dashboard (`features/dashboard/`)

- **Pages**: `DashboardPage.vue`

### Design System (`features/design-system/`)

- **Pages**: `DesignSystemPage.vue` (Component showcase)

### Errors (`features/errors/`)

- **Pages**: `NotFoundPage.vue`, `UnauthorizedPage.vue`

### Guide (`features/guide/`)

- **Pages**: `EasyGuidePage.vue`

### Home (`features/home/`)

- **Pages**: `HomePage.vue`, `LevelSelectionPage.vue`, `ModeChooserPage.vue`
- **Components**: `HeroSection.vue`, `FeaturesGrid.vue`, `TestimonialsSection.vue`, `FaqSection.vue`, `FooterCta.vue`, `HomepagePricingTeaser.vue`, `LearningPathSection.vue`, `MobileStickyBar.vue`, `SocialProofBar.vue`

### Legal (`features/legal/`)

- **Pages**: `PrivacyPage.vue`, `TermsPage.vue`

### Payment (`features/payment/`)

- **Pages**: `PaymentSuccessPage.vue`, `PaymentErrorPage.vue`

### Pricing (`features/pricing/`)

- **Pages**: `PricingPage.vue`, `ModernPricingPage.vue`

### Quiz (`features/quiz/`)

- **Pages**: `QuizPage.vue`, `EasyQuizzesPage.vue`, `QuizSelectionPage.vue`

### Study (`features/study/`)

- **Pages**: `StudyModePage.vue`, `StudySelectionPage.vue`

### Test (`features/test/`)

API testing pages for development.

- **Pages**: `ApiTestDashboard.vue`, `GamificationApiTestPage.vue`, `ProgressApiTestPage.vue`, `QuizResultsApiTestPage.vue`

---

## Routing

The application uses Vue Router with localized routes (EN/AR).

### Route Structure

```typescript
/:locale
  /                     # Home
  /login                # Login
  /register             # Register
  /verify-email         # Email verification
  /auth/callback        # OAuth callback
  /pricing              # Pricing page
  /pricing/modern       # Modern pricing page
  /checkout             # Checkout
  /payment/success      # Payment success
  /payment/error        # Payment error
  /dashboard            # Dashboard
  /account              # Account settings
  /subscription         # Subscription management
  /quiz                 # Quiz selection
  /quiz/:id             # Quiz page
  /study                # Study selection
  /study/:level         # Study mode
  /admin                # Admin dashboard
  /design-system        # Component showcase
  /terms                # Terms of service
  /privacy              # Privacy policy
```

### Navigation Guards

- **Authentication Guard**: Requires login for protected routes
- **Entitlement Guard**: Checks plan access for premium content
- **Role Guard**: Restricts admin routes
- **Redirect Guard**: Handles post-auth redirects

---

## Development Guide

### Prerequisites

```bash
node >= 18.x
pnpm >= 8.x
```

### Installation

```bash
cd client
pnpm install
```

### Development

```bash
pnpm dev           # Start dev server (http://localhost:5173)
pnpm dev:host      # Start with network access
```

### Building

```bash
pnpm build         # Production build
pnpm preview       # Preview production build
```

### Testing

```bash
pnpm test:unit     # Run unit tests (Vitest)
pnpm test:e2e      # Run e2e tests (Playwright)
pnpm test:ci       # Run all tests for CI
```

### Linting & Formatting

```bash
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix ESLint errors
pnpm format        # Format with Prettier
```

### Type Checking

```bash
pnpm typecheck     # TypeScript type checking
```

### Code Quality

- **ESLint**: Strict rules, no `eslint-disable` without justification
- **TypeScript**: Strict mode, no `any` or `unknown`
- **Prettier**: Enforced formatting
- **Component Limits**: Max 150 SLOC per component, complexity ≤ 8

### Styling Guidelines

- **Tailwind CSS**: Mobile-first, utility classes
- **Tokens**: Use CSS variables from `tokens.css`
- **RTL**: Logical properties for RTL support
- **Responsive**: Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

### i18n Guidelines

- **No hardcoded strings**: All text via i18n keys
- **File structure**: `i18n/locales/{en,ar}.json`
- **RTL support**: Automatic direction toggle
- **Pluralization**: Use i18n plural rules

### Performance Best Practices

- **Code splitting**: Route-based lazy loading
- **Tree shaking**: Import only what's needed
- **Image optimization**: WebP, lazy loading, dimensions
- **Bundle size**: Monitor with Vite bundle analyzer
- **Lighthouse**: Target A11y ≥ 95

---

## Support

For issues or questions, refer to:

- [Main README](/README.md)
- [Server Documentation](/docs/SERVER_DOCUMENTATION.md)
- [Contributing Guide](/CONTRIBUTING.md)

---

**Last Updated**: October 2025  
**Version**: 2.0.0
