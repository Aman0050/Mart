# Production Security Hardening Checklist

Before routing live DNS traffic to the marketplace, ensure the following layers are fully secured.

## 1. Cloudflare Configuration (Edge Layer)
- [ ] **WAF Rules Activated**: Enable OWASP core rule sets to block SQL injection and XSS attempts before they reach the server.
- [ ] **Bot Fight Mode**: Enable Super Bot Fight Mode to prevent scrapers from downloading the entire supplier catalog.
- [ ] **Rate Limiting**: Set a strict rule at the edge: Block IPs exceeding 100 requests / minute to `/api/v1/auth/login`.
- [ ] **SSL/TLS**: Set to **Strict (Full)**. Install Cloudflare Origin Certificates on the Nginx reverse proxy.

## 2. Nginx Configuration (Proxy Layer)
- [ ] **Security Headers**: Ensure Nginx is injecting `Strict-Transport-Security`, `X-Frame-Options`, and `Content-Security-Policy`.
- [ ] **Rate Limiting**: Verify `limit_req_zone` is active for `/api/` blocks to prevent volumetric DDoS slipping past Cloudflare.
- [ ] **IP Forwarding**: Ensure `proxy_set_header X-Real-IP $remote_addr;` is properly forwarding the real client IP (not Cloudflare's IP) to the NestJS backend for audit logging.

## 3. NestJS Application (API Layer)
- [ ] **Helmet**: Verified active in `main.ts`.
- [ ] **JWT Secrets**: Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` in production are 64+ character cryptographically secure random strings.
- [ ] **CORS**: Restrict the `@nestjs/common` CORS origin array strictly to `['https://yourdomain.com', 'https://admin.yourdomain.com']`. Remove `*` or `localhost`.
- [ ] **Password Hashing**: Verified `bcrypt` cost factor is at least `10` or migrated to `argon2`.

## 4. PostgreSQL (Database Layer)
- [ ] **Network Isolation**: Database port `5432` must NOT be mapped to the public host. It should only be accessible within the `nexmarto_network` Docker bridge.
- [ ] **Passwords**: Use highly complex, randomly generated strings for `POSTGRES_PASSWORD`.
