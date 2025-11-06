# MEDICAL PHYSICS TOOLKIT ARCHITECTURE
*Core architectural decisions and patterns that define the project*

## FULL-STACK SEPARATION

### The Decision
FastAPI backend handles ALL business logic and text generation. Next.js frontend is purely presentation layer. This separation is deliberate after fixing the "dual text generation bug."

### Backend Responsibilities
✅ **Backend handles:**
- All write-up text generation
- Grammar rules (singular/plural, articles)
- Medical terminology
- Clinical template formatting
- Data validation (Pydantic schemas)

### Frontend Responsibilities
✅ **Frontend handles:**
- Form collection and validation
- UI state management
- API calls and error handling
- Display of backend responses (NEVER modify them)
- Copy-to-clipboard functionality

### The Key Rule
**"Is this medical content or UI behavior?"**
- Medical content → Backend
- UI behavior → Frontend

---

## THREE-PHASE MODULE PATTERN

### Phase 1: Backend (Schema → Service → Router)
```
backend/app/
├── schemas/module_name.py      # Pydantic validation models
├── services/module_name.py     # Business logic & text generation
└── routers/module_name.py      # API endpoints
```

**Example flow:**
1. Define `ModuleRequest` and `ModuleData` schemas
2. Implement `generate_writeup()` service method
3. Create POST endpoint in router
4. Test via FastAPI Swagger UI (http://localhost:8000/docs)

### Phase 2: Frontend Service (API Client)
```
frontend/src/services/moduleService.js
```
- Axios calls to backend
- Error handling
- Response transformation (if needed)

### Phase 3: Frontend UI (Component → Page)
```
frontend/src/
├── components/module-name/ModuleForm.jsx   # Form component
└── pages/module-name.js                    # Page wrapper
```

**3-Column Layout Pattern:**
```jsx
<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}>
  <GridItem> {/* Input fields */} </GridItem>
  <GridItem> {/* Patient info */} </GridItem>
  <GridItem> {/* Always-visible results */} </GridItem>
</Grid>
```

---

## UI/UX PHILOSOPHY

### Always-Visible Results
**Decision:** Write-up displays in 3rd column, visible while filling form.

**Why:** Users need to see output change in real-time without scrolling.

**Anti-pattern:** Placing write-up below form (Prior Dose had this bug).

### Dark Theme Medical Interface
**Decision:** Gray-900 background, gray-700 inputs, white text.

**Why:** Professional medical appearance, reduces eye strain.

**Standard colors:**
- Background: `gray.900`
- Input background: `gray.700`
- Borders: `gray.600`
- Hover borders: `gray.500`
- Text: `white`
- Placeholders: `gray.400`

### Responsive Grid Layout
```jsx
templateColumns={{
  base: "1fr",           // Mobile: 1 column
  md: "repeat(2, 1fr)",  // Tablet: 2 columns
  lg: "repeat(3, 1fr)"   // Desktop: 3 columns
}}
```

**Why:** Mobile-first approach, degrades gracefully.

---

## DEPLOYMENT ARCHITECTURE

### Backend: Railway
- Python/FastAPI application
- SQLAlchemy for data (if needed)
- Automatic deployment from GitHub main branch
- URL: `https://residency-tk2-production.up.railway.app`

### Frontend: Vercel
- Next.js static export
- Automatic deployment from GitHub main branch
- Environment variable determines backend URL

### Environment Variable Strategy
**Local development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Production deployment:**
```bash
NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api
```

**Critical:** Frontend `.env.local` MUST match deployment target before git push.

---

## WORKFLOW SYSTEM

### Home → Verification → Form → Write-up
**Decision:** Three-step flow with verification middle step.

**Why:** Prevents user errors, clarifies configuration before complex form.

**Pattern:**
1. **Home (index.js):** Module selection
2. **Verification (verification.js):** Review selections, proceed with config
3. **Form (module.js):** Generate write-up
4. **Result:** Copy to clipboard, use in EMR

### Verification Step Purpose
- Confirms user selections before complex form
- Passes configuration via URL query params
- Enables auto-population of form fields
- Reduces user input errors

---

## KEY DECISIONS

### Backend Controls Text Generation
**Rationale:** Frontend was overriding backend responses ("dual text generation bug").

**Solution:** Frontend displays backend text verbatim.

**Enforcement:** No `formatWriteup()` functions that modify backend output.

### Why Chakra UI?
- Excellent dark theme support
- Built-in responsive grid system
- Professional medical appearance
- Good form components

### Why 3-Column Layout?
- Always-visible results eliminate scrolling
- Logical information hierarchy
- Works well on large medical workstation monitors

### Why Fusion is Reference Implementation?
- Most sophisticated module (1,722 lines)
- Handles all edge cases
- Proven UI patterns
- All new modules should copy its structure

---

## FAILED APPROACHES (Don't Try These)

### ❌ Frontend Text Override
- **Problem:** Frontend had hardcoded templates that ignored backend
- **Symptom:** Backend changes had no effect
- **Solution:** Always display backend response directly

### ❌ Wrong Environment During Development
- **Problem:** Frontend calling production while developing locally
- **Symptom:** Hours debugging "broken" code that actually works
- **Solution:** Always verify DevTools Network tab first

### ❌ Write-up Below Form
- **Problem:** Prior Dose had write-up below form requiring scroll
- **Symptom:** Poor UX, users missed output
- **Solution:** Always use 3-column layout with always-visible results

### ❌ Non-Responsive Grid
- **Problem:** Fixed 3-column grid breaks on mobile
- **Symptom:** Unusable on tablets/phones
- **Solution:** Use Chakra responsive breakpoints

### ❌ Escaped Newlines in Backend
- **Problem:** Using `\\n` instead of `\n` in Python f-strings
- **Symptom:** Literal "\n" text in write-ups
- **Solution:** Use single backslash, test frontend display

### ❌ Manual State for Form Arrays
- **Problem:** Prior treatments managed outside react-hook-form
- **Symptom:** Validation disconnected, state bugs
- **Solution:** Use useFieldArray for dynamic lists

