# Server Documentation

> **Quiz Platform** - Backend API Reference and Architecture Guide  
> Fastify + TypeScript + MongoDB + JWT + PayPal/HyperPay/APS

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Routes](#api-routes)
4. [Models](#models)
5. [Services](#services)
6. [Middlewares](#middlewares)
7. [Security](#security)
8. [Development Guide](#development-guide)

---

## Overview

The Quiz Platform server is a high-performance REST API built with Fastify and TypeScript. It handles authentication, payment processing, question management, gamification, and user progress tracking with enterprise-grade security and rate limiting.

### Tech Stack

- **Framework**: Fastify (high-performance Node.js framework)
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OAuth2 (Google)
- **Payment Gateways**: PayPal Orders v2 API, HyperPay, APS (Amazon Payment Services)
- **Email**: Nodemailer with template support
- **Security**: Rate limiting, CSRF, input validation, XSS protection
- **Testing**: Jest + Supertest

---

## Architecture

### Directory Structure

```
server/src/
├── app.ts                    # Fastify app initialization
├── config/                   # Configuration files
│   ├── appConfig.ts          # App feature flags
│   ├── database.ts           # MongoDB connection
│   ├── env.ts                # Environment variables
│   └── test.env              # Test environment
├── controllers/              # Request handlers
│   └── paypal.controller.ts  # PayPal payment controller
├── lib/                      # Third-party integrations
│   ├── idempotency.ts        # Idempotency key handling
│   └── paypalClient.ts       # PayPal SDK client
├── middlewares/              # Fastify middlewares
├── migrations/               # Database migrations
├── models/                   # Mongoose models
├── plugins/                  # Fastify plugins
├── repositories/             # Data access layer
├── routes/                   # API route definitions
├── schemas/                  # Validation schemas
├── security/                 # Security utilities
├── services/                 # Business logic layer
├── tests/                    # Test suites
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions
```

### Design Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Middleware Chain**: Request processing pipeline
- **DTO Pattern**: Data transfer objects with validation
- **Factory Pattern**: Model and service instantiation

---

## API Routes

Base URL: `/api`

### Authentication (`/api/auth`)

#### POST `/auth/check-email`

Check if email exists in the system.

**Rate Limit**: 30 requests / 15 minutes  
**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "exists": true
}
```

---

#### POST `/auth/register`

Register a new user account.

**Rate Limit**: 20 requests / 15 minutes  
**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecureP@ssw0rd",
  "confirmPassword": "SecureP@ssw0rd",
  "acceptTerms": true
}
```

**Response** (201):

```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "isEmailVerified": false
  }
}
```

---

#### POST `/auth/login`

Login with email and password.

**Rate Limit**: 20 requests / 15 minutes  
**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

**Response**:

```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "entitlements": ["JUNIOR"],
    "isEmailVerified": true
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

**Cookies Set**:

- `accessToken` (httpOnly, 15 min)
- `refreshToken` (httpOnly, 7 days)

---

#### GET `/auth/verify-email/:token`

Email verification entry point (user clicks link from email).

**Rate Limit**: 15 requests / 15 minutes  
**Authentication**: None

**Behavior**: Sets secure session cookie and redirects to `/verify-email` on client.

---

#### POST `/auth/verify-email-complete`

Complete email verification using session cookie.

**Rate Limit**: 15 requests / 15 minutes  
**Authentication**: Session cookie

**Response**:

```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "isEmailVerified": true
  }
}
```

---

#### POST `/auth/resend-verification`

Resend verification email.

**Rate Limit**: 5 requests / 15 minutes  
**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

---

#### POST `/auth/forgot-password`

Request password reset email.

**Rate Limit**: 10 requests / 15 minutes  
**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

---

#### POST `/auth/reset-password`

Reset password with token from email.

**Rate Limit**: 10 requests / 15 minutes  
**Authentication**: None

**Request Body**:

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecureP@ssw0rd"
}
```

---

#### POST `/auth/change-password`

Change password (authenticated user).

**Rate Limit**: 10 requests / 15 minutes  
**Authentication**: Required

**Request Body**:

```json
{
  "currentPassword": "OldP@ssw0rd",
  "newPassword": "NewSecureP@ssw0rd"
}
```

---

#### GET `/auth/me`

Get current authenticated user.

**Rate Limit**: 100 requests / 15 minutes  
**Authentication**: Required

**Response**:

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "entitlements": ["JUNIOR", "INTERMEDIATE"],
    "isEmailVerified": true,
    "lastLogin": "2025-10-15T10:30:00.000Z"
  }
}
```

---

#### POST `/auth/logout`

Logout current session.

**Rate Limit**: 20 requests / 15 minutes  
**Authentication**: Required

**Response**:

```json
{
  "message": "Logged out successfully"
}
```

---

#### POST `/auth/logout-all`

Logout from all devices/sessions.

**Rate Limit**: 10 requests / 15 minutes  
**Authentication**: Required

---

#### POST `/auth/refresh`

Refresh access token using refresh token (supports both body and cookie).

**Rate Limit**: 100 requests / 15 minutes  
**Authentication**: Refresh token (cookie or body)

**Request Body** (optional if cookie present):

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response**:

```json
{
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_access_token"
}
```

---

#### GET `/auth/google/callback`

Google OAuth callback endpoint.

**Authentication**: OAuth2 flow

**Behavior**: Handles OAuth callback, creates/links user account, sets cookies, redirects to client.

---

### Questions (`/api/questions`)

#### GET `/questions`

Get questions with filters and pagination.

**Authentication**: None

**Query Parameters**:

- `framework`: `angular` | `react` | `vue` | `nextjs` | `redux` | `random`
- `level`: `junior` | `intermediate` | `senior`
- `category`: string
- `difficulty`: `easy` | `medium` | `hard`
- `limit`: number (default: 10)
- `offset`: number (default: 0)

**Response**:

```json
{
  "questions": [
    {
      "_id": "question_id",
      "id": "q_123",
      "type": "multiple-choice",
      "content": {
        "en": {
          "question": "What is Vue 3 Composition API?",
          "options": [...],
          "explanation": "..."
        },
        "ar": {...}
      },
      "difficulty": "medium",
      "level": "intermediate",
      "framework": "vue",
      "category": "fundamentals",
      "tags": ["composition-api", "vue3"],
      "points": 10
    }
  ],
  "total": 500,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

---

#### GET `/questions/:questionId`

Get single question by ID.

**Authentication**: None

---

#### GET `/questions/categories/:framework`

Get question categories for a framework.

**Authentication**: None

---

#### GET `/questions/stats/:framework`

Get question statistics for a framework.

**Authentication**: Required

**Response**:

```json
{
  "total": 500,
  "byLevel": {
    "junior": 200,
    "intermediate": 200,
    "senior": 100
  },
  "byDifficulty": {
    "easy": 200,
    "medium": 200,
    "hard": 100
  },
  "byCategory": {
    "fundamentals": 150,
    "advanced": 100,
    ...
  }
}
```

---

#### GET `/questions/quiz/questions`

Get questions for quiz mode by level.

**Authentication**: Required

**Query Parameters**:

- `level`: `junior` | `intermediate` | `senior` (required)
- `limit`: number (1-50, default: 10)
- `framework`: string (optional)

**Response**:

```json
{
  "questions": [...],
  "total": 50,
  "hasMore": true
}
```

---

#### POST `/questions/submit`

Submit answer for a question.

**Authentication**: Required

**Request Body**:

```json
{
  "questionId": "question_id",
  "answer": "option_id" | ["option_1", "option_2"],
  "timeSpent": 45
}
```

**Response**:

```json
{
  "correct": true,
  "score": 1,
  "explanation": "Your answer is correct!"
}
```

---

#### GET `/questions/history`

Get user's quiz history.

**Authentication**: Required

---

### Progress (`/api/progress`)

#### GET `/progress`

Get user progress summary.

**Authentication**: Required

**Response**:

```json
{
  "progress": {
    "xp": 1250,
    "level": 5,
    "streaks": {
      "currentStreak": 7,
      "longestStreak": 15,
      "lastActivityDate": "2025-10-15"
    },
    "masteryStats": {
      "totalQuestions": 150,
      "mastered": 45,
      "familiar": 60,
      "learning": 30,
      "new": 15,
      "accuracy": 0.82,
      "dueForReview": 12,
      "overdueReviews": 3
    }
  }
}
```

---

#### POST `/progress/question/:questionId`

Update progress for a specific question.

**Authentication**: Required

**Request Body**:

```json
{
  "isCorrect": true,
  "timeSpentSeconds": 45,
  "difficulty": "medium"
}
```

**Response**:

```json
{
  "success": true,
  "xpEarned": 15,
  "newMasteryLevel": "familiar",
  "nextReviewDate": "2025-10-18T10:00:00.000Z",
  "badgesEarned": ["first_correct"],
  "leveledUp": false
}
```

---

#### GET `/progress/next-question`

Get next question using adaptive algorithm.

**Authentication**: Required

**Query Parameters**:

- `difficulty`: `easy` | `medium` | `hard` (optional)
- `category`: string (optional)
- `count`: number (1-50, default: 1)

**Response**:

```json
{
  "questions": [...],
  "count": 1
}
```

---

#### POST `/progress/session/complete`

Complete study session and calculate rewards.

**Authentication**: Required

**Request Body**:

```json
{
  "questionsCompleted": 20,
  "correctAnswers": 16,
  "sessionDurationMinutes": 45,
  "startTime": "2025-10-15T10:00:00.000Z",
  "endTime": "2025-10-15T10:45:00.000Z"
}
```

**Response**:

```json
{
  "success": true,
  "xpEarned": 180,
  "breakdown": {
    "baseXP": 100,
    "accuracyBonus": 50,
    "streakBonus": 30
  },
  "leveledUp": true,
  "newLevel": 6,
  "badgesEarned": ["study_master"],
  "streakMaintained": true,
  "currentStreak": 8
}
```

---

#### GET `/progress/stats`

Get detailed study statistics.

**Authentication**: Required

**Response**:

```json
{
  "stats": {
    "xp": 1250,
    "level": 5,
    "totalStudyTimeMinutes": 1200,
    "totalQuestionsAttempted": 350,
    "totalQuestionsCorrect": 287,
    "overallAccuracy": 82,
    "totalStudySessions": 45,
    "averageSessionDurationMinutes": 26.7,
    "masteryStats": {...},
    "difficultyProgress": {...},
    "streaks": {...},
    "badges": [...]
  }
}
```

---

### Gamification (`/api/gamification`)

#### GET `/gamification/badges`

Get all badges with user progress.

**Authentication**: Required

**Query Parameters**:

- `category`: `study` | `quiz` | `streak` | `social` | `milestone` (optional)
- `rarity`: `common` | `rare` | `epic` | `legendary` (optional)

**Response**:

```json
{
  "badges": [
    {
      "id": "badge_id",
      "name": "First Steps",
      "description": "Complete your first question",
      "icon": "🎯",
      "category": "milestone",
      "rarity": "common",
      "earned": true,
      "earnedAt": "2025-10-01T10:00:00.000Z",
      "progress": {
        "current": 1,
        "target": 1
      }
    }
  ],
  "totalBadges": 50,
  "earnedCount": 12
}
```

---

#### GET `/gamification/badges/earned`

Get badges earned by current user.

**Authentication**: Required

---

#### GET `/gamification/badges/secret`

Get secret badges unlocked by user.

**Authentication**: Required

---

#### GET `/gamification/leaderboard/:type`

Get leaderboard rankings.

**Authentication**: Optional

**Path Parameters**:

- `type`: `weekly` | `monthly` | `all_time`

**Query Parameters**:

- `scope`: `global` | `plan_tier` (default: global)
- `planTier`: `free` | `intermediate` | `advanced` | `pro` (optional)

**Response**:

```json
{
  "leaderboard": {
    "type": "weekly",
    "scope": "global",
    "entries": [
      {
        "rank": 1,
        "userId": "user_id",
        "displayName": "John D.",
        "xp": 2500,
        "level": 8,
        "badge": "🏆"
      }
    ],
    "periodStart": "2025-10-08",
    "periodEnd": "2025-10-15"
  },
  "userRank": {
    "rank": 42,
    "percentile": 85
  }
}
```

---

#### GET `/gamification/leaderboard/:type/rank`

Get current user leaderboard rank.

**Authentication**: Required

---

#### GET `/gamification/xp`

Get XP and level information.

**Authentication**: Required

**Response**:

```json
{
  "xp": 1250,
  "level": 5,
  "levelTitle": "Intermediate Learner",
  "xpToNextLevel": 250,
  "levelProgress": 83.3
}
```

---

#### GET `/gamification/summary`

Get complete gamification summary.

**Authentication**: Required

---

#### GET `/gamification/streak`

Get streak information.

**Authentication**: Required

---

### Payments (`/api/payments`)

#### GET `/payments/pricing`

Get pricing information for all plans.

**Authentication**: Optional

**Query Parameters**:

- `currency`: `USD` | `JOD` | `SAR` (optional)

**Response**:

```json
{
  "success": true,
  "currency": "USD",
  "pricing": [
    {
      "planType": "INTERMEDIATE",
      "name": "Intermediate",
      "pricing": {
        "USD": {
          "monthly": 19.99,
          "yearly": 199.99,
          "currency": "USD",
          "isEstimated": false
        }
      },
      "features": [...]
    }
  ]
}
```

---

#### GET `/payments/pricing/:currency`

Get pricing for specific currency.

**Authentication**: Optional

---

#### POST `/payments/create`

Create payment for plan (legacy - use PayPal routes for Orders v2).

**Authentication**: Required

**Request Body**:

```json
{
  "planType": "INTERMEDIATE",
  "currency": "USD",
  "billingCycle": "monthly",
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

---

#### POST `/payments/callback/:gateway`

Handle payment success callback (legacy).

**Authentication**: None

---

#### GET `/payments/history`

Get user's purchase history.

**Authentication**: Required

**Query Parameters**:

- `limit`: number (default: 10)
- `skip`: number (default: 0)

**Response**:

```json
{
  "success": true,
  "purchases": [
    {
      "id": "purchase_id",
      "planType": "INTERMEDIATE",
      "amount": { "value": "19.99", "currency": "USD" },
      "status": "completed",
      "gateway": "paypal",
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "skip": 0,
    "hasMore": false
  }
}
```

---

#### GET `/payments/subscription`

Get user's current subscription.

**Authentication**: Required

---

#### POST `/payments/subscription/cancel`

Cancel subscription.

**Authentication**: Required

**Request Body**:

```json
{
  "reason": "user_request"
}
```

---

#### POST `/payments/webhooks/aps`

APS webhook endpoint.

**Authentication**: Webhook signature

---

#### POST `/payments/webhooks/hyperpay`

HyperPay webhook endpoint.

**Authentication**: Webhook signature

---

#### GET `/payments/gateways/status`

Get payment gateway configuration status.

**Authentication**: None

---

#### GET `/payments/currencies/rates`

Get currency exchange rates and health.

**Authentication**: None

---

#### POST `/payments/refund/:purchaseId`

Process refund (admin or owner only).

**Authentication**: Required

---

### PayPal (`/api/payments/paypal`)

#### POST `/payments/paypal/create-order`

Create PayPal order (Orders v2 API).

**Rate Limit**: 20 requests / 15 minutes  
**Authentication**: Required

**Request Body**:

```json
{
  "planType": "INTERMEDIATE",
  "currency": "USD",
  "billingCycle": "monthly"
}
```

**Response**:

```json
{
  "success": true,
  "orderID": "paypal_order_id"
}
```

---

#### POST `/payments/paypal/capture-order`

Capture PayPal order after user approval.

**Rate Limit**: 30 requests / 15 minutes  
**Authentication**: Required

**Request Body**:

```json
{
  "orderID": "paypal_order_id"
}
```

**Response**:

```json
{
  "success": true,
  "status": "COMPLETED",
  "captureID": "capture_id",
  "payerEmail": "buyer@example.com"
}
```

---

#### POST `/payments/paypal/webhook`

PayPal webhook endpoint for payment events.

**Rate Limit**: 100 requests / 15 minutes  
**Authentication**: Webhook signature verification

---

### Admin (`/api/admin`)

All admin routes require `admin` role.

#### GET `/admin/dashboard`

Get admin dashboard statistics.

**Authentication**: Required (admin)

---

#### GET `/admin/users`

Get all users with pagination.

**Authentication**: Required (admin)

**Query Parameters**:

- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `search`: string (optional)
- `role`: `user` | `admin` (optional)

---

#### GET `/admin/users/:userId`

Get user by ID.

**Authentication**: Required (admin)

---

#### PATCH `/admin/users/:userId/role`

Update user role.

**Authentication**: Required (admin)

**Request Body**:

```json
{
  "role": "admin"
}
```

---

#### PATCH `/admin/users/:userId`

Update user (general fields).

**Authentication**: Required (admin)

**Request Body**:

```json
{
  "displayName": "John Doe Updated",
  "isActive": true,
  "isEmailVerified": true,
  "entitlements": ["JUNIOR", "INTERMEDIATE"]
}
```

---

#### GET `/admin/questions`

Get all questions (admin view).

**Authentication**: Required (admin)

---

#### POST `/admin/questions`

Create new question.

**Authentication**: Required (admin)

---

#### PATCH `/admin/questions/:questionId`

Update question.

**Authentication**: Required (admin)

---

#### DELETE `/admin/questions/:questionId`

Delete question.

**Authentication**: Required (admin)

---

#### GET `/admin/analytics/payments`

Get payment analytics.

**Authentication**: Required (admin)

**Query Parameters**:

- `period`: `day` | `week` | `month` | `year` (default: month)

---

#### GET `/admin/analytics/users`

Get user analytics.

**Authentication**: Required (admin)

---

### Entitlements (`/api/entitlements`)

#### GET `/entitlements`

Get user entitlements and access levels.

**Authentication**: Required

---

### Plans (`/api/plans`)

#### GET `/plans`

Get available subscription plans.

**Authentication**: Optional

---

### Pricing (`/api/pricing`)

#### GET `/pricing`

Get pricing information (alias to `/api/payments/pricing`).

**Authentication**: Optional

---

### Quiz Results (`/api/quiz-results`)

#### POST `/quiz-results`

Submit quiz results.

**Authentication**: Required

---

#### GET `/quiz-results`

Get user's quiz results history.

**Authentication**: Required

---

### Coupons (`/api/coupons`)

#### POST `/coupons/validate`

Validate coupon code.

**Authentication**: Required

---

### SEO (`/api/seo`)

#### GET `/seo/metadata/:page`

Get SEO metadata for a page.

**Authentication**: None

---

### Checkout (`/api/checkout`)

#### POST `/checkout/start`

Start checkout session.

**Authentication**: Required

---

#### POST `/checkout/complete`

Complete checkout.

**Authentication**: Required

---

## Models

### User (`models/User.ts`)

User account model.

**Fields**:

- `email`: string (unique, indexed)
- `name`: string
- `password`: string (hashed with bcrypt, select: false)
- `role`: `user` | `admin`
- `entitlements`: string[] (plan access levels)
- `permissions`: string[]
- `isEmailVerified`: boolean
- `isLocked`: boolean
- `loginAttempts`: number
- `lockUntil`: Date
- `lastLogin`: Date
- `googleId`: string (OAuth)
- `acceptTerms`: boolean
- `acceptTermsAt`: Date
- `acceptTermsVersion`: string
- `createdAt`: Date
- `updatedAt`: Date

**Methods**:

- `comparePassword(password)` - Compare password with hash
- `incLoginAttempts()` - Increment failed login attempts
- `resetLoginAttempts()` - Reset login attempts counter
- `findByEmailWithPassword(email)` - Find user with password field

---

### Session (`models/Session.ts`)

User session model for JWT refresh tokens.

**Fields**:

- `userId`: ObjectId (ref: User)
- `refreshToken`: string (indexed)
- `accessToken`: string
- `expiresAt`: Date
- `userAgent`: string
- `ipAddress`: string
- `isActive`: boolean
- `isRevoked`: boolean
- `revokedAt`: Date
- `revokedReason`: string
- `lastUsed`: Date

**Methods**:

- `isValid()` - Check if session is valid and not expired

---

### Question (`models/Question.ts`)

Question model for quizzes and study.

**Fields**:

- `id`: string (unique identifier)
- `type`: `multiple-choice` | `fill-blank` | `true-false` | `multiple-checkbox`
- `content`: { en: {...}, ar: {...} } (i18n content)
- `difficulty`: `easy` | `medium` | `hard`
- `level`: `junior` | `intermediate` | `senior`
- `framework`: `angular` | `react` | `vue` | `nextjs` | `redux`
- `category`: string
- `tags`: string[]
- `points`: number
- `isActive`: boolean
- `createdAt`: Date
- `updatedAt`: Date

**Static Methods**:

- `findWithFilters(filters)` - Find questions with filters and pagination

---

### UserProgress (`models/UserProgress.ts`)

User progress tracking model.

**Fields**:

- `userId`: ObjectId (ref: User, unique)
- `xp`: number
- `level`: number
- `questions`: Map<questionId, QuestionProgress>
- `totalQuestionsAttempted`: number
- `totalQuestionsCorrect`: number
- `totalStudySessions`: number
- `totalStudyTimeMinutes`: number
- `averageSessionDurationMinutes`: number
- `streaks`: { currentStreak, longestStreak, lastActivityDate, ... }
- `badges`: { badgeId, earnedAt }[]
- `difficultyProgress`: { easy, medium, hard }
- `lastSessionStart`: Date
- `lastSessionEnd`: Date

**Methods**:

- `getMasteryStats()` - Get mastery statistics
- `findOrCreate(userId)` - Find or create progress

---

### Purchase (`models/Purchase.ts`)

Purchase history model.

**Fields**:

- `userId`: ObjectId (ref: User)
- `planType`: string
- `amount`: { value, currency }
- `status`: string
- `gateway`: `paypal` | `hyperpay` | `aps`
- `gatewayOrderId`: string
- `gatewayPaymentId`: string
- `metadata`: object
- `createdAt`: Date
- `updatedAt`: Date

**Static Methods**:

- `getUserPurchases(userId, limit, skip)` - Get user purchase history

---

### Subscription (`models/Subscription.ts`)

Active subscription model.

**Fields**:

- `userId`: ObjectId (ref: User, unique)
- `planType`: string
- `status`: `active` | `cancelled` | `expired`
- `startDate`: Date
- `endDate`: Date
- `renewalDate`: Date
- `billingCycle`: `monthly` | `yearly`
- `gateway`: string
- `gatewaySubscriptionId`: string
- `cancelledAt`: Date
- `cancelReason`: string

**Methods**:

- `cancel(reason)` - Cancel subscription

**Static Methods**:

- `findActiveForUser(userId)` - Find active subscription

---

### Badge (`models/Badge.ts`)

Badge definitions.

**Fields**:

- `name`: string
- `description`: string
- `icon`: string
- `category`: `study` | `quiz` | `streak` | `social` | `milestone`
- `rarity`: `common` | `rare` | `epic` | `legendary`
- `criteria`: object
- `isSecret`: boolean
- `xpReward`: number

---

### Leaderboard (`models/Leaderboard.ts`)

Leaderboard rankings.

**Fields**:

- `type`: `weekly` | `monthly` | `all_time`
- `scope`: `global` | `plan_tier`
- `planTier`: string
- `entries`: { userId, xp, rank }[]
- `periodStart`: Date
- `periodEnd`: Date

**Static Methods**:

- `getCurrent(type, options)` - Get current leaderboard
- `getUserRank(type, userId, options)` - Get user rank

---

### QuizResult (`models/QuizResult.ts`)

Quiz attempt results.

**Fields**:

- `userId`: ObjectId (ref: User)
- `questionIds`: ObjectId[]
- `score`: number
- `totalQuestions`: number
- `timeSpent`: number
- `completedAt`: Date

---

### VerificationToken (`models/VerificationToken.ts`)

Email verification and password reset tokens.

**Fields**:

- `userId`: ObjectId (ref: User)
- `token`: string (indexed)
- `type`: `email_verification` | `password_reset`
- `expiresAt`: Date
- `usedAt`: Date
- `usedBy`: { ip, userAgent }
- `createdAt`: Date

**Static Methods**:

- `createToken(userId, type, hoursValid)` - Create verification token
- `verifyToken(token, type)` - Verify and return token
- `markAsUsed(token)` - Mark token as used

---

### Coupon (`models/Coupon.ts`)

Discount coupon codes.

**Fields**:

- `code`: string (unique)
- `type`: `percentage` | `fixed`
- `value`: number
- `maxUses`: number
- `usedCount`: number
- `validFrom`: Date
- `validUntil`: Date
- `isActive`: boolean

---

### WebhookEvent (`models/WebhookEvent.ts`)

Webhook event log.

**Fields**:

- `gateway`: string
- `eventType`: string
- `eventId`: string (unique)
- `payload`: object
- `processed`: boolean
- `processedAt`: Date
- `error`: string

---

### FxRate (`models/FxRate.ts`)

Currency exchange rates.

**Fields**:

- `baseCurrency`: string
- `targetCurrency`: string
- `rate`: number
- `source`: string
- `validAt`: Date

---

## Services

### Authentication Services

#### `jwt.service.ts`

JWT token generation and verification.

- `generateTokenPair(user, sessionId)` - Generate access/refresh token pair
- `verifyAccessToken(token)` - Verify access token
- `verifyRefreshToken(token)` - Verify refresh token

#### `auth/authorization.service.ts`

Authorization and permission checks.

#### `auth/session-validation.service.ts`

Session validation logic.

#### `auth/token-verification.service.ts`

Token verification utilities.

---

### Payment Services

#### `paypal.service.ts`

PayPal integration (legacy).

#### `paypal/paypal-order.service.ts`

PayPal Orders v2 API service.

- `createOrder(orderData)` - Create PayPal order
- `captureOrder(orderId)` - Capture order payment

#### `paypal/paypal-subscription.service.ts`

PayPal subscription management.

#### `paypal/paypal-webhook.service.ts`

PayPal webhook handling.

- `verifyWebhookSignature(headers, body)` - Verify webhook signature
- `handleWebhookEvent(event)` - Process webhook event

#### `hyperpay.service.ts`

HyperPay payment gateway integration.

- `createPayment(paymentData)` - Create payment
- `verifyPayment(paymentId)` - Verify payment status
- `processRefund(paymentId, amount, reason)` - Process refund
- `handleWebhook(webhookData)` - Handle webhook

#### `aps.service.ts`

Amazon Payment Services (APS) integration.

- `createPayment(paymentData)` - Create payment
- `verifyPayment(paymentId)` - Verify payment
- `processRefund(paymentId, amount, reason)` - Process refund
- `handleWebhook(webhookData)` - Handle webhook

#### `pricing.service.ts`

Pricing and plan management.

- `getAllPricing()` - Get all plan pricing
- `getPricingForCurrency(currency)` - Get pricing for currency
- `getPlanPricing(planType, currency)` - Get specific plan pricing

#### `currency.service.ts`

Currency conversion and exchange rates.

- `convertCurrency(amount, from, to)` - Convert currency
- `getExchangeRate(from, to)` - Get exchange rate
- `getCurrencyHealth()` - Get currency service health

---

### Email Services

#### `email.service.ts`

Email sending service.

- `sendEmailVerification(email, name, url)` - Send verification email
- `sendWelcomeEmail(email, name)` - Send welcome email
- `sendPasswordReset(email, name, url)` - Send password reset email
- `sendPaymentReceipt(email, orderDetails)` - Send payment receipt

#### `email-logger.service.ts`

Email logging for development.

---

### Security Services

#### `secure-cookie.service.ts`

Secure cookie handling.

- `setSecureCookie(reply, name, value, options)` - Set secure httpOnly cookie

#### `signed-url.service.ts`

Signed URL generation for secure resources.

#### `webhook-verification.service.ts`

Webhook signature verification.

#### `input-validation.service.ts`

Input sanitization and validation.

---

### Entitlement Services

#### `entitlement.service.ts`

User entitlement checks.

- `hasEntitlement(user, entitlement)` - Check entitlement
- `canAccessLevel(user, level)` - Check level access

---

## Middlewares

### `auth.middleware.ts`

Authentication middleware.

- `authenticate` - Require valid JWT access token
- `optionalAuth` - Optional authentication (doesn't fail if not authenticated)

**Usage**:

```typescript
fastify.get(
  "/protected",
  {
    preHandler: [authenticate],
  },
  handler
);
```

---

### `auth-rate-limit.middleware.ts`

Enhanced rate limiting for auth endpoints.

---

### `entitlement.middleware.ts`

Entitlement checking middleware.

- `requireEntitlement(entitlement)` - Require specific entitlement

**Usage**:

```typescript
fastify.get(
  "/premium",
  {
    preHandler: [authenticate, requireEntitlement("SENIOR")],
  },
  handler
);
```

---

### `rate-limit.middleware.ts`

Global rate limiting configuration.

---

### `error.middleware.ts`

Global error handler.

**Features**:

- Sanitizes errors for production
- Logs errors with stack traces
- Returns user-friendly error messages
- Handles validation errors

---

### `logger.middleware.ts`

Request/response logging.

---

### `csrf.middleware.ts`

CSRF protection.

---

## Security

### Rate Limiting

All routes are rate-limited to prevent abuse:

- **Auth routes**: 5-30 requests / 15 minutes
- **Payment routes**: 20-100 requests / 15 minutes
- **API routes**: 100-200 requests / 15 minutes

**Rate limit key generators**:

- `ipKey` - IP address only
- `comboKey` - User ID + IP address
- Custom per-route

---

### Input Validation

All input is validated using Zod schemas before processing.

**Example**:

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

---

### XSS Protection

- Input sanitization via `security/escape.ts`
- Content-Type headers enforced
- HTML escaping for user-generated content

---

### SQL/NoSQL Injection Prevention

- Mongoose parameterized queries
- No dynamic query building
- Input validation and type checking

---

### CSRF Protection

- CSRF tokens for state-changing requests
- SameSite cookies
- Origin validation

---

### Password Security

- bcrypt hashing with salt rounds
- Password strength requirements
- Login attempt limiting
- Account lockout after failed attempts

---

### JWT Security

- Short-lived access tokens (15 min)
- Refresh token rotation
- Session invalidation on password change
- httpOnly cookies (prevents XSS)

---

### Webhook Security

- Signature verification for all webhooks
- Replay attack prevention
- IP whitelisting (optional)
- Event idempotency

---

## Development Guide

### Prerequisites

```bash
node >= 18.x
pnpm >= 8.x
mongodb >= 5.x
```

### Installation

```bash
cd server
pnpm install
```

### Environment Variables

Create `.env` file:

```env
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/quiz-platform

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# Email (optional for dev)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_FROM=noreply@quizplatform.com

# Currency API (optional)
CURRENCY_API_KEY=your_currency_api_key
```

---

### Development

```bash
pnpm dev          # Start dev server with hot reload
pnpm dev:watch    # Start with nodemon
```

---

### Building

```bash
pnpm build        # Compile TypeScript
pnpm start        # Start production server
```

---

### Testing

```bash
pnpm test         # Run all tests
pnpm test:unit    # Run unit tests only
pnpm test:watch   # Watch mode
pnpm test:coverage # Coverage report
```

---

### Database

```bash
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:reset     # Reset database (dev only)
```

---

### Linting & Formatting

```bash
pnpm lint         # ESLint
pnpm lint:fix     # Fix lint errors
pnpm format       # Prettier
```

---

### Type Checking

```bash
pnpm typecheck    # TypeScript type check
```

---

### API Documentation

Swagger/OpenAPI docs available at `/documentation` when running the server.

---

### Debugging

Use VS Code launch configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["dev"],
  "console": "integratedTerminal"
}
```

---

### Code Quality Standards

- **TypeScript**: Strict mode, no `any`
- **ESLint**: Strict rules
- **Test Coverage**: Minimum 80%
- **Complexity**: Max cyclomatic complexity of 8
- **Function Length**: Max 50 lines
- **File Length**: Max 300 lines

---

## Support

For issues or questions, refer to:

- [Main README](/README.md)
- [Client Documentation](/docs/CLIENT_DOCUMENTATION.md)
- [Contributing Guide](/CONTRIBUTING.md)

---

**Last Updated**: October 2025  
**Version**: 2.0.0
