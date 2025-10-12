# CodeQL Configuration

This directory contains CodeQL configuration for security scanning of the Q8M platform.

## Configuration File

**`codeql-config.yml`** - Main CodeQL configuration file

## Suppressed Queries

### `js/missing-rate-limiting`

**Status**: Suppressed (False Positive)

**Reason**: CodeQL's static analysis cannot detect Fastify's plugin-based rate limiting configuration.

**Actual Implementation**: All authentication endpoints are properly rate-limited using `@fastify/rate-limit` plugin configured at the route level.

#### Rate Limits in Place:

| Endpoint               | Rate Limit           | Protection Against   |
| ---------------------- | -------------------- | -------------------- |
| `/check-email`         | 30 requests / 15 min | Account enumeration  |
| `/register`            | 20 requests / 15 min | Spam registrations   |
| `/login`               | 20 requests / 15 min | Brute force attacks  |
| `/resend-verification` | 5 requests / 15 min  | Email flooding       |
| `/forgot-password`     | 10 requests / 15 min | Password reset abuse |

#### Implementation Details:

Rate limiting is configured in `server/src/routes/auth.ts` using the Fastify route configuration:

```typescript
fastify.post(
  "/endpoint",
  {
    rateLimit: {
      max: 20,
      timeWindow: "15m",
      hook: "onRequest",
      keyGenerator: comboKey,
    },
    // ... other config
  },
  async (request, reply) => {
    // Handler with database queries
  }
);
```

The `@fastify/rate-limit` plugin is registered globally in `server/src/app.ts` and applies route-level limits before any request handlers execute.

#### Why CodeQL Can't Detect It:

1. **Plugin Architecture**: Fastify uses plugins that register hooks at runtime
2. **Static Analysis Limitation**: CodeQL analyzes code statically and cannot trace plugin registration and hook execution
3. **Configuration-Based**: Rate limiting is configured declaratively, not imperatively in the handler

#### Manual Verification:

Rate limiting has been manually verified and tested:

- Unit tests in `server/tests/` cover rate limiting behavior
- Integration tests confirm limits are enforced
- Load testing validates protection under high request volume

#### Decision:

This is a **known false positive**. Rate limiting is properly implemented and actively protecting the application. The suppression is documented and reviewed regularly.

## Maintenance

- **Review Frequency**: Quarterly
- **Last Reviewed**: October 2025
- **Next Review**: January 2026
- **Reviewed By**: Development Team

## References

- [Fastify Rate Limit Plugin](https://github.com/fastify/fastify-rate-limit)
- [OWASP API Security - Rate Limiting](https://owasp.org/www-project-api-security/)
- [CodeQL JavaScript Queries](https://github.com/github/codeql/tree/main/javascript/ql/src)
