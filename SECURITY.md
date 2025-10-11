# Security Policy

## Reporting Security Issues

The q8m team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### Reporting Process

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, please report security issues by emailing:

**security@q8m.com**

Include the following information:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Status Update:** Every 7 days until resolved
- **Resolution:** Based on severity (see below)

### Severity Levels

| Severity     | Response Time | Examples                                               |
| ------------ | ------------- | ------------------------------------------------------ |
| **Critical** | 24-48 hours   | Authentication bypass, payment fraud, RCE              |
| **High**     | 3-5 days      | XSS, CSRF, SQL injection, sensitive data exposure      |
| **Medium**   | 7-14 days     | Information disclosure, minor access control issues    |
| **Low**      | 30 days       | Non-exploitable issues, security hardening suggestions |

---

## Responsible Disclosure

We follow coordinated disclosure principles:

1. Report the issue privately to our security team
2. Give us reasonable time to fix the vulnerability
3. Avoid exploiting the vulnerability or accessing user data
4. Do not publicly disclose until we've issued a fix

### Bounty Program

We currently do not offer a formal bug bounty program, but we:

- Acknowledge security researchers in our security advisories
- Provide public credit (with your permission)
- May offer rewards for critical findings on a case-by-case basis

---

## Supported Versions

| Version         | Supported | Notes              |
| --------------- | --------- | ------------------ |
| 2.0.x (current) | ✅ Yes    | Active development |
| 1.x             | ❌ No     | End of life        |

---

## Security Features

### Authentication & Authorization

- **Password Hashing:** bcrypt with cost factor 12
- **JWT Tokens:** 15-minute access tokens, 7-day refresh tokens
- **Session Management:** MongoDB-backed sessions with revocation support
- **OAuth:** Google OAuth2 integration
- **Rate Limiting:** Per-route and per-user rate limits
- **Account Lockout:** After 5 failed login attempts

### Data Protection

- **Encryption in Transit:** TLS 1.2+ enforced (production)
- **Encryption at Rest:** MongoDB encryption (production)
- **Sensitive Data:** PII redacted from logs
- **Cookie Security:** httpOnly, secure, sameSite flags

### Input Validation

- **Schema Validation:** Zod schemas on all API endpoints
- **SQL/NoSQL Injection:** Parameterized queries via Mongoose
- **XSS Protection:** Auto-escaping via Fastify JSON serialization
- **CSRF Protection:** Tokens for state-changing operations

### Payment Security

- **Server-Side Verification:** All payment amounts recomputed server-side
- **Webhook Verification:** PayPal SDK signature verification
- **Idempotency:** Duplicate payment prevention
- **PCI Compliance:** No card data stored (delegated to PayPal)

### Security Headers

- **CSP:** Content Security Policy with strict directives
- **HSTS:** Strict-Transport-Security (production)
- **X-Frame-Options:** DENY (clickjacking protection)
- **X-Content-Type-Options:** nosniff
- **Referrer-Policy:** strict-origin-when-cross-origin

---

## Security Best Practices for Contributors

### Code Security

1. **No Hardcoded Secrets:** Use environment variables
2. **TypeScript Strict Mode:** Enforce type safety
3. **Input Validation:** Validate all user inputs with Zod
4. **Output Encoding:** Use templating engines, avoid innerHTML
5. **Least Privilege:** Grant minimal necessary permissions
6. **Error Handling:** No sensitive info in error messages

### Dependency Security

1. **Audit Dependencies:** Run `pnpm audit` before commits
2. **Update Regularly:** Keep dependencies up to date
3. **Review Changes:** Check dependency changelogs
4. **Minimize Dependencies:** Only add necessary packages

### Testing

1. **Security Tests:** Include security-specific test cases
2. **Auth Tests:** Test permission boundaries
3. **Input Fuzzing:** Test with malicious inputs
4. **Rate Limit Tests:** Verify rate limiting works

---

## Security Contacts

- **Security Team:** security@q8m.com
- **General Inquiries:** support@q8m.com
- **Emergency (Critical Issues):** security@q8m.com with [URGENT] prefix

---

## Security Updates

Subscribe to security advisories:

- GitHub Security Advisories: [github.com/htirawi/q8m/security/advisories](https://github.com/htirawi/q8m/security/advisories)
- Email List: security-updates@q8m.com

---

## Acknowledgments

We thank the following security researchers for their responsible disclosure:

_(This section will be updated as reports are received)_

---

**Last Updated:** 2025-01-11  
**Next Review:** Q2 2025
