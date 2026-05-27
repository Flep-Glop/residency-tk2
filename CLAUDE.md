# CLAUDE.md

## ONE-COMMAND START
```bash
./start.sh    # Both services (local dev with SQLite)
./stop.sh     # Stop everything
```

## ENVIRONMENT

**Local dev** uses SQLite automatically (no DATABASE_URL needed).

**Frontend `.env.local`** should always stay as localhost for local dev:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
The production frontend URL is set in the **Vercel dashboard**, not in this file.

### Railway Environment Variables (production)
| Variable | Example |
|---|---|
| `DATABASE_URL` | Set automatically by Railway Postgres plugin |
| `ENV` | `production` |
| `SYSTEM_PROFILE_NAME` | `Mays Cancer Center` |
| `SYSTEM_PHYSICIANS` | `Dalwadi,Galvan,Ha,Kluwe,Le,Lewis,Tuli` |
| `SYSTEM_PHYSICISTS` | `Bassiri,Kirby,Papanikolaou,Paschal,Rasmussen` |

### Vercel Environment Variables (production)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://residency-tk2-production.up.railway.app/api` |

## TOP 3 RULES
1. **HIPAA:** Always use `---` placeholder for patient names
2. **Copy Fusion:** It's the gold standard, copy its structure
3. **Check Environment:** 80% of bugs are wrong API endpoint

## DEBUGGING = 4 STEPS
1. DevTools → Network tab (verify endpoint)
2. Backend logs (terminal running uvicorn)
3. Frontend console (DevTools → Console)
4. Test direct (http://localhost:8000/docs)

## PROJECT STRUCTURE
```
backend/app/       → FastAPI routers, schemas, services
frontend/src/      → Next.js pages, components, services
```
