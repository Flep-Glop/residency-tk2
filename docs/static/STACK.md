# MEDICAL PHYSICS TOOLKIT STACK
*Current versions, known issues, and what not to try*

## CORE STACK

### Backend
- **Framework:** FastAPI 0.104+
- **Language:** Python 3.8+
- **Validation:** Pydantic 2.x
- **Server:** Uvicorn
- **Database:** SQLAlchemy (optional, not heavily used)
- **Testing:** pytest, requests

### Frontend
- **Framework:** Next.js 14.x
- **React:** 18.x
- **UI Library:** Chakra UI 2.x
- **Forms:** react-hook-form 7.x
- **HTTP Client:** Axios 1.x
- **Styling:** Chakra UI (CSS-in-JS)

### Deployment
- **Backend:** Railway (https://residency-tk2-production.up.railway.app)
- **Frontend:** Vercel (auto-deploy from main branch)
- **Version Control:** GitHub

---

## 🐛 KNOWN ISSUES

### High Priority

_No high priority issues currently tracked._

#### Environment Configuration Trap
- **Issue:** Easy to forget switching environment before deployment
- **Symptom:** Production app tries to call localhost, fails completely
- **Solution:** Use deployment checklist in HUB.md
- **Impact:** 🔴 Breaking - app unusable if skipped

### Medium Priority

#### Fusion Module Complexity
- **Issue:** 1,722 lines makes it hard to maintain
- **Status:** Works perfectly, but intimidating for new developers
- **Consideration:** Future refactoring into smaller components
- **Fix Priority:** Low (works well as-is)

---

## ✅ ALL MODULES PRODUCTION READY

All 8 modules now have full backend implementation, comprehensive QA testing, and are deployed to production:
1. **Fusion** - Multi-modality image fusion (33 tests)
2. **DIBH** - Deep inspiration breath hold (20 tests)
3. **SBRT** - Stereotactic body radiation therapy (15 tests)
4. **Prior Dose** - Dose overlap assessment (15 comprehensive + 13 clinical QA tests)
5. **SRS/SRT** - Stereotactic radiosurgery (15 tests)
6. **Pacemaker** - TG-203 compliant CIED management (21 tests)
7. **TBI** - Total body irradiation (13 tests)
8. **HDR** - High dose rate brachytherapy (18 tests)

---

## 🚨 DON'T TRY THESE (Already Failed)

### Frontend Text Override
- **What:** `formatWriteup()` functions that modify backend responses
- **Why it failed:** Created "dual text generation bug" - frontend ignored backend
- **Symptom:** Backend changes had zero effect on output
- **Hours wasted:** 3-4 hours debugging
- **Solution:** Always display backend response verbatim

### Write-up Below Form
- **What:** Placing generated write-up below form inputs
- **Why it failed:** Users have to scroll, miss the output
- **Symptom:** "Where's my write-up?" confusion
- **Solution:** Always use 3-column layout with always-visible results

### Fixed 3-Column Grid
- **What:** `Grid templateColumns="repeat(3, 1fr)"`
- **Why it failed:** Breaks on mobile/tablet, unusable
- **Symptom:** Horizontal scrolling, cut-off content
- **Solution:** Responsive breakpoints (base/md/lg)

### Escaped Newlines in Python
- **What:** Using `\\n` instead of `\n` in f-strings
- **Why it failed:** Literal "\n" text appears in write-ups
- **Symptom:** Unprofessional output with escape characters
- **Hours wasted:** 1 hour (found quickly via DEV_LOG)
- **Solution:** Always use single backslash, test in frontend

### Manual Array State Management
- **What:** `useState([])` for dynamic form lists
- **Why it failed:** Disconnected from react-hook-form validation
- **Symptom:** Validation doesn't work, state bugs
- **Solution:** Use `useFieldArray` from react-hook-form

### Wrong Environment During Development
- **What:** Frontend calling production while developing locally
- **Why it failed:** Backend changes have no effect
- **Symptom:** "Why isn't my code working?!" panic
- **Hours wasted:** 2-3 hours (multiple occurrences)
- **Solution:** Check DevTools Network tab FIRST before debugging

---

## 🔄 TECHNICAL DEBT

### Could Be Improved (Not Urgent)

#### Configuration Management
- **Current:** Hardcoded physician/physicist lists in frontend
- **Better:** Move to backend config endpoint or database
- **Benefit:** Easier to update names without redeployment
- **Priority:** 🟢 Low

#### User Preferences
- **Current:** No persistence of user selections
- **Better:** Save default physicist/physician choices
- **Benefit:** Faster workflow for frequent users
- **Priority:** 🟢 Low

#### Dark Mode Toggle
- **Current:** Dark theme only
- **Better:** User-selectable light/dark mode
- **Benefit:** Accessibility for some users
- **Priority:** 🟢 Low (dark works well for medical workstations)

#### Audit Trail
- **Current:** No logging of generated write-ups
- **Better:** Optional logging for quality assurance
- **Benefit:** Track usage, identify issues
- **Privacy Concern:** Must maintain HIPAA compliance
- **Priority:** 🟢 Low

#### Test Coverage
- **Current:** All 8 modules have comprehensive automated tests (165+ total tests)
- **Status:** ✅ Complete
- **Benefit:** Regression prevention, faster development, clinical confidence
- **Notes:** Test scripts follow consistent pattern (test suites, quality checks, markdown reports)

#### Template Customization
- **Current:** Templates hardcoded in backend
- **Better:** Allow per-institution customization
- **Benefit:** Adaptable to different clinical practices
- **Priority:** 🟢 Low (works for current institution)

---

## 🌐 BROWSER COMPATIBILITY

### Supported
- Chrome 90+ (primary development browser)
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6+ JavaScript
- Fetch API / Axios
- CSS Grid/Flexbox
- Local Storage (for potential future features)

### Known Issues
None currently - modern browser support is good.

---

## 🔐 DEPLOYMENT REQUIREMENTS

### Environment Variables

#### Frontend (.env.local)
```bash
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Production (MUST update before git push)
NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api
```

#### Backend (Railway environment)
- No special environment variables currently required
- Future: Database URLs, API keys if needed

### Critical Deployment Steps
1. ⚠️ **Switch frontend to production URL**
2. Git commit and push to main
3. ⚠️ **Switch frontend back to local URL**
4. Verify deployment on production URL

**Skipping step 1 = 💥 Production app completely broken**

---

## 📋 FUTURE ENHANCEMENTS (Backlog)

### Near-Term (Next 3-6 Months)
- [x] Fix Prior Dose UI polish (COMPLETE - Entry #50-70)
- [x] Implement SRS/SRT module (COMPLETE - Entry #84-89)
- [x] Add automated tests for all modules (COMPLETE - 165+ tests)
- [ ] Create development guide video/tutorial
- [ ] Mobile optimization pass
- [ ] User feedback collection system

### Long-Term (6+ Months)
- [ ] User authentication system
- [ ] Case history / write-up library
- [ ] Multi-institution support
- [ ] Template customization interface
- [ ] Analytics dashboard
- [ ] Mobile app version

---

## 🧪 TESTING RECOMMENDATIONS

### Manual Testing Checklist
For any module changes:
- [ ] Test on mobile viewport (< 768px)
- [ ] Test on tablet viewport (768-1024px)
- [ ] Test on desktop viewport (> 1024px)
- [ ] Verify environment configuration (DevTools Network tab)
- [ ] Check backend logs for errors
- [ ] Test all form validation
- [ ] Verify write-up formatting (newlines, grammar)
- [ ] Test copy to clipboard functionality
- [ ] Check navigation (back button, home button)
- [ ] Verify dark theme styling on all inputs

### Automated Testing
Run before major releases:
```bash
cd backend && ./run_tests.sh
python test_fusion_comprehensive.py       # 33 tests
python test_dibh_comprehensive.py         # 20 tests
python test_sbrt_comprehensive.py         # 15 tests
python test_prior_dose_comprehensive.py   # 15 tests
python test_prior_dose_clinical_qa.py     # 13 tests
python test_srs_comprehensive.py          # 15 tests
python test_pacemaker_comprehensive.py    # 21 tests
python test_tbi_comprehensive.py          # 13 tests
python test_hdr_comprehensive.py          # 18 tests
# Total: 165+ comprehensive tests
```

---

## 💡 LESSONS LEARNED (Quick Reference)

### Development Pitfalls
1. **Environment mismatch** - Always check Network tab first
2. **Frontend override** - Never modify backend responses
3. **Escaped newlines** - Use `\n` not `\\n`
4. **Missing data-theme** - Chakra Select needs explicit dark theme
5. **Fixed grid columns** - Always use responsive breakpoints

### What Works Well
1. **Three-phase implementation** - Backend → Service → Form
2. **Copy Fusion structure** - Proven patterns save time
3. **Automated testing** - Catches regressions immediately
4. **DEV_LOG.md** - Documents solutions for future
5. **3-column layout** - Users love always-visible results

---

## 📚 DOCUMENTATION VERSIONS
- STACK: v1.1 (Dec 2025)
- Last updated: December 17, 2025
- Next review: When major features added or issues discovered

