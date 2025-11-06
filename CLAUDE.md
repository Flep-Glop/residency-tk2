# CLAUDE.md
*Quick reference - navigate to specific docs as needed*

## START HERE → docs/static/HUB.md
**Everything you need is organized in 5 focused docs.**

## QUICK NAVIGATION
- **Building module?** → `docs/static/PATTERNS.md`
- **Module spec?** → `docs/static/SPRITES.md`
- **Bug/TODO?** → `docs/static/STACK.md`
- **Why decision made?** → `docs/static/ARCHITECTURE.md`
- **Session done?** → `docs/DEV_LOG.md`
- **Version/deployment?** → `docs/VERSION_MANAGEMENT.md`

## ONE-COMMAND START
```bash
./start.sh    # Both services
./stop.sh     # Stop everything
```

## 🚨 CRITICAL REMINDER
**Before ANY work, verify environment:**
```bash
cat frontend/.env.local
# Should show: http://localhost:8000/api (local dev)
```

**Before git push:**
```bash
# Switch to production URL or app breaks!
echo "NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api" > frontend/.env.local
```

## TOP 3 RULES
1. **HIPAA:** Always use `---` placeholder for patient names
2. **Copy Fusion:** It's the gold standard, copy its structure
3. **Check Environment:** 80% of bugs are wrong API endpoint

## DEBUGGING = 4 STEPS
1. DevTools → Network tab (verify endpoint)
2. Backend logs (terminal running uvicorn)
3. Frontend console (DevTools → Console)  
4. Test direct (http://localhost:8000/docs)

---

📚 **Full documentation architecture in `docs/static/HUB.md`**
