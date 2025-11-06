# Version Management System

This document describes the version management and changelog system for Medical Physics Toolkit.

## Overview

The version management system provides:
- Centralized version information
- Manual changelog updates in DEV_LOG.md
- Coordinated deployment tracking
- Documentation version alignment

## Components

### 1. Version Tracking (`frontend/src/constants/version.js`)
- Centralized version information
- Build date and version string
- Display in UI footer/header

### 2. DEV_LOG.md (`docs/DEV_LOG.md`)
- Session-based development tracking
- Smooth/Friction/Insight format
- Patterns discovered sections
- Rolling log (wiped periodically and migrated to static docs)

### 3. Static Documentation (`docs/static/`)
- HUB.md - Navigation hub
- ARCHITECTURE.md - Design decisions
- PATTERNS.md - Proven approaches
- SPRITES.md - Module specifications
- STACK.md - Known issues and tech debt

## Usage

### For Developers

#### Manual Version Updates
Update version in multiple locations:

1. **Frontend Version Constant**:
   ```javascript
   // frontend/src/constants/version.js
   export const APP_VERSION = 'v3.0';
   export const BUILD_DATE = '2025-10-31';
   ```

2. **Package.json** (if applicable):
   ```json
   {
     "version": "3.0.0"
   }
   ```

3. **Documentation Versions**:
   Update at bottom of each static doc:
   ```markdown
   ## DOCUMENTATION VERSIONS
   - HUB: v1.0 (Oct 2025)
   - ARCHITECTURE: v1.0 (Oct 2025)
   - [etc...]
   ```

#### Logging Development Sessions
After each development session, add entry to `docs/DEV_LOG.md`:

```markdown
## Entry #[NUMBER]
**Focus:** [Primary goal or feature being built/fixed]
**Smooth:** [What worked well, successful patterns used]
**Friction:** [Challenges encountered and their solutions]
**Insight:** [Key learning to carry forward]
```

**Guidelines:**
- Keep entries concise and actionable
- Focus on patterns and solutions, not detailed implementation
- Note architectural decisions that might affect future work
- Flag any discoveries that should migrate to static docs
- No dates, no time estimates, no complexity assessments
- Number entries sequentially regardless of gaps between sessions

#### Migrating to Static Documentation
When DEV_LOG entries reach ~15-20 or patterns are proven:

1. **Extract Patterns**: Move proven patterns to PATTERNS.md
2. **Extract Decisions**: Move architectural decisions to ARCHITECTURE.md
3. **Extract Module Info**: Update SPRITES.md with new module details
4. **Extract Issues**: Move bugs/TODOs to STACK.md
5. **Archive Entries**: Note which entries were migrated and wipe

### For Users/Clinicians

#### Viewing Current Version
- Check footer of web application
- Version string format: "v3.0"
- Build date shows last deployment

## File Structure

```
docs/
├── DEV_LOG.md                    # Rolling development log
├── VERSION_MANAGEMENT.md         # This documentation
└── static/
    ├── HUB.md                    # Navigation hub
    ├── ARCHITECTURE.md           # Design decisions
    ├── PATTERNS.md               # Proven approaches
    ├── SPRITES.md                # Module specifications
    └── STACK.md                  # Known issues

frontend/src/constants/
└── version.js                    # Version display constant
```

## Version Classification

### Major Version (v1.0 → v2.0)
- Complete architectural overhaul
- Breaking changes to existing modules
- New deployment infrastructure
- Major feature additions

**Example:** Migration from Streamlit to FastAPI + Next.js (v1.0 → v2.0)

### Minor Version (v2.0 → v2.1)
- New module implementations (SRS/SRT, TBI, HDR)
- Significant feature additions to existing modules
- Major UI/UX improvements
- New workflow integrations

**Example:** Adding Pacemaker module (v2.0 → v2.1)

### Patch Version (v2.1 → v2.1.1)
- Bug fixes
- UI polish (styling, spacing, responsiveness)
- Minor feature enhancements
- Performance improvements

**Example:** Fixing Prior Dose UI formatting issues

## Deployment Coordination

### Pre-Deployment Checklist

1. **Environment Configuration**
   ```bash
   # CRITICAL: Switch to production URL
   echo "NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api" > frontend/.env.local
   ```

2. **Verify Git Status**
   ```bash
   git status
   # Look for untracked files that should be committed
   ```

3. **Test Locally**
   ```bash
   ./start.sh
   # Test all modified modules
   # Run automated tests
   python test_pacemaker_module.py
   python test_sbrt_module.py
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Descriptive commit message including version"
   git push origin main
   ```

5. **Switch Back to Local**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > frontend/.env.local
   ```

### Post-Deployment Verification

1. **Check Production URL**
   - Visit live application
   - Verify version string in UI
   - Test modified features

2. **Check Logs**
   - Railway backend logs
   - Vercel frontend logs
   - Look for runtime errors

3. **Update DEV_LOG**
   ```markdown
   ## Entry #[N]
   **Focus:** Version [X.Y] deployment
   **Smooth:** [What deployed successfully]
   **Friction:** [Any deployment issues encountered]
   **Insight:** [Lessons learned for next deployment]
   ```

## Deployment Troubleshooting

### When Deployed Version Differs from Local Development

**Symptom**: Features work locally but not in production.

**Root Cause**: Missing files in git commits or wrong environment configuration.

### Systematic Debugging Process

1. **Check Git Status First**
   ```bash
   git status
   ```
   Look for:
   - **Modified files**: Core backend/frontend files not committed
   - **Untracked files**: New components, services, or assets
   - **Deleted files**: Removed files still in git

2. **Identify Critical Missing Files**
   Common categories:
   - **Backend**: Services, routers, schemas
   - **Frontend**: Components, services, pages
   - **Assets**: Images, icons (if any)
   - **Dependencies**: requirements.txt, package.json, package-lock.json

3. **Check Environment Variables**
   ```bash
   # Frontend .env.local should be production URL before deployment
   cat frontend/.env.local
   
   # Should show:
   NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api
   ```

4. **Verify API Endpoints**
   - Open browser DevTools → Network tab
   - Check API call URLs
   - Ensure calling production, not localhost

### Real-World Example (Prior Dose Module)

**Problem**: 
- Local dev showed complete Prior Dose functionality
- Production had formatting bugs and missing features

**Investigation**:
```bash
git status
# Revealed modified frontend component and backend service not committed
```

**Solution**:
```bash
# Add missing files
git add backend/app/services/prior_dose.py
git add frontend/src/components/prior-dose/PriorDoseForm.jsx
git commit -m "Fix: Add missing Prior Dose implementation files"
git push origin main
```

### Prevention Strategies

1. **Regular Git Status Checks**
   - Check `git status` before pushing
   - Verify all modified files are intentionally committed
   - Use descriptive commit messages

2. **Pre-Deployment Testing**
   ```bash
   # 1. Check for untracked files
   git status
   
   # 2. Run automated tests
   python test_pacemaker_module.py
   python test_sbrt_module.py
   
   # 3. Test locally with production-like config
   ./start.sh
   
   # 4. Push to trigger deployment
   git push origin main
   ```

3. **Environment Management**
   - Always switch to production URL before deployment
   - Double-check environment file before git push
   - Document environment switches in workflow

### Recovery from Deployment Issues

If deployment doesn't match local development:

1. **Immediate Assessment**
   ```bash
   git status > deployment-debug.txt
   git diff --name-only >> deployment-debug.txt
   git log --oneline -5 >> deployment-debug.txt
   ```

2. **Systematic File Addition**
   - Commit backend changes first
   - Commit frontend changes second
   - Test deployment after each commit

3. **Verification**
   - Wait 2-3 minutes for Railway/Vercel deployment
   - Test specific features that were missing
   - Check browser console for errors
   - Verify backend logs in Railway dashboard

## Best Practices

### Development Sessions
1. **Start of Session**: Check git status, verify environment
2. **During Session**: Log patterns and decisions as you discover them
3. **End of Session**: Add DEV_LOG entry with Smooth/Friction/Insight
4. **Regular Review**: Migrate proven patterns to static docs

### Version Updates
1. Always coordinate frontend and backend versions
2. Update version constant before deployment
3. Document changes in DEV_LOG
4. Test deployment thoroughly
5. Verify production after deployment

### Documentation Maintenance
1. Keep DEV_LOG focused on recent sessions
2. Migrate proven patterns to static docs
3. Update STACK.md with new bugs/TODOs as discovered
4. Keep SPRITES.md current with module status
5. Document architectural decisions in ARCHITECTURE.md

## Debugging Commands

```bash
# Check what files are different between local and last commit
git diff --name-only

# See all untracked files
git ls-files --others --exclude-standard

# Check if specific file is tracked
git ls-files backend/app/services/module_name.py

# Verify what's been committed in recent commits
git log --stat -3

# Check current environment configuration
cat frontend/.env.local

# Verify backend logs (Railway)
# Visit: https://railway.app/project/[project-id]/service/[service-id]
```

## Lessons Learned

### Environment Configuration
- **Never assume environment is correct**: Always check before deployment
- **80% of bugs are wrong endpoint**: Verify DevTools Network tab first
- **Production URL before push**: One forgotten step breaks entire app

### Git Management
- **Check git status religiously**: Untracked files break deployments silently
- **Commit backend and frontend together**: Keeps versions synchronized
- **Descriptive commit messages**: Makes debugging easier later

### Testing
- **Test locally before push**: Catch issues before production
- **Automated tests save time**: Run module tests before every deployment
- **End-to-end testing critical**: Backend logs lie, frontend display is truth

### Documentation
- **DEV_LOG captures everything**: Session-by-session learning preservation
- **Migrate patterns when proven**: Don't let DEV_LOG grow indefinitely
- **Negative knowledge valuable**: Document what DOESN'T work in STACK.md

## Examples

### Development Session Entry
```markdown
## Entry #10
**Focus:** Implementing SRS/SRT module

**Smooth:** Copied SBRT structure as reference, reused dose constraint patterns, automated testing from start.

**Friction:** Single-fraction handling different from multi-fraction, had to add special validation logic. Brain vs spine treatment sites needed different UI flows.

**Insight:** Starting with automated tests (like test_sbrt_module.py) catches edge cases early. Copying proven patterns (SBRT) saves 50% implementation time.
```

### Deployment Session Entry
```markdown
## Entry #11
**Focus:** v3.1 deployment with SRS/SRT module

**Smooth:** Pre-deployment checklist prevented environment issues, all files committed before push, Railway deployment smooth.

**Friction:** Forgot to update version constant in frontend, had to deploy twice.

**Insight:** Add version constant update to pre-deployment checklist. Consider automated script for coordinated version bumping.
```

## Future Enhancements

### Planned Features
- [ ] Automated version bumping script (npm run version:patch)
- [ ] Changelog auto-generation from git commits
- [ ] Integration with Railway/Vercel deployment webhooks
- [ ] Version display in application header
- [ ] User-facing changelog/release notes

### Considerations
- Version history archiving strategy
- Automated testing in deployment pipeline
- Rollback procedures for failed deployments
- Feature flag system for gradual rollouts

