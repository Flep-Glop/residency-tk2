# Medical Physics Toolkit Documentation

**Last Updated:** October 31, 2025

---

## START HERE

### For AI Assistants
**Begin with `static/HUB.md`** - Your navigation hub for all development tasks.

### For Human Developers
**Begin with `/CLAUDE.md`** (in project root) - Ultra-lean quick reference.

---

## DOCUMENTATION STRUCTURE

```
docs/
├── README.md (this file)         # Documentation overview
├── DEV_LOG.md                    # Rolling session log (Smooth/Friction/Insight)
├── VERSION_MANAGEMENT.md         # Version tracking & deployment guide
│
├── static/                       # Core reference documentation
│   ├── HUB.md                    # Navigation hub & critical workflows
│   ├── ARCHITECTURE.md           # Design decisions & rationale
│   ├── PATTERNS.md               # Proven implementation patterns
│   ├── SPRITES.md                # Module specifications
│   └── STACK.md                  # Known issues & tech stack
│
└── *.mermaid                     # Business logic flow diagrams
    ├── fusion-quickwrite-flow.mermaid
    ├── prior-dose-flow.mermaid
    └── mpc-quickwrite-simplified.mermaid
```

---

## 📖 DOCUMENT PURPOSES

### DEV_LOG.md (Rolling Log)
**Purpose:** Session-by-session development tracking  
**Format:** Entry #N with Focus/Smooth/Friction/Insight  
**Lifecycle:** Grows with sessions → Migrated to static docs → Wiped periodically

**Use when:**
- Starting a development session
- Ending a development session
- Discovering a new pattern
- Encountering a significant challenge

### VERSION_MANAGEMENT.md
**Purpose:** Version tracking, deployment procedures, troubleshooting  
**Contains:**
- Pre-deployment checklists
- Environment configuration guides
- Git workflow procedures
- Deployment debugging steps

**Use when:**
- Preparing for deployment
- Debugging deployment issues
- Updating version numbers
- Coordinating backend/frontend releases

### static/HUB.md
**Purpose:** Central navigation hub and critical reminders  
**Contains:**
- Quick navigation to all other docs
- One-command start/stop
- Environment setup reminders
- 4-step debugging workflow

**Use when:**
- Starting ANY development task
- Deciding which doc to reference
- Need quick command reference

### static/ARCHITECTURE.md
**Purpose:** Design decisions with rationale  
**Contains:**
- Full-stack separation philosophy
- Three-phase module pattern
- UI/UX philosophy (3-column layout)
- Deployment architecture
- "FAILED APPROACHES" section

**Use when:**
- Understanding why decisions were made
- Making new architectural choices
- Onboarding new developers
- Avoiding known failed approaches

### static/PATTERNS.md
**Purpose:** Proven implementation patterns with code examples  
**Contains:**
- Module development workflow
- Input styling (dark theme)
- Backend text generation rules
- Form validation patterns
- Copy-paste functionality
- "Common Symptoms → Solutions" table

**Use when:**
- Building new features
- Fixing bugs
- Styling components
- Implementing forms
- Writing backend services

### static/SPRITES.md
**Purpose:** Complete module specifications  
**Contains:**
- Module status (⭐✅🚧❌)
- Feature lists per module
- API endpoints
- Key file locations
- Common module features checklist
- New module creation guide

**Use when:**
- Understanding module capabilities
- Planning new module development
- Looking up API endpoints
- Finding file locations

### static/STACK.md
**Purpose:** Tech stack, known issues, technical debt  
**Contains:**
- Core stack versions
- Known bugs/issues
- "DON'T TRY THESE" section (already failed)
- Technical debt backlog
- Browser compatibility
- Deployment requirements

**Use when:**
- Debugging issues
- Understanding limitations
- Planning technical improvements
- Avoiding known pitfalls

### *.mermaid Files
**Purpose:** Visual business logic flows  
**Format:** Mermaid diagram syntax  
**View:** GitHub automatically renders, or use Mermaid viewer

**Use when:**
- Understanding complex decision trees
- Planning module logic
- Documenting workflows

---

## 🔄 DOCUMENTATION WORKFLOW

### Daily Development
1. **Start:** Check `static/HUB.md` for critical reminders
2. **During:** Reference `static/PATTERNS.md` for implementation
3. **Issues:** Check `static/STACK.md` "DON'T TRY THESE" first
4. **End:** Log session in `DEV_LOG.md`

### Module Development
1. **Planning:** Read `static/SPRITES.md` for reference modules
2. **Implementation:** Follow `static/PATTERNS.md` three-phase checklist
3. **Architecture:** Check `static/ARCHITECTURE.md` for design principles
4. **Completion:** Update `static/SPRITES.md` with new module

### Deployment
1. **Pre-deploy:** Follow `VERSION_MANAGEMENT.md` checklist
2. **Deploy:** Coordinate backend/frontend per checklist
3. **Post-deploy:** Verify per `VERSION_MANAGEMENT.md`
4. **Log:** Document deployment in `DEV_LOG.md`

### Documentation Maintenance
1. **Session logs:** Add to `DEV_LOG.md` after each session
2. **Proven patterns:** Migrate from DEV_LOG to `static/PATTERNS.md`
3. **Architectural decisions:** Add to `static/ARCHITECTURE.md`
4. **New bugs/TODOs:** Update `static/STACK.md`
5. **Module changes:** Update `static/SPRITES.md`

---

## DOCUMENTATION PRINCIPLES

### 1. Single Responsibility
Each document has ONE clear purpose. No overlap.

### 2. Scannable Format
- Headers, bullets, tables
- ✅/❌ symbols for quick decisions
- Emojis for visual guidance
- Code examples inline

### 3. Negative Knowledge
"DON'T TRY THESE" sections preserve what DOESN'T work.  
Includes hours wasted to discourage repeat attempts.

### 4. Cross-References
Documents link to each other.  
HUB.md is the navigation center.

### 5. Version Tracking
Each static doc tracks its version at the bottom.  
Know when documentation is current.

### 6. Rolling vs Static
- **DEV_LOG.md:** Rolling (grows, then wiped)
- **static/*:** Persistent (updated, never wiped)

---

## QUICK REFERENCE

| Task | Document |
|------|----------|
| Start development | `static/HUB.md` |
| Build module | `static/PATTERNS.md` |
| Understand architecture | `static/ARCHITECTURE.md` |
| Find module spec | `static/SPRITES.md` |
| Debug issue | `static/STACK.md` |
| Deploy changes | `VERSION_MANAGEMENT.md` |
| Log session | `DEV_LOG.md` |

---

## 📦 ARCHIVED DOCUMENTATION

Historical documentation has been archived to maintain clarity.  
Access via git history if needed:

```bash
git log --all --full-history -- "FIXES_SUMMARY.md"
git log --all --full-history -- "migration-guide.md"
```

All useful content migrated to new structure.

---

## 🔗 RELATED FILES

**Project Root:**
- `CLAUDE.md` - Ultra-lean quick reference (47 lines)
- `README.md` - Project overview and setup instructions

**Testing:**
- `test_pacemaker_module.py` - Automated Pacemaker tests
- `test_sbrt_module.py` - Automated SBRT tests

**Scripts:**
- `start.sh` - Start both backend and frontend
- `stop.sh` - Stop both services

---

## 🎉 BENEFITS OF THIS STRUCTURE

✅ **Clear navigation** - Always know where to find information  
✅ **Single source of truth** - No duplication across docs  
✅ **Scannable** - Quick visual scanning with symbols and formatting  
✅ **Actionable** - Code examples and checklists for immediate use  
✅ **Maintainable** - Update only relevant doc, no sync issues  
✅ **Scalable** - Easy to add new modules, patterns, or issues  
✅ **Onboarding-friendly** - New developers start at HUB.md  
✅ **Negative knowledge preserved** - Learn from past failures  

---

**Questions about documentation structure? Start at `static/HUB.md`**

