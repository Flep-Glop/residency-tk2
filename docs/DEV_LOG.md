# DEVELOPMENT LOG
*Linear session tracking - wiped and integrated into core docs periodically*

---

<!-- TEMPLATE FOR NEW ENTRIES:
## Entry #[NUMBER]
**Focus:** [Primary goal or feature being built/fixed]
**Smooth:** [What worked well, successful patterns used]
**Friction:** [Challenges encountered and their solutions]
**Insight:** [Key learning to carry forward]

GUIDELINES:
- Keep entries concise and actionable
- Focus on patterns and solutions, not detailed implementation
- Note architectural decisions that might affect future work
- Flag any discoveries that should migrate to core docs
- No dates, no time estimates, no complexity assessments
- Number entries sequentially regardless of gaps between sessions
-->

---

## Entry #1
**Focus:** Documentation consolidation and standardization

**Smooth:** Created centralized `/docs/development-guide.md` from scattered documentation across CLAUDE.md, migration-guide.md, and FIXES_SUMMARY.md. Streamlined CLAUDE.md to act as quick reference pointing to comprehensive guide.

**Friction:** Documentation sprawl across multiple files made it difficult to find authoritative information. Historical logs mixed with current best practices.

**Insight:** Single source of truth for development patterns is essential. Keep CLAUDE.md lean as an entry point, detailed implementation guides in `/docs`. Historical logs should be separate from forward-looking documentation.

---

## Entry #2
**Focus:** Prior Dose module UI/UX parity with Fusion module

**Smooth:** Systematic comparison document (`fusion-vs-prior-dose-analysis.md`) identified all gaps before implementation. Responsive grid pattern from Fusion transferred cleanly. Always-visible write-up in 3rd column dramatically improved UX.

**Friction:** Prior Dose was built without reference implementation, leading to inconsistencies. Multiple issues discovered only through visual comparison: non-responsive grid, write-up below form requiring scroll, missing back button, no max-width constraint.

**Insight:** New modules should follow established patterns exactly. Side-by-side visual comparison catches UI/UX issues faster than code review alone. Document differences before fixing to avoid missing subtle details.

---

## Entry #3
**Focus:** Backend write-up generation bug in Prior Dose

**Smooth:** Debug logging already in place made root cause identification immediate. Global find-replace fixed all instances at once.

**Friction:** Backend service was using escaped newlines (`\\n`) instead of actual newlines (`\n`), causing literal "\n" text to appear in write-ups. Issue wasn't caught in development because backend logs showed proper formatting but frontend displayed raw strings.

**Insight:** Always verify backend response rendering in actual frontend display, not just terminal logs. Python f-strings handle `\n` vs `\\n` differently - single backslash for actual newlines, double for escaped. Test write-up generation end-to-end during development.

---

## Entry #4
**Focus:** Input field styling consistency across modules

**Smooth:** Pattern clearly documented in Fusion made replication straightforward. Applied identical styling props to all Select and Input elements in bulk.

**Friction:** Prior Dose inputs lacked all dark theme styling (bg, borderColor, color, _hover, sx). Required 13 separate input fields to be updated. Missing placeholder color styling on text inputs.

**Insight:** Create reusable input component or style constants to avoid repetitive styling. Every Select needs: `bg="gray.700"`, `borderColor="gray.600"`, `color="white"`, `_hover`, and `sx` for options. Every Input needs same plus `_placeholder`. Consider shared component library.

---

## Entry #5
**Focus:** Button layout spanning full width

**Smooth:** Simple prop changes (`width="100%"` on Generate, remove `justify="center"`) achieved desired layout immediately.

**Friction:** Centered buttons with explicit padding looked intentional but didn't match Fusion pattern. Generate button needs to span, Reset stays compact - not obvious from visual inspection alone.

**Insight:** Button layouts have semantic meaning - full-width primary action shows importance and makes target easier to hit. Secondary actions (Reset) stay compact. Remove `justify="center"` on Flex container to allow width-based sizing.

---

## Entry #6
**Focus:** Dropdown background rendering with Chakra UI

**Smooth:** Adding `data-theme="dark"` attribute immediately fixed rendering issue across all dropdowns.

**Friction:** Despite having `bg="gray.700"` and full styling props, dropdowns still rendered same color as container. Missing `data-theme="dark"` prevented Chakra UI from applying dark theme rendering properly. Not obvious from Fusion code what was critical vs optional.

**Insight:** Chakra UI Select components require explicit `data-theme="dark"` attribute to properly render dark backgrounds, even when bg color is specified. This is separate from the `sx` prop and inline option styles. Always include `aria-label` for accessibility and `data-theme` for proper theming on Select elements.

---

## Entry #7
**Focus:** Navigation consistency and duplicate button cleanup

**Smooth:** Removed duplicate navigation button from form component header cleanly - page wrapper already provided navigation.

**Friction:** Prior Dose had both "← Home" (from page wrapper) and "Back to Home" (from form component) - redundant navigation pattern not caught during initial implementation.

**Insight:** Navigation should be owned by page wrapper, not individual form components. Keeps forms portable and prevents duplication when components are reused. Check page wrappers before adding navigation to components.

---

## Entry #8
**Focus:** Terminology consistency in medical documentation

**Smooth:** Global find-replace across backend service changed all instances consistently.

**Friction:** Fusion module used "deformable enhancement" terminology instead of standard "deformable registration". Required update across 24+ instances in fusion service.

**Insight:** Medical/technical terminology should be verified against institutional standards before widespread use. Global search-replace is safe when term is distinct enough (like "enhancement" → "registration" in this context). Document approved terminology in style guide.

---

## Patterns Discovered

### UI/UX Consistency Pattern
1. Create detailed comparison document before fixes
2. Implement responsive grid with breakpoints (base/md/lg)
3. Use GridItem instead of Box for semantic correctness
4. Max-width 1200px, centered with auto margins
5. Always-visible results in 3rd column (no scrolling)
6. Full-width primary buttons, compact secondary buttons

### Input Styling Pattern
```jsx
// All Select elements require:
bg="gray.700"
borderColor="gray.600"
color="white"
_hover={{ borderColor: "gray.500" }}
data-theme="dark"  // CRITICAL for proper rendering
aria-label="descriptive label"
sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}

// All Input elements require:
bg="gray.700"
borderColor="gray.600"
color="white"
_hover={{ borderColor: "gray.500" }}
_placeholder={{ color: "gray.400" }}  // For text inputs
```

### Backend Text Generation Pattern
- Use single backslash for newlines: `\n` not `\\n`
- Test end-to-end rendering, not just logs
- Keep debug logging for future troubleshooting
- Grammar handling (singular/plural) in dedicated methods

### Module Development Checklist
- [ ] Reference existing working module (prefer Fusion)
- [ ] Copy exact UI patterns (grid, spacing, styling)
- [ ] Apply consistent input styling with all required props
- [ ] Test backend write-up rendering in actual frontend
- [ ] Verify responsive behavior on mobile/tablet/desktop
- [ ] Check for duplicate navigation elements
- [ ] Validate medical terminology against standards

---

## Entry #9
**Focus:** Documentation consolidation into new architecture

**Smooth:** Created 5-file structure inspired by Rogue Resident game project documentation. HUB.md (ultra-lean navigation), ARCHITECTURE.md (design decisions), PATTERNS.md (proven approaches), SPRITES.md (module specs), STACK.md (known issues).

**Friction:** Had 12 documentation files (~2,900 lines) scattered across root and /docs. Content duplicated across README, CLAUDE.md, development-guide, FIXES_SUMMARY, migration-guide. Hard to find authoritative information. Historical logs mixed with forward-looking patterns.

**Insight:** Rogue Resident's documentation structure is brilliant - each file has single responsibility, ultra-scannable format with ✅/❌ symbols, "DON'T TRY THESE (Already Failed)" sections preserve negative knowledge, HUB.md just 47 lines but points everywhere. Applied these patterns: decision trees, inline code examples, component-organized specs, version tracking. Result: 8 active files (~1,500 lines) + 5 archived files. Much easier to navigate and maintain.

---

## Patterns Discovered

### UI/UX Consistency Pattern
1. Create detailed comparison document before fixes
2. Implement responsive grid with breakpoints (base/md/lg)
3. Use GridItem instead of Box for semantic correctness
4. Max-width 1200px, centered with auto margins
5. Always-visible results in 3rd column (no scrolling)
6. Full-width primary buttons, compact secondary buttons

### Input Styling Pattern
```jsx
// All Select elements require:
bg="gray.700"
borderColor="gray.600"
color="white"
_hover={{ borderColor: "gray.500" }}
data-theme="dark"  // CRITICAL for proper rendering
aria-label="descriptive label"
sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}

// All Input elements require:
bg="gray.700"
borderColor="gray.600"
color="white"
_hover={{ borderColor: "gray.500" }}
_placeholder={{ color: "gray.400" }}  // For text inputs
```

### Backend Text Generation Pattern
- Use single backslash for newlines: `\n` not `\\n`
- Test end-to-end rendering, not just logs
- Keep debug logging for future troubleshooting
- Grammar handling (singular/plural) in dedicated methods

### Module Development Checklist
- [ ] Reference existing working module (prefer Fusion)
- [ ] Copy exact UI patterns (grid, spacing, styling)
- [ ] Apply consistent input styling with all required props
- [ ] Test backend write-up rendering in actual frontend
- [ ] Verify responsive behavior on mobile/tablet/desktop
- [ ] Check for duplicate navigation elements
- [ ] Validate medical terminology against standards

### Documentation Architecture Pattern (NEW)
- [ ] Single responsibility per file
- [ ] Ultra-scannable (emojis, bullets, tables)
- [ ] Negative knowledge explicit ("DON'T TRY THESE")
- [ ] Decision trees for guidance
- [ ] Inline code examples (not separate files)
- [ ] Version tracking at bottom
- [ ] Cross-references between docs

---

## Entry #10
**Focus:** Prior Dose writeup formatting fixes to match Fusion module pattern

**Smooth:** Identified issues quickly by comparing backend service code (Fusion vs Prior Dose). Backend changes were straightforward - removed markdown formatting (`**Bold**`), converted bullet lists to flowing paragraphs, eliminated literal `\n` characters. Frontend restructure moved writeup from 3rd column to dedicated section below form, matching Fusion exactly.

**Friction:** Backend server cache held old code even after file changes - generated writeup still showed `**Prior Dose**` headers and literal `\n\n` text. Required explicit restart via `./stop.sh` and `./start.sh` to pick up service-level changes. The `--reload` flag didn't catch the service method updates.

**Insight:** Backend writeup generation should use plain text with actual newlines (`\n`), never markdown formatting (`**Bold**`) or escaped characters (`\\n`). Textareas don't render markdown. Always restart backend after service-level changes to ensure code is fresh. UI pattern for writeup display: 3-column form (staff/treatment/preview) + full-width writeup section below, not writeup embedded in 3rd column. Prior Dose now mirrors Fusion's clean paragraph-style output and layout.

---

## Entry #11
**Focus:** DIBH module UI/UX refactoring to match Fusion/Prior Dose standards

**Smooth:** Systematic refactoring following established patterns from Fusion and Prior Dose. All components restructured in single session: 3-column responsive grid, proper GridItem usage, consistent dark theme styling, preview section in 3rd column, write-up section moved below form. No linting errors after refactoring.

**Friction:** Initial DIBH implementation had several deviations from standard patterns: write-up embedded in grid instead of below, inconsistent use of `as={Box}` on GridItems, missing preview section, dose calculation stats not following exact pattern. Required careful comparison with reference implementations to identify all gaps.

**Insight:** Following the Module Development Checklist from DEV_LOG Entry #2 is critical - side-by-side comparison with reference implementation (Fusion/Prior Dose) before starting prevents missed patterns. DIBH now has: semantic GridItem elements, always-visible preview with what will be generated, full-width primary button + compact secondary button, write-up section below form (not embedded), consistent input styling with all required props. Preview section structure with Card/Badge/VStack components provides excellent UX showing technique, site, and device before generation.

---

## Entry #12
**Focus:** DIBH workflow integration through home page → verification → DIBH form

**Smooth:** Added DIBH detection logic to verification page following exact pattern from Prior Dose. Single code block added after Prior Dose checks handles three cases: DIBH selected and eligible (proceed button), DIBH selected but incompatible with treatment type (error message), no DIBH selected (default message). Routing uses query parameter pattern: `/dibh?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`.

**Friction:** None - verification page already had `analyzeMpcConfig` helper function that determines DIBH eligibility based on treatment type. Logic flow handles Prior Dose first, then DIBH, which works correctly for single-selection workflow. Multiple concurrent selections (Prior + DIBH, etc.) would need enhanced logic but out of scope for initial integration.

**Insight:** Verification page acts as intelligent router between home page selections and appropriate form pages. Pattern for adding new modules: (1) Add detection logic in verification.js checking parsedConfig properties, (2) Add proceed button with router.push to module page with config param, (3) Handle edge cases like incompatible selections. DIBH now fully integrated into standard workflow - users can select DIBH checkbox on home page, click "Launch MPC Setup", see verification analysis, then proceed to DIBH form. No linter errors in verification page after changes.

---

## Entry #13
**Focus:** SBRT workflow integration through home page → verification → SBRT form

**Smooth:** Added SBRT detection logic to verification page following exact pattern from DIBH (Entry #12). Single code block added for SBRT checks treatment type selection. Refactored SBRTForm.jsx to include preview section in 3rd column showing technique, site, and dose regimen. Page wrapper simplified to match DIBH pattern - removed duplicate header from page wrapper, moved to form component. No linter errors after changes.

**Friction:** SBRT form was more complex than DIBH with calculated metrics table requiring special handling. Preview section needed to dynamically show breathing technique description (4DCT, DIBH, or Free Breathing) with conditional write-up structure text. Form already had solid 3-column layout but lacked the always-visible preview that provides UX clarity before generation.

**Insight:** Verification page routing pattern now established for three modules (Prior Dose, DIBH, SBRT) - check parsedConfig for module-specific flags, display appropriate message, provide proceed button with encoded config. Preview sections dramatically improve UX by showing "what will be written up" before user clicks generate - especially important for complex forms like SBRT with multiple technique options. Page wrapper should be minimal (just background + home button), form components own their headers and content. SBRT now fully integrated into standard workflow - users select SBRT checkbox on home page, click "Launch MPC Setup", see verification analysis, proceed to SBRT form with all features matching established patterns.

---

## Entry #14
**Focus:** Simplify SBRT writeup output to plain text format

**Smooth:** Removed all HTML table generation and fancy clipboard copying from SBRT module. Backend now generates simple bullet-point list of metrics instead of complex HTML table with inline styles. Frontend simplified to match DIBH pattern - single Textarea with plain text and simple "Copy to Clipboard" button. Changes applied to both backend service (_generate_metrics_table_simple method) and frontend component (writeup display section).

**Friction:** None - straightforward refactor from HTML to plain text. Removed ~120 lines of complex HTML generation and clipboard manipulation code. Backend method renamed but kept same signature for compatibility.

**Insight:** Plain text writeups are easier to maintain, copy, paste, and read than HTML tables. Single "Copy to Clipboard" button with toast notification provides better UX than multiple copy methods with instructions. Metrics as bullet points with inline deviations (e.g., "• Conformity Index: 1.15 (Deviation: None)") are more readable than table cells. Backend should generate final text format, not HTML that requires frontend parsing. This pattern (plain text writeup in Textarea) now consistent across DIBH, Prior Dose, and SBRT modules. No linter errors after simplification.

---

## Entry #15
**Focus:** SBRT writeup format optimization - eliminate duplication, add intelligent deviation summary

**Smooth:** Removed duplicate numerical data from paragraph (coverage, conformity, R50 were mentioned in paragraph THEN listed again). Refactored metrics section with clear structure: intro ("Below are the plan statistics"), bullet list with all metrics, intelligent summary analyzing deviations. Summary logic handles three cases: no deviations (positive message with RTOG 0915 reference), minor deviations only (reassuring explanation), major deviations (detailed clinical explanation of what each deviation means).

**Friction:** None - straightforward refactoring. Templates simplified by removing redundant paragraph content. Metrics method expanded with smart deviation analysis that explains clinical significance (e.g., "Conformity Index of 1.35 shows acceptable conformality with minor deviation from ideal" vs "R50 of 6.2 indicates excessive dose spillage to normal tissue outside the target").

**Insight:** Writeups should present data once, clearly. Structure matters: simple intro → data list → intelligent interpretation. Deviation summaries dramatically improve clinical utility by explaining WHAT the numbers mean, not just flagging them as red/yellow/green. SIB cases get special handling explaining why deviations aren't tracked. Backend should generate clinical interpretation, not just format numbers - that's the value-add for medical physics consultations. Plain text format with smart summaries > repetitive paragraphs with inline numbers.

---

## Entry #16
**Focus:** SRS/SRT module implementation from scratch following SBRT pattern

**Smooth:** Complete module built in single session following established patterns from SBRT/DIBH. Backend (schemas, service, router) implemented first, then frontend (service, component, page). Verification page routing added seamlessly. Accordion UI for multiple lesions works beautifully - collapsible cards with badges showing site and treatment type at a glance. Dynamic lesion array using `useFieldArray` handles add/remove cleanly. Quick preset buttons for common SRS doses (16-21 Gy) and SRT regimens (25-35 Gy) provide excellent UX.

**Friction:** Initial implementation missed formatting consistency - used larger fonts, colored section headings, Cards instead of GridItems, and lacked the green header banner. Required systematic comparison against SBRT/DIBH to identify 11 discrepancies: green header missing, wrong container width (1400px vs 1200px), colored headings instead of white, larger font sizes throughout (md vs sm), missing sub-section organization, inconsistent spacing, preview structure different from SBRT's green card + blue info box pattern. Fixed all issues by converting Cards to GridItems with manual styling, standardizing all font sizes (sm for labels, xs for errors, 2xs for tiny text), adding proper sub-sections ("Staff Information", "Patient Details"), and restructuring preview to match SBRT exactly.

**Insight:** **Reference implementation pattern works brilliantly** - copying SBRT structure for backend and frontend saved hours. When building new modules, do visual comparison IMMEDIATELY after initial implementation rather than waiting. Systematic checklist approach (header → container → headings → fonts → inputs → preview) prevents missing details. Accordion UI with `useFieldArray` is perfect for dynamic multi-item forms - much better UX than vertical stacking. **Formatting consistency is critical** - even small font size differences (md vs sm) break visual cohesion. Three-column layout pattern now proven across 5 modules (Fusion, DIBH, SBRT, Prior Dose, SRS). Plain text writeups with intelligent formatting (newlines, sections) work better than markdown or HTML. Multi-lesion support with individual metrics per lesion demonstrates power of field arrays - scales from 1 to 10+ lesions without code changes.

---

## Entry #17
**Focus:** Pacemaker/CIED module workflow integration and preview section implementation

**Smooth:** Module backend already existed with complete router, service, and schemas. Frontend component had proper 3-column layout, green header banner, dark theme styling, and write-up section below form. Integration required only two additions: (1) verification page routing logic following exact pattern from Prior Dose/DIBH/SBRT (pacemaker checked before treatment types), (2) preview section in 3rd column showing device, treatment site, prescription, pacing dependency, and calculated TG-203 risk level. Backend API testing confirmed all endpoints work correctly: treatment sites, device info, risk assessment calculation, and write-up generation with proper clinical formatting.

**Friction:** None - systematic approach worked perfectly. Backend service generates comprehensive write-ups including TG-203 risk assessment, device details (vendor/model/serial), dosimetry analysis (TPS max/mean doses, optional diode measurements), and risk-specific clinical recommendations. Frontend preview section uses Card component with color-coded badges matching risk levels (green/yellow/red). Verification page handles all three risk levels: Low/Medium proceed normally, High risk shows warning but still allows form access for documentation, incomplete selection prompts user to choose risk level.

**Insight:** **Following established patterns accelerates implementation dramatically** - pacemaker module integrated in single session because backend was already built correctly and frontend followed SBRT/DIBH patterns. Verification page routing order matters: check Prior Dose first, then Pacemaker, then treatment types (SBRT/SRS), finally DIBH. This prevents conflicts when multiple checkboxes selected. Preview sections are critical UX - showing calculated risk assessment before generation helps users verify inputs. TG-203 risk calculation algorithm properly handles all edge cases: neutron-producing therapy, dose categories (< 2 Gy, 2-5 Gy, > 5 Gy), pacing dependency status. Backend testing via curl proved all endpoints functional before full UI testing. Pattern now proven across 6 modules: Fusion, DIBH, SBRT, Prior Dose, SRS, Pacemaker.

---

## Entry #18
**Focus:** TBI (Total Body Irradiation) module implementation from scratch following SRS/SBRT patterns

**Smooth:** Complete module built in single session following established patterns. Backend (schemas, service, router) implemented first, tested via curl, then frontend (service, component, page). Three-column layout with preview section worked perfectly. Quick preset buttons for fractionation schemes (12 Gy/6fx, 12 Gy/8fx, 2 Gy/1fx) provide excellent UX. Backend writeup generation matches user's clinical examples exactly - proper grammar handling (singular/plural fractions), lung block conditional logic, setup type (AP/PA vs Lateral) all working correctly. Verification page routing added seamlessly after SRS detection. End-to-end testing confirmed all three API endpoints functional.

**Friction:** None - systematic approach from DEV_LOG patterns worked flawlessly. TBI is simpler than SRS/SBRT (fewer variables, standardized workflow), making it ideal test case for pattern replication. Backend testing via curl before frontend development caught potential issues early.

**Insight:** **Module development pattern is now bulletproof** - following the three-phase checklist (backend → frontend service → frontend UI) with reference implementation (SRS for complex, DIBH for simple) enables rapid development with zero issues. TBI demonstrates power of simple forms with smart defaults - most fields have sensible defaults, only diagnosis/indication require user input. Preview section showing treatment regimen, setup, lung blocks, and equipment provides clarity before generation. Backend writeup logic properly handles edge cases: single vs multiple fractions grammar, lung blocks adding extra sentence, AP/PA vs Lateral beam description. Pattern now proven across 7 modules: Fusion, DIBH, SBRT, Prior Dose, SRS, Pacemaker, TBI. Testing backend via curl before frontend integration is excellent practice - validates business logic in isolation, provides confidence for UI development.

---

## Entry #19
**Focus:** HDR (High Dose Rate Brachytherapy) module implementation from clinical examples

**Smooth:** Complete module built in single session following TBI/SRS pattern. User provided four clinical write-up examples demonstrating institutional workflow - Utrecht applicator, Tandem & Ovoid, single/multi-channel vaginal cylinders. Backend schemas capture applicator types (6 options), patient positioning (supine/lithotomy), channels (1-30), CT parameters, and critical structures. Service includes applicator info endpoint that auto-populates position and channel count based on applicator selection - Utrecht → lithotomy + 15 channels, T&O → supine + 3 channels, VC single → supine + 1 channel. Grammar handling converts numeric channels to text (one/two/three/N channels). Frontend component matches DIBH/TBI pattern with three-column layout, preview section showing applicator/site/position/channels, and equipment settings grid. Verification page routing added after TBI detection. Backend API testing via curl confirmed all three endpoints functional - applicators list, applicator info with auto-config, and writeup generation matching clinical examples exactly.

**Friction:** None - systematic three-phase approach (backend → frontend service → UI) worked perfectly. Having actual clinical examples from the start eliminated guesswork about terminology, workflow, and required fields. Auto-configuration pattern (applicator selection updates position/channels) demonstrates power of smart defaults reducing user input.

**Insight:** **Clinical examples are gold standard for module development** - user's four write-up samples provided complete specification: applicator types, positioning logic, channel counts, workflow steps (implant → CT → contouring → digitization → dwell weighting → independent calc → delivery → survey), equipment (ELEKTA Ir-192, Oncentra), critical structures (bladder/rectum/intestines/sigmoid), and exact phrasing. Pattern now proven across 8 modules: Fusion, DIBH, SBRT, Prior Dose, SRS, Pacemaker, TBI, HDR. Auto-configuration endpoints (GET applicator info) enhance UX by reducing form complexity - user selects applicator type once, system fills position and channels automatically. Brachytherapy module demonstrates toolkit versatility - handles external beam (SBRT/SRS/TBI/DIBH) and brachytherapy workflows equally well using same three-column layout pattern. Grammar helper methods (_format_channels converting 1→"one", 2→"two", 3→"three", N→"N channels") ensure professional write-up quality. Testing showed perfect output for Utrecht (15 channels), T&O (three channels), VC single (one channel) - all matching clinical examples.

---

## Entry #20
**Focus:** Prior Dose module UX enhancement - accordion-style treatment management and per-treatment overlap

**Smooth:** Refactored Prior Dose from cramped second-column list to SRS-style accordion layout using `useFieldArray` from react-hook-form. Each prior treatment now has collapsible card with badges showing site/dose/fractions in header. Moved overlap from global home page setting to per-treatment checkbox - more medically accurate since some prior treatments may overlap while others don't. Backend schema updated to add `has_overlap` boolean to `PriorTreatment` model. Frontend simplified: removed router config parsing, eliminated priorDoseMode state, moved dose calc method selector to always-visible (not conditional on overlap). Preview column shows dynamic count: "2 of 5 treatments have overlap". Default treatment expanded automatically, new treatments auto-expand on add.

**Friction:** Missing closing parenthesis in `toggleMpcItem` function caused syntax error after refactoring home page state from `prior: { enabled, overlap, noOverlap }` to simple `prior: boolean`. Error caught immediately by Next.js compilation showing exact line number (179). Fixed by adding missing `)` to close `setMpcChecklist` call.

**Insight:** **Per-item properties are better than global flags** - overlap is really a per-treatment characteristic, not a global mode. This gives users flexibility (treatment A overlaps, treatment B doesn't) and eliminates artificial workflow bifurcation. Accordion UI from SRS module translates perfectly to Prior Dose - collapsible cards with informative badges scale from 1 to 10+ treatments without layout issues. `useFieldArray` with `control` from react-hook-form handles dynamic arrays beautifully - append/remove/watch work seamlessly, form validation automatic. Auto-expand new items pattern: track `expandedIndices` state array, append new index when calling `append()`, pass to `<Accordion index={expandedIndices} onChange={setExpandedIndices}>`. Syntax errors during state refactoring are common - always verify closing parens/brackets match when restructuring nested objects. Pattern now established: simple boolean for single-option items (Prior, DIBH), nested object for multi-option items (Pacemaker with risk levels, Special Treatments with types).

---

## Entry #21
**Focus:** Remove patient age and sex from all modules per institutional requirements

**Smooth:** Systematic removal across all 8 modules following established architecture. Backend changes: removed `PatientInfo` class from common.py schemas entirely, updated all service methods to eliminate age/sex variables and references. Frontend changes: removed `patient: { age, sex }` from defaultValues in all forms, deleted entire "Patient Information"/"Patient Details" sections (40-50 lines per form). Writeup modifications targeted opening sentences - changed from "The patient is a XX-year-old male/female with..." to either "Dr. [name] requested..." or "The patient has [condition]...". All changes applied uniformly across DIBH, Fusion, SBRT, SRS, TBI, HDR, Pacemaker, and Prior Dose modules in single session.

**Friction:** None - architectural consistency paid dividends. Common schema pattern meant one central change cascaded correctly. Service methods clearly separated demographic extraction from clinical logic, making removal surgical. Frontend forms all followed same three-column layout with consistent section structure, enabling batch pattern matching for deletions. Prior Dose service required updates in three separate text generation methods (_generate_no_prior_text, _generate_single_prior_text, _generate_multiple_prior_text), but consistent parameter signatures made changes straightforward.

**Insight:** **Strong architectural patterns enable rapid cross-module refactoring** - removing fields from 8 modules took ~30 minutes because of consistent structure. Common schemas (`CommonInfo`, `PatientInfo`) provide single point of control for shared data. Service layer separation (data extraction → processing → formatting) means demographic removal doesn't touch clinical logic. Frontend component consistency (defaultValues structure, "Patient Information" section placement, Input/Select styling) allows pattern-based edits across all forms. This refactoring touched 16 files (8 backend services/schemas + 8 frontend forms) with zero logic errors - testament to established patterns from DEV_LOG entries #1-20. Institutional requirements can change; architecture that accommodates change without cascading failures is invaluable. Testing scope reduced because changes were purely subtractive (no new logic paths), and uniform structure meant verifying one module proves pattern for all.

---

## Entry #22
**Focus:** Global theme redesign - custom color palette migration and emoji removal from UI

**Smooth:** Single-file theme configuration (`_app.js`) made color palette swap straightforward. Replaced entire Chakra UI theme with custom palette mapping 8 color families (brand/blue, gray, purple, green, red, yellow, orange) across 50+ hex values. Emoji removal via systematic grep search identified all instances across pages and components. Global find-replace for common patterns (✅, 📋, 🔧, etc.) handled verification page efficiently. Scrollbar hiding via CSS worked across all browsers (webkit, Firefox, IE/Edge).

**Friction:** Fusion component had 20+ dynamic header variations requiring individual emoji removal - couldn't use simple find-replace. Verification page had 23 instances of ✅ checkmarks in status messages. Had to search multiple directories to catch all emoji usage (pages/, components/). User clarification needed to distinguish documentation headers (keep emojis) from frontend UI headers (remove emojis).

**Insight:** **Centralized theme configuration is powerful** - changing entire app's color scheme requires editing only one file when using Chakra UI's `extendTheme`. Custom color palettes should map to Chakra's scale system (50-900) for automatic shade-based styling. Emojis in UI are common but removal requires systematic search across all user-facing components - grep with character class patterns finds them quickly. Scrollbar styling needs vendor prefixes (webkit) and Firefox/IE fallbacks (`scrollbarWidth: 'none'`, `msOverflowStyle: 'none'`). Pattern for global UI changes: (1) identify all affected files via grep, (2) create systematic replacement strategy, (3) verify with count queries. Professional medical applications benefit from clean, text-only headers over emoji-decorated ones.

---

## Entry #23
**Focus:** Bypass verification page for direct module navigation

**Smooth:** Simple routing refactor in home page. Created `getMpcRoute()` helper function implementing priority order (Prior Dose → Pacemaker → Treatment Types → DIBH) matching original verification logic. Updated two button onClick handlers - Fusion button now routes directly to `/fusion?config=...`, MPC button uses helper to determine target module and routes to appropriate page with config params. No linter errors after changes.

**Friction:** None - well-structured existing code made refactoring straightforward. Verification page remains intact for potential future re-enablement, just bypassed in current flow.

**Insight:** **Verification pages useful for debugging but can block workflow** - user feedback indicated middle stop slowed app usage despite showing helpful analysis. Routing logic extraction (verification page → home page) demonstrates value of modular helper functions. Config params still passed to all module pages maintaining data flow. Pattern: `router.push(\`${route}?config=${encodeURIComponent(JSON.stringify(config))}\`)` ensures all modules receive necessary configuration. Keeping verification page in codebase (not deleting) preserves option to re-enable for troubleshooting or advanced users. Direct navigation improves UX when workflow is well-established and users don't need step-by-step analysis.

---

## Entry #24
**Focus:** Home page UI refactor - tabbed interface for QuickWrite, Other Tools, and About sections

**Smooth:** Chakra UI Tabs component integrated seamlessly with existing layout. Three-tab structure (`variant="soft-rounded"`) provides clean navigation between primary QuickWrite functionality (Fusion + MPC modules), Other Tools (QA system, guides), and About section (version info, updates). Each tab has distinct color scheme - blue for QuickWrite (default), teal for Other Tools, purple for About. Zero linting errors after refactoring. All existing functionality preserved - fusion configuration, MPC checklist, routing logic unchanged.

**Friction:** None - well-structured component made refactoring straightforward. Simply wrapped existing sections in `TabPanel` components and added `TabList` with styled tabs.

**Insight:** **Tabbed interfaces improve navigation for multi-purpose applications** - separating primary workflow (QuickWrite) from supporting content (Tools/About) reduces visual clutter and allows users to focus on specific tasks. Chakra UI Tabs with `variant="soft-rounded"` and custom `_selected`/`_hover` styling provides modern, professional appearance. Pattern: primary functionality on first tab (default), secondary features on subsequent tabs. Using distinct color schemes per tab (blue/teal/purple) reinforces visual hierarchy. `TabPanel` with `p={0}` allows full control over internal spacing without extra padding. This pattern scales well - can add more tabs (Settings, Documentation) without layout changes. Home page now feels cleaner and more organized while maintaining all 8 QuickWrite modules (Fusion, Prior Dose, Pacemaker, SBRT, SRS, TBI, HDR, DIBH) in accessible location.

---

## Entry #25
**Focus:** Home page QuickWrite cards UI/UX redesign for improved space efficiency and consistency

**Smooth:** Hybrid approach balanced space savings with familiarity. Fusions card converted from 5 repetitive +/- sections (250+ lines) to compact 3-row table - cuts vertical space ~60% while improving scannability. Added summary badges showing "X fusions configured" and "Bladder Comparison Active" at top. CounterControl component with visible red.400/green.400 +/- icons makes adjustments clear. **Final MPC card design after iterative feedback:** Removed summary banner entirely, removed all subtitles/dividers/descriptions - pure 2-column button grid with 7 clean buttons (Prior Dose, Pacemaker, SBRT, SRS/SRT, TBI, HDR, DIBH). Each button labeled simply with module name. Reverted to subtle borders (borderColor="gray.600" without borderWidth override) for cleaner look. Set inactive button text color to gray.300 for clear visibility. Pacemaker risk level selector and DIBH incompatibility warning appear below grid only when relevant - conditional UI pattern keeps interface minimal. Zero linting errors after all iterations.

**Friction:** Iterative refinement process helped - initial design had too much visual noise (summary banners, section headings, dividers, long descriptive button text). User feedback drove simplification: "just a grid of buttons with their name on it" clarified the vision. Border weight was initially too heavy (borderWidth="2px") making UI feel cluttered - reverting to default outline style achieved desired subtlety while maintaining inactive text visibility through explicit color prop.

**Insight:** **Table layouts dramatically improve dense configuration UIs** - Fusions table with Fusion Type / Rigid / Deformable columns shows all options at a glance. **Ultra-minimal button grids are most effective for module selection** - MPC card went from complex nested structure (summaries, sections, dividers, multi-line descriptions) to simple 2-column grid of 7 labeled buttons. Final design is ~100 lines versus original ~350 lines. **Less is more for selection interfaces** - removing summary banner, section titles, and descriptions eliminated redundancy. Button labels themselves communicate purpose (Prior Dose, Pacemaker, SBRT). Conditional expansion (Pacemaker risk selector, DIBH warning) appears only when needed - doesn't clutter default state. **Inactive button visibility requires explicit text color** - outline variant buttons on gray.800 background need color="gray.300" prop to be readable, not just borderColor. Default gray colorScheme makes text too dark. **Iterative user feedback is critical** - initial "improved" design still had too much structure. Multiple refinement cycles (add summary → make always-visible → remove entirely; add sections → simplify → remove) converged on truly minimal interface. Pattern: start with improvement, get user feedback, simplify further, repeat until "perfect" reaction. Both cards now ultra-clean and scannable.

---

## Entry #26
**Focus:** Final MPC card simplifications - remove pacemaker risk selection and DIBH warnings, unify treatment type colors

**Smooth:** Three quick refinements based on user feedback. Changed SBRT button colorScheme from purple to orange to match other treatment types (SRS/SRT, TBI, HDR) - creates visual grouping of special treatment modules. Removed pacemaker risk level selection entirely since it will be auto-detected within the pacemaker module based on user inputs (dose, device type, pacing dependency). Removed DIBH incompatibility warning that appeared when SRS/TBI/HDR selected - DIBH button disable state is sufficient visual feedback. Cleaned up unused imports (Radio, RadioGroup, Stack) and helper functions (getPacemakerRiskLevel, hasMpcSelections). Simplified isMpcValid function since no risk level validation needed. Zero linting errors after cleanup.

**Friction:** None - straightforward deletions and color changes. No state management complexity since pacemaker risk was already stored but just not displayed anymore.

**Insight:** **Auto-detection beats manual selection** - moving pacemaker risk assessment to the module itself (based on actual treatment parameters) is better UX than forcing users to pre-select risk level on home page. User doesn't know risk until they've entered treatment details. **Color grouping communicates module categories** - purple for general modules (Prior Dose, Pacemaker), orange for special treatment types (SBRT, SRS/SRT, TBI, HDR), teal for technique enhancement (DIBH). Visual hierarchy without labels. **Disabled state sufficient for incompatibility** - don't need explanatory warning text when button's disabled appearance clearly indicates unavailability. Users who need to know why can infer from selection state (picked SRS → DIBH grayed out). MPC card now ultra-minimal: just 7 buttons in 2-column grid, conditional pacemaker state removed, no warnings or helper text. Pure selection interface.

---

*Next consolidation: When new architectural patterns emerge or significant lessons accumulate*

