# Monitoring & Observability Runbook

## 1. System Architecture
Nexmarto uses a layered monitoring approach suitable for enterprise scaling:
- **Application Performance Monitoring (APM)**: Sentry / Datadog
- **Infrastructure Metrics**: Prometheus & Grafana
- **Uptime & Ping**: UptimeRobot or BetterStack

## 2. Key Performance Indicators (KPIs) to Watch
| Metric | Threshold Alert | Action Required |
|--------|-----------------|-----------------|
| API Latency (p95) | > 500ms | Check PostgreSQL slow queries & Redis hit rates. |
| Node.js Event Loop Delay | > 50ms | CPU saturation. Scale API horizontally. |
| Database Connections | > 80% pool limit | Optimize `PgBouncer` or increase `Prisma` connection limits. |
| PostgreSQL CPU | > 70% | Run `VACUUM ANALYZE` or verify index usage on `Product` table. |

## 3. Incident Response Commands
If the platform experiences high latency:

**Restarting the Application Stack:**
```bash
docker-compose -f docker-compose.prod.yml restart api
```

**Viewing Live Logs (Error Tracing):**
```bash
docker logs nexmarto_api --tail 100 -f
docker logs nexmarto_web --tail 100 -f
```

## 4. Scaling the Platform
The platform is designed to scale horizontally. To add more Next.js or NestJS instances behind the Nginx load balancer:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale api=3 --scale web=2
```
