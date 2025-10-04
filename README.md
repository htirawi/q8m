# q8m (cue-eight-em)

**Professional Vue 3 interview preparation platform with comprehensive question banks and advanced analytics**

منصة تحضير مهنية للمقابلات التقنية مبنية بـ Vue 3، تقدم بنوك أسئلة شاملة وأدوات تحليل متقدمة

[![CI](https://github.com/htirawi/q8m/actions/workflows/ci.yml/badge.svg)](https://github.com/htirawi/q8m/actions/workflows/ci.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg)](https://github.com/htirawi/q8m/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/htirawi/q8m.svg)](https://github.com/htirawi/q8m/commits/main)
[![Issues](https://img.shields.io/github/issues/htirawi/q8m.svg)](https://github.com/htirawi/q8m/issues)
[![PRs](https://img.shields.io/github/issues-pr/htirawi/q8m.svg)](https://github.com/htirawi/q8m/pulls)

## Overview

q8m is a bilingual (English/Arabic) interview preparation platform built with Vue 3, featuring comprehensive question banks across Angular, Vue.js, Next.js, and Redux frameworks. The platform offers tiered access with server-side entitlements, localized pricing in JOD/SAR/USD, and secure payment processing through PayPal and APS gateways.

### العربية | Arabic

منصة تحضير مهنية للمقابلات التقنية مبنية بـ Vue 3، تقدم بنوك أسئلة شاملة عبر أطر Angular و Vue.js و Next.js و Redux. المنصة توفر وصول متدرج مع صلاحيات من جانب الخادم، وأسعار محلية بالدينار الأردني والريال السعودي والدولار الأمريكي، ومعالجة دفع آمنة عبر PayPal و APS.

## Key Features

- **Multi-Framework Support**: 500+ questions across Angular, Vue.js, Next.js, Redux
- **Bilingual Interface**: Full English/Arabic support with RTL layout
- **Tiered Access**: Junior (free), Intermediate ($5), Senior ($5), Bundle ($8)
- **Localized Pricing**: Dynamic currency conversion (JOD/SAR/USD) with daily FX rates
- **Secure Payments**: PayPal + APS/HyperPay integration with webhooks
- **Mobile-First Design**: Responsive PWA with offline capabilities
- **Accessibility**: WCAG AA compliant with screen reader support
- **Performance**: Optimized Core Web Vitals (LCP < 2.5s, CLS < 0.1)

## Screenshots

<!-- TODO: Add actual screenshots -->

![Desktop Light Mode](docs/screenshots/desktop-light.png "q8m Desktop Interface - Light Mode")
![Desktop Dark Mode](docs/screenshots/desktop-dark.png "q8m Desktop Interface - Dark Mode")
![Mobile Interface](docs/screenshots/mobile.png "q8m Mobile Interface")
![Arabic RTL Layout](docs/screenshots/arabic-rtl.png "q8m Arabic RTL Layout")

## Architecture & Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vue 3)                          │
├─────────────────────────────────────────────────────────────────┤
│  Vue 3.4+ │ TypeScript │ Pinia │ Vue Router │ vue-i18n │ Vite  │
│  Tailwind CSS │ vee-validate │ Zod │ Vitest │ Playwright     │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTPS/WSS
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Fastify)                        │
├─────────────────────────────────────────────────────────────────┤
│  Fastify 4.24+ │ TypeScript │ MongoDB │ JWT │ OAuth │ Zod     │
│  PayPal │ APS │ HyperPay │ Rate Limiting │ CSRF │ CSP        │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Atlas │ PayPal │ APS Gateway │ HyperPay │ Google OAuth │
│  Facebook OAuth │ FX API │ Email Service │ Webhooks           │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**

- Vue 3.4+ (Composition API)
- TypeScript 5.6+ (strict mode)
- Vite 5.4+ (build tool)
- Pinia 2.1+ (state management)
- Vue Router 4.2+ (routing)
- vue-i18n 9.8+ (internationalization)
- Tailwind CSS 3.4+ (styling)
- vee-validate 4.11+ + Zod 3.22+ (validation)
- Vitest 2.1+ (testing)
- Playwright 1.40+ (E2E testing)

**Backend:**

- Fastify 4.24+ (web framework)
- TypeScript 5.6+ (strict mode)
- MongoDB Atlas + Mongoose 8.0+ (database)
- JWT + OAuth (Google/Facebook authentication)
- PayPal + APS/HyperPay (payments)
- Zod 3.22+ (validation)
- Rate limiting, CSRF, CSP (security)

## Project Structure

```
q8m/
├── client/                          # Vue 3 Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── features/                # Feature-based modules
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── pricing/             # Pricing & checkout
│   │   │   ├── quiz/                # Quiz interface
│   │   │   └── account/             # User account management
│   │   ├── stores/                  # Pinia stores
│   │   ├── composables/             # Vue composables
│   │   ├── router/                  # Vue Router configuration
│   │   ├── locales/                 # i18n translations (en.json, ar.json)
│   │   ├── styles/                  # Global styles & tokens
│   │   └── types/                   # TypeScript type definitions
│   ├── tests/                       # Test files
│   ├── package.json                 # Client dependencies
│   └── vite.config.ts               # Vite configuration
│
├── server/                          # Fastify Backend
│   ├── src/
│   │   ├── routes/                  # API route handlers
│   │   ├── services/                # Business logic services
│   │   ├── schemas/                 # Zod validation schemas
│   │   ├── middlewares/             # Fastify plugins/hooks
│   │   ├── models/                  # MongoDB models
│   │   └── utils/                   # Utility functions
│   ├── package.json                 # Server dependencies
│   └── tsconfig.json                # TypeScript configuration
│
├── shared/                          # Shared Types & Constants
│   ├── types/                       # Shared TypeScript types
│   ├── schemas/                     # Shared Zod schemas
│   └── constants/                    # Shared constants
│       ├── currencies.ts            # Currency definitions
│       ├── entitlements.ts          # Access tier definitions
│       └── locales.ts               # Locale configurations
│
├── docs/                           # Documentation
├── scripts/                        # Build & deployment scripts
├── docker-compose.yml              # Docker configuration
└── package.json                    # Root package configuration
```

## Install & Run

### Prerequisites

- **Node.js**: >= 18.0.0
- **PNPM**: >= 8.0.0 (recommended) or NPM
- **MongoDB**: Atlas cluster or local MongoDB instance

### Quick Start

```bash
# Clone repository
git clone https://github.com/htirawi/q8m.git
cd q8m

# Install dependencies
pnpm install

# Bootstrap both client and server
pnpm run bootstrap

# Set up environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env
# Configure your actual values in the .env files

# Seed database with sample data
cd server && pnpm run db:seed

# Start development servers
pnpm dev                    # Starts client on :5173
cd server && pnpm dev       # Starts server on :3000
```

### Common Scripts

| Command           | Description               | Location |
| ----------------- | ------------------------- | -------- |
| `pnpm dev`        | Start development server  | Client   |
| `pnpm build`      | Build for production      | Client   |
| `pnpm preview`    | Preview production build  | Client   |
| `pnpm test`       | Run unit tests            | Client   |
| `pnpm test:e2e`   | Run E2E tests             | Client   |
| `pnpm lint`       | Lint code                 | Both     |
| `pnpm type-check` | TypeScript type checking  | Both     |
| `pnpm validate`   | Run all validation checks | Both     |

## Environment Variables

q8m uses comprehensive environment configuration templates for both client and server. Copy the example files and configure with your actual values:

### Quick Setup

```bash
# Copy environment templates
cp client/.env.example client/.env
cp server/.env.example server/.env

# Generate secure secrets
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32  # For JWT_SECRET
openssl rand -hex 32                                # For CSRF_SECRET
```

### Configuration Files

- **[client/.env.example](client/.env.example)** - 25 VITE\_ prefixed variables for Vue 3 frontend
- **[server/.env.example](server/.env.example)** - 104 environment variables for Fastify backend

### Key Variables

**Client (Vue 3):**

- `VITE_CLIENT_URL` - Application URL (Required)
- `VITE_API_BASE_URL` - API endpoint (Required)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth (Required)
- `VITE_PAYPAL_CLIENT_ID` - PayPal integration (Required)
- `VITE_APS_MERCHANT_ID` - APS payment gateway (Required)

**Server (Fastify):**

- `NODE_ENV` - Environment (development|staging|production)
- `MONGODB_URI` - Database connection (Required)
- `JWT_SECRET` - Authentication secret (Required, 32+ chars)
- `GOOGLE_CLIENT_ID` - Google OAuth (Required)
- `PAYPAL_CLIENT_ID` - PayPal integration (Required)
- `SMTP_HOST` - Email service (Required)

### Provider Setup

**Payment Gateways:**

- **PayPal**: [Developer Console](https://developer.paypal.com/)
- **APS**: [Amazon Payment Services](https://paymentservices.amazon.com/)
- **HyperPay**: [HyperPay Portal](https://hyperpay.com/)

**OAuth Providers:**

- **Google**: [Google Cloud Console](https://console.developers.google.com/)
- **Facebook**: [Facebook Developers](https://developers.facebook.com/)

**Email Service:**

- **Gmail**: Use App Passwords (not regular password)
- **SendGrid**: API key-based authentication
- **Mailgun**: SMTP or API key

**Currency Exchange:**

- **ExchangeRate-API**: [Free tier available](https://exchangerate-api.com/)
- **Fixer.io**: [Paid service](https://fixer.io/)
- **CurrencyLayer**: [Free tier available](https://currencylayer.com/)

> **Security Note**: Never commit actual `.env` files with real secrets. Only `.env.example` templates are tracked in git.

## Usage

### Language & Localization

- **English**: Access via `/en` routes with LTR layout
- **Arabic**: Access via `/ar` routes with RTL layout
- **Language Toggle**: Available in navigation header
- **RTL Support**: Automatic layout direction switching

### Currency & Pricing

- **Auto-Detection**: Geographic location determines default currency
- **Manual Override**: Users can switch between USD/JOD/SAR
- **Real-Time Rates**: Daily FX rate updates with price snapshots
- **Localized Display**: Prices shown in user's preferred currency
- **Settlement Notes**: Shows "Estimated X / Billed in Y" if settlement differs

### Access Tiers

| Tier             | Price | Features                                        | Questions |
| ---------------- | ----- | ----------------------------------------------- | --------- |
| **Junior**       | Free  | Basic questions, progress tracking              | 100+      |
| **Intermediate** | $5    | Advanced questions, analytics, bookmarks        | 300+      |
| **Senior**       | $5    | Expert questions, mock interviews, custom plans | 500+      |
| **Bundle**       | $8    | Everything + lifetime access, mentorship        | Unlimited |

### Demo Flows

1. **Signup → Verify → Login**
   - Email/password registration
   - Email verification required
   - OAuth (Google/Facebook) support

2. **Payment Flow**
   - PayPal checkout with redirect
   - APS/HyperPay integration (Jordan/MENA region)
   - Webhook confirmation
   - Entitlement activation

3. **Account Management**
   - Subscription status on `/account`
   - Billing history
   - Plan upgrades/downgrades

## Security, A11y, SEO, Performance

### Security

- **CSP/HSTS/CSRF**: Comprehensive security headers
- **Rate Limiting**: API endpoint protection
- **Server-Side Gating**: Entitlement validation
- **PCI Compliance**: Payment data never stored locally
- **Session Security**: HttpOnly, Secure cookies (SameSite=Lax) stored in MongoDB
- **Webhook Security**: Idempotency and signature verification

### Accessibility (WCAG AA)

- **Screen Reader Support**: Proper ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets WCAG AA requirements
- **RTL Support**: Proper Arabic text direction
- **ARIA Live Regions**: Dynamic error announcements

### SEO

- **Multi-Language**: `/en` and `/ar` routes with hreflang
- **Meta Tags**: Canonical URLs, sitemap, robots.txt
- **Schema Markup**: Product/Offer structured data with multi-currency pricing
- **Performance**: Optimized Core Web Vitals

### Performance

- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1
- **Code Splitting**: Route-based dynamic imports
- **Image Optimization**: WebP support with lazy loading
- **Caching**: Service worker for offline functionality
- **Font Strategy**: Preconnect to font providers
- **Bundle Analysis**: Regular size monitoring

## Testing & CI

### Unit Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### E2E Testing

```bash
# Run Playwright tests
pnpm test:e2e

# Run specific test suite
pnpm test:e2e --grep "payment flow"
```

### Payment Testing

- **PayPal Sandbox**: Use sandbox credentials for testing
- **APS Testing**: Test environment with mock responses
- **HyperPay Testing**: Sandbox environment for Jordan/MENA
- **Webhook Testing**: Use ngrok for local webhook testing

### CI Pipeline

- **Linting**: ESLint + Prettier validation
- **Type Checking**: TypeScript strict mode
- **Unit Tests**: Vitest with coverage reporting
- **E2E Tests**: Playwright cross-browser testing
- **Security**: Dependency vulnerability scanning
- **Visual Regression**: <!-- TODO: workflow path -->
- **Lighthouse/Axe**: <!-- TODO: workflow path -->

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/your-feature`
3. **Make** changes following code style guidelines
4. **Run** validation: `pnpm validate`
5. **Commit** with conventional commits: `git commit -m "feat: add new feature"`
6. **Push** and create pull request

### Code Style

- **ESLint/Prettier**: Automated formatting
- **TypeScript Strict**: No `any` types allowed
- **Component Guidelines**: Small, focused, accessible components
- **i18n Rules**: All user-facing text must be translatable

### Pre-Push Validation

```bash
# Run all validation checks
pnpm pre-push

# Individual checks
pnpm lint
pnpm type-check
pnpm test
```

### Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Detailed contribution guidelines
- **[SECURITY.md](SECURITY.md)** - Security policy and reporting
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines

## Roadmap & Changelog

### Near-Term Milestones

- **Q1 2025**: Auth polish, email verification improvements
- **Q2 2025**: APS/HyperPay production deployment
- **Q3 2025**: Admin console for content management
- **Q4 2025**: Advanced analytics dashboard

### Changelog

- **[CHANGELOG.md](docs/changelog/CHANGELOG.md)** - Detailed version history
- **SemVer**: Semantic versioning for releases
- **Keep a Changelog**: Standard format compliance

## License & Credits

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Credits

- **Vue.js Team**: For the amazing Vue 3 framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Fastify**: For the high-performance web framework
- **MongoDB**: For the flexible document database
- **PayPal & APS**: For secure payment processing

### Trademarks

- Vue.js is a trademark of Evan You
- PayPal is a trademark of PayPal Holdings, Inc.
- All other trademarks are property of their respective owners

---

## العربية | Arabic

### الاستخدام

**اللغة والمحلية:**

- **الإنجليزية**: الوصول عبر مسارات `/en` مع تخطيط من اليسار لليمين
- **العربية**: الوصول عبر مسارات `/ar` مع تخطيط من اليمين لليسار
- **تبديل اللغة**: متاح في شريط التنقل
- **دعم RTL**: تبديل تلقائي لاتجاه التخطيط

**العملة والأسعار:**

- **الكشف التلقائي**: الموقع الجغرافي يحدد العملة الافتراضية
- **التجاوز اليدوي**: يمكن للمستخدمين التبديل بين USD/JOD/SAR
- **الأسعار الفورية**: تحديثات يومية لأسعار الصرف مع لقطات الأسعار
- **العرض المحلي**: الأسعار تظهر بعملة المستخدم المفضلة

### الميزات الأساسية

- **دعم متعدد الأطر**: 500+ سؤال عبر Angular و Vue.js و Next.js و Redux
- **واجهة ثنائية اللغة**: دعم كامل للإنجليزية والعربية مع تخطيط RTL
- **وصول متدرج**: مبتدئ (مجاني)، متوسط (5$)، متقدم (5$)، حزمة (8$)
- **أسعار محلية**: تحويل عملة ديناميكي (JOD/SAR/USD) مع أسعار صرف يومية
- **مدفوعات آمنة**: تكامل PayPal + APS/HyperPay مع webhooks
- **تصميم محمول أولاً**: PWA متجاوب مع قدرات غير متصلة
- **إمكانية الوصول**: متوافق مع WCAG AA مع دعم قارئ الشاشة
- **الأداء**: محسن Core Web Vitals (LCP < 2.5s، CLS < 0.1)

### التثبيت والتشغيل

```bash
# استنساخ المستودع
git clone https://github.com/htirawi/q8m.git
cd q8m

# تثبيت التبعيات
pnpm install

# بدء خوادم التطوير
pnpm dev                    # يبدأ العميل على :5173
cd server && pnpm dev       # يبدأ الخادم على :3000
```

---

**Built with ❤️ for the frontend developer community by [Hussein Tirawi](https://github.com/htirawi)**

## Topics

vue3, vite, fastify, mongodb, paypal, aps, hyperpay, payments, i18n, rtl, a11y, seo, multicurrency, pricing, education, tiers, entitlements, jordan, mena, typescript, pwa, interview-preparation, quiz-platform, frontend-development, technical-interviews
