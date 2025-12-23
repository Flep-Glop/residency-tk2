# DEVELOPMENT LOG
*Linear session tracking - wiped and integrated into core docs periodically*

![Observatory View 1](../frontend/src/images/observatory1.png)
![Observatory View 2](../frontend/src/images/observatory2.png)

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

## 📦 ARCHIVE NOTICE (December 17, 2025)

**Entries #1-84 consolidated into static documentation:**
- Advanced UI patterns → `docs/static/PATTERNS.md` v1.1
- Module specifications → `docs/static/SPRITES.md` v1.1
- Known issues/status → `docs/static/STACK.md` v1.1
- Architectural decisions → `docs/static/ARCHITECTURE.md` v1.1

**Key milestones archived:**
- Entries #1-30: Foundation (Fusion, DIBH, Prior Dose, module patterns)
- Entries #31-48: QA automation (comprehensive test scripts for all modules)
- Entries #49-70: Prior Dose advanced features (dose statistics, constraints, fractionation)
- Entries #71-84: UI standardization (pixel font, cross-module consistency)

**Current entry counter:** Continue from #92

---

## Entry #85
**Focus:** SRS/SRT module UX redesign - centralized lesion setup and streamlined accordion

**Smooth:** Three key improvements completed in single session. (1) Moved volume to metrics section for cleaner left/right split. (2) Removed preset buttons from accordion panels to reduce visual clutter. (3) Centralized lesion setup in middle column - brain region dropdown + SRS/SRT button group + Add Lesion button. Users select region and type first, then click Add to create accordion item with values pre-filled.

**Friction:** Required state management for new lesion setup controls (`newLesionSite`, `newLesionType`) separate from react-hook-form since these are temporary values used to create new lesions.

**Insight:** **Centralized setup improves workflow clarity** - selecting brain region and SRS/SRT type upfront (before seeing accordion) makes the flow more intuitive: configure basics → add lesion → fill in details. **Accordion content focused on completion, not configuration** - with site and type already set when accordion item is created, accordion panels only show prescription and metrics. **Conditional section rendering reduces visual noise** - lesions section only renders when items exist. **State variables vs form fields pattern** - using useState for temporary input controls that feed into form field array separates "staging" data from "committed" form data cleanly.

---

## Entry #86
**Focus:** SRS/SRT module UX redesign - grid-based lesion selection matrix

**Smooth:** Replaced traditional workflow with innovative 2-column grid matrix. SRS and SRT as column headers, lesion rows appear as cells are clicked. Clicking "+ New SRS" or "+ New SRT" creates lesion with type pre-selected and input auto-focused for immediate site name typing. Removed brain region dropdown entirely - users type site names directly. Accordion headers updated to show typed site name.

**Friction:** None - incremental refinement based on user feedback. Initial implementation had 3-column grid with separate + button, simplified to pure 2-column where cells themselves are the add mechanism.

**Insight:** **Grid-based selection matrices provide superior UX for 2D choices** - when users need to assign both a category (SRS vs SRT) and a value (site name) to items, a grid where clicking creates the item AND selects the category in one action is more intuitive than sequential dropdown → button → dropdown workflows. **Cells as action triggers** - "+ New SRS" and "+ New SRT" cells serve dual purpose: visual affordance showing what will be created AND clickable action target. **Dynamic accordion titles improve scannability** - showing actual site names instead of generic labels helps users navigate multi-lesion forms quickly.

---

## Entry #87
**Focus:** SRS/SRT preset selection before site entry - two-step lesion creation with editable prescriptions

**Smooth:** Added intermediate preset selection step. When clicking "+ New SRS", users see 5 dose preset buttons (14, 16, 18, 20, 22 Gy). Selecting a preset creates the lesion with dose pre-filled, then shows site name input. **Enhanced with editable prescriptions** - after creation, the selected prescription displays as a clickable badge above the site input. Clicking reopens preset menu to change prescription. **Streamlined accordion panels** - removed Prescription section, removed Rx Isodose field, redistributed 5 metrics into horizontal responsive grid.

**Friction:** Backend still requires `prescription_isodose` field - added default value (80) in submit handler rather than modifying backend schema. Keeps backward compatibility while simplifying UI.

**Insight:** **Two-step workflows reduce errors and speed up common cases** - most SRS cases use standard doses, so pre-selecting eliminates manual entry for 80%+ of cases. **Clickable display enables non-destructive editing** - showing prescription as a badge that reopens preset menu lets users change selection without deleting and re-adding the lesion. **Horizontal metric layouts maximize space efficiency** - 5-column grid on large screens shows all metrics in single row. **Hidden defaults for backend compatibility** - when UI removes a field but backend still requires it, adding default in submit handler is cleaner than schema changes.

---

## Entry #88
**Focus:** SRS/SRT module UI polish - layout optimization, button styling, and validation fix

**Smooth:** Six refinements completed. (1) Two-column spanning layout - Lesion Selection spans columns 2-3 for more horizontal space. (2) Delete button relocated to accordion header beside expand icon with `e.stopPropagation()`. (3) Delete button styling matched Reset Form (red theme). (4) Removed accordion heading badges for cleaner appearance. (5) Centered lesion name inputs. (6) Empty statistics by default - users fill in actual plan metrics.

**Friction:** Empty default values caused 422 errors on submission - fixed by enhancing `onSubmit` processor with fallbacks for empty fields and NaN values.

**Insight:** **Column spanning provides layout flexibility** - using `colSpan` instead of changing grid template means same structure works for asymmetric layouts. **Header actions reduce accordion depth** - putting Delete in header means users can remove lesions without expanding. **e.stopPropagation() essential for header buttons** - without it, clicking Delete also toggles accordion. **Empty defaults require submit-time validation** - when UI allows empty fields for UX but backend requires values, onSubmit processor must provide sensible fallbacks.

---

## Entry #89
**Focus:** SRS/SRT module cross-module audit and pattern alignment fix

**Smooth:** Comprehensive comparison against all 7 other production modules confirmed SRS is aligned with established patterns. Identified one structural issue: writeup display section was inside `<form>` tag unlike other modules. Fixed by moving writeup outside form with proper spacing.

**Friction:** None - systematic comparison made identification straightforward.

**Insight:** **Cross-module audits confirm pattern alignment** - SRS's grid-based lesion selection and preset workflow are improvements, not deviations. **Accordion panels use `gray.750` for subtle distinction** - intermediate shade between gray.700 (inputs) and gray.800 (form background) creates visual hierarchy. This is intentional design for accordion-based modules. **Writeup section placement matters for form semantics** - keeping it outside `<form>` ensures read-only display doesn't interfere with form submission.

---

## Entry #90
**Focus:** UI consistency fixes - dropdown placeholders and MPC mutual exclusivity

**Smooth:** Three refinements. (1) DIBH dropdown placeholders cleared. (2) Prior Dose month dropdown changed from "January" default to empty with validation. (3) SBRT redundant subheading removed. (4) General MPC mutual exclusivity - clicking a new option automatically deselects the previous one.

**Friction:** None - established patterns made changes straightforward.

**Insight:** **Mutual exclusivity simplifies UX and code** - when only one option can be selected, users don't need to manually deselect before selecting another. Code becomes cleaner: define cleared state once, then set only selected option. **Empty dropdown placeholders prevent false defaults** - users must explicitly choose values rather than accidentally submitting with unintended defaults.

---

## Entry #91
**Focus:** Truncate "What's New" changelog to most recent update only

**Smooth:** Removed 9 historical update entries from `version.js`, keeping only latest v2.4.1 release. UpdateNotification component already handles single-update display correctly.

**Friction:** None - straightforward array truncation.

**Insight:** **Changelog maintenance improves UX** - long update histories create scroll fatigue in notification panels. Users care about what's new now, not what changed 10 versions ago. Historical context preserved in DEV_LOG for developers, while user-facing changelog stays focused on recent changes. Pattern: keep 1-3 most recent updates in version.js, archive history in documentation.

---

## Entry #92
**Focus:** Pacemaker module bug fixes and clinical accuracy refinements

**Smooth:** Seven interconnected improvements completed in single session. (1) Backend now always recalculates risk level from scratch and blocks high-risk writeup generation with explicit error. (2) Distance from CIED buttons reorganized into single 4-column row for cleaner layout. (3) Removed redundant recommendations section from risk assessment display - already included in writeup. (4) Device description simplified to vendor + model only, removing serial number logic. (5) Distance button text changed from "Within 3 cm" to "< 3 cm" for consistency. (6) Medium risk follow-up schedule updated to "at 1 and 6 months" instead of "within 1 month". (7) Manufacturer recommendations section completely revised to reference TG-203 guidelines instead of assuming manufacturer-specific protocols.

**Friction:** Original manufacturer section made three problematic assumptions: guidelines exist, we're following them, and no dose tolerance provided. Required clinical discussion to determine appropriate language that's both accurate and defensible.

**Insight:** **Backend must never trust frontend-calculated risk levels** - timing issues between form updates can cause stale data. Always recalculate critical values from source data. **High-risk cases should block at generation** - throwing explicit error prevents writeup creation for cases requiring cardiologist consultation. **Clinical writeups must be defensible** - avoid claiming to follow manufacturer guidelines when device-specific protocols may not be accessible. Referencing universal standards (TG-203) is more accurate. **Serial numbers add no clinical value to writeups** - vendor + model sufficient for documentation. **Follow-up schedules must match TG-203 precisely** - medium risk requires 1-month AND 6-month interrogation, not just 1-month.

---

## Entry #93
**Focus:** New neurostimulator module - separate from pacemaker for clinical accuracy

**Smooth:** Full module built following established patterns. Backend: schemas, service, router at `/api/neurostimulator`. Frontend: service, form component, page. Key design decision: separate module rather than extending pacemaker because (1) no pacing dependency field - neurostimulators don't have cardiac pacing concerns, (2) simpler risk assessment - dose-only based without TG-203 pacing dependency factor, (3) different device ecosystem - SCS/DBS/VNS device types with vendors like Nevro, Axonics, Stimwave alongside Medtronic/Boston Scientific/Abbott neuromodulation divisions, (4) different consulting specialist - neurologist vs cardiologist.

**Friction:** Initial page template had navigation bar structure that didn't match other modules. Fixed to use simple positioned Home button pattern consistent with pacemaker, DIBH, SBRT pages. Removed subtitle from header to match pacemaker styling exactly.

**Insight:** **Separate modules for clinically distinct device categories** - even when devices share some characteristics (implanted electronics, radiation dose concerns), clinical workflow differences justify separate modules: different risk factors, different specialists, different write-up language. **Simpler risk stratification for non-cardiac devices** - without pacing dependency, neurostimulator risk is purely dose-based: < 2 Gy (low), 2-5 Gy (medium), > 5 Gy or neutron (high). **Module template consistency** - page structure (positioned Home button), form header (colored box with single heading), and form layout (3-column grid) should match across all modules. **Device type dropdown adds clarity** - for neurostimulators, knowing SCS vs DBS vs VNS matters for write-up context more than exact model number.

---

## Entry #94
**Focus:** HDR consolidation, UI polish, and DIBH writeup cleanup

**Smooth:** Five interconnected polish improvements completed in single session. (1) HDR applicators consolidated - Geneva and Utrecht merged into single "Hybrid T&O" button with unified backend handling. (2) HDR physician list trimmed from 7 to 3 (Kluwe, Le, Lewis) for operational accuracy. (3) HDR channel validation enhanced - dynamic max values per applicator type (SYED-Prostate: 19, SYED-Gyn: 55, Hybrid T&O: 13, default: 30). (4) DIBH boost writeup cleaned - removed redundant "for a total dose of X Gy in Y fractions" text when boost is specified. (5) "Ultimate" descriptors removed - changed fusion module and verification page from "Ultimate Fusion" to "Fusion" or "Three-modality fusion" for professional polish.

**Friction:** None - straightforward text and validation changes across frontend and backend.

**Insight:** **Applicator consolidation reduces cognitive load** - Geneva and Utrecht applicators produce nearly identical writeups, so merging them into generic "Hybrid T&O" simplifies selection without losing clinical accuracy. **Dynamic validation per selection improves UX** - max channel limits vary by applicator type (13-55 range), so using function to compute limits based on selection prevents user errors and provides accurate feedback. **Descriptive language evolution during polish** - "Ultimate" and superlatives appropriate during development for marking advanced features, but production UI benefits from professional, factual language ("three-modality fusion" instead of "ultimate fusion"). **Trimming redundant summary text improves writeup clarity** - when boost already shows individual dose components, recalculating and displaying total adds no clinical value and creates visual clutter. **Staff list maintenance requires operational input** - physician roster reflects actual clinic staffing, not just alphabetical listing of department members.

---

## Entry #95
**Focus:** UX improvements across HDR and pacemaker modules - layout refinement and button ordering

**Smooth:** Two targeted improvements completed. (1) HDR VC button now spans both columns in first row for visual prominence - single-channel applicator gets full width since it's most common use case. (2) Pacemaker pacing dependency order swapped - "Independent" now appears first since it's more common clinically.

**Friction:** None - all changes cleanly integrated with existing patterns.

**Insight:** **Column spanning improves visual hierarchy** - when one option dominates usage (VC applicator for HDR), giving it more visual space reduces decision fatigue. **Default ordering reflects clinical frequency** - placing most common options first (independent pacing) reduces clicks for typical cases.

---

## Entry #96
**Focus:** TBI lung block UX redesign - inline HVL selection pattern and pacemaker automation rollback

**Smooth:** Two major UX changes. (1) TBI lung blocks section hidden but column structure preserved - third GridItem kept with borderWidth="0" and bg="transparent" following fusion module pattern for layout consistency. (2) Inline HVL selection added - clicking 6fx or 8fx regimen buttons reveals dropdown panel below button (similar to SRS prescription pattern) with three HVL options (1/2/3 HVL). Single fraction regimens (2 Gy, 4 Gy) auto-set lung_blocks to "none" without showing selection. (3) Pacemaker automation reverted - brain/prostate distance auto-setting removed pending refinement.

**Friction:** Initial implementation deleted third column entirely rather than hiding it - corrected to preserve 3-column grid structure with invisible third column.

**Insight:** **Layout structure should persist even when content is hidden** - keeping empty GridItem with transparent styling maintains responsive breakpoints and prevents layout shifts if column needs to be revealed later. **Inline selection reduces visual complexity** - hiding tertiary options (lung blocks) until primary choice is made (fractionation) prevents decision paralysis. **Contextual UI reveals improve workflow** - when 6fx/8fx selected, HVL choice appears immediately below in attached panel, creating clear cause-effect relationship. **Button border radius manipulation creates visual continuity** - setting borderBottomRadius to 0 when panel is open makes button and dropdown appear as single unified component. **Implicit vs explicit defaults** - single fraction regimens don't need lung blocks (clinical standard), so auto-setting to "none" without UI element is cleaner than showing disabled option. **Feature rollback is valid iteration** - removing pacemaker automation acknowledges that "obvious" clinical rules often have edge cases requiring more nuanced implementation.

---

## Entry #97
**Focus:** Cross-module input standardization - labels and placeholders

**Smooth:** Two comprehensive sweeps completed. (1) Label standardization - all dose/fraction inputs now use concise labels: "Dose (Gy)", "Fx", "Rx (Gy)", "Boost (Gy)", "Boost Fx". Changed across Prior Dose, DIBH, Pacemaker, SBRT, Neurostimulator modules. (2) Placeholder standardization - all number inputs now show example values (like SRS pattern): "50" for dose, "25" for fractions, "0.5" for max dose, "2020" for year. Text inputs use "e.g., [example]" format: "e.g., Left Lung", "e.g., Prostate", "e.g., Adrenal".

**Friction:** SRS had multiple identical placeholder strings requiring unique context to replace individually.

**Insight:** **Concise labels reduce cognitive load** - "Fx" is universally understood in RT context and saves horizontal space. **Example placeholders guide without instructing** - showing "50" is faster to parse than "Enter dose value". **Consistent placeholder patterns across modules** - number inputs get values, text inputs get "e.g.," format. This creates predictable UX regardless of which module user is in.

---

## Entry #98
**Focus:** Prior Dose module UX redesign - SRS-style grid pattern for treatment selection

**Smooth:** Complete module redesign applying SRS/SRT grid pattern to Prior Dose workflow. (1) Three-column layout preserved: Staff Info (1 col) + Treatment Selection (spanning 2 cols). (2) Current Treatment as special header row inside Treatment Selection grid with green styling, containing Site, Dose, Fx, and Dose Calc [Raw|EQD2] buttons in single horizontal row. (3) Prior Treatments in 2-column OVERLAP | NO OVERLAP grid - orange for overlap, gray for no overlap. (4) Click-to-add flow: click "+ New with Overlap" → shows [DICOMs ✓] [No DICOMs] buttons → select DICOM status → creates treatment row. (5) Clickable DICOM badges - click to toggle between available/unavailable. (6) Toggle overlap by clicking opposite column cell - treatment moves between columns. (7) Inline fields in compact layout: Site dropdown + Dose/Fx + Month/Year all visible without accordion.

**Friction:** Initial 2-column layout broke visual consistency with other modules. Fixed by making Treatment Selection span 2 columns while keeping 3-column base grid.

**Insight:** **Grid patterns translate across clinical contexts** - SRS's OVERLAP/NO OVERLAP columns serve same purpose as SRS/SRT columns: binary classification that drives downstream logic. **Badge-button toggle pattern reusable** - DICOM status uses same clickable badge → button row → selection → badge pattern as SRS prescription editing. **Current treatment as header row** - placing current treatment inside Treatment Selection grid (rather than separate column) creates visual hierarchy: current is special, priors are grid items. **Spanning columns preserves layout** - using `colSpan={{ base: 1, lg: 2 }}` keeps 3-column structure while giving Treatment Selection more space. **Inline compact forms reduce clicks** - no accordion needed when all fields fit in grid cell with good visual density.

---

## Entry #99
**Focus:** Prior Dose constraint selection - simplify to current site only

**Smooth:** Constraints now auto-populate based solely on the current treatment site, not prior treatment sites. This aligns with clinical reality: we're evaluating OARs in the region being treated NOW. Prior treatment info is used for dose summation (cumulative dose calculation), but constraint selection is site-specific to the current treatment.

**Friction:** None - straightforward simplification that removed complexity rather than adding it.

**Insight:** **Constraints are about current treatment location, not prior locations.** If treating prostate now after prior brain RT, you need prostate-region constraints (rectum, bladder, femoral heads) because that's where dose is being delivered. Prior brain constraints aren't relevant to the current treatment region. The prior dose VALUE matters for cumulative calculation, but the CONSTRAINTS to check are determined by current anatomy at risk. This simplification makes the UI cleaner and the clinical logic more intuitive.

---

## Entry #100
**Focus:** Prior Dose UI standardization - validation patterns and color consistency

**Smooth:** Three improvements completed. (1) Constraint validation message now appears only on submit attempt (like all other form fields) instead of being permanently visible. Added `showConstraintError` state that triggers on failed validation. (2) Standardized all colors to blue/gray palette - removed non-standard green/orange throughout. Module header, buttons, borders now use blue.900/blue.700. Grid cells use gray.750/gray.800 with blue.500 borders for overlap state. (3) OVERLAP and NO OVERLAP headers now identical gray.700 instead of orange vs gray.

**Friction:** None - systematic find-and-replace of color values. Pattern already established in other modules made this straightforward.

**Insight:** **Validation messages should appear on-demand, not persistently** - showing "(at least one required)" permanently adds visual clutter for state that may never be invalid. Conditional error display on submit attempt follows established form validation patterns across all modules. **Color standardization improves professional appearance** - orange/green accent colors appropriate during development, but production UI benefits from consistent blue/gray palette. Blue indicates selected/active state, gray provides structure. **Header color consistency reduces cognitive load** - when grid headers are identical color, users focus on content (overlap vs no overlap) rather than being distracted by color differences.

---

## Entry #101
**Focus:** Prior Dose UX simplification - button-based selections and text input for sites

**Smooth:** Three UX improvements completed. (1) Staff dropdowns replaced with 2-column Grid button layouts. Physicians: Tuli (full width spanning both columns at top), then Dalwadi|Galvan, Ha|Kluwe, Le|Lewis. Physicists: Papanikolaou (full width spanning both columns at top), then Bassiri|Kirby, Paschal|Rasmussen. Size "sm" for better clickability. Selected button shows blue solid, unselected show gray outline. (2) Month dropdown replaced with three-button group: early/mid/late. Uses Controller pattern with HStack similar to Raw/EQD2 buttons. Applied to both OVERLAP and NO OVERLAP sections with appropriate background colors (gray.700 vs gray.600). (3) Site dropdown converted to text input field. Users now type site names directly instead of selecting from preset list. Different placeholder examples for overlap ("e.g., Brain") vs no overlap ("e.g., Prostate") sections.

**Friction:** None - backend accepts string values for all fields, so no schema changes needed.

**Insight:** **Full-width buttons at top create visual hierarchy** - placing Tuli and Papanikolaou first with full column span immediately draws attention to most frequently selected options. Grid structure maintains clean alignment even with mixed button widths. **Grid layouts enable consistent button sizing with column spanning** - using GridItem colSpan={2} creates visual prominence while maintaining 2-column structure for other names. All buttons same height for clean alignment. **Button groups superior to dropdowns for small fixed lists** - clicking visible options is faster than opening dropdown, scanning, and clicking. Staff selection becomes one-click instead of two-click. **Button groups reduce selection fatigue for tertiary fields** - when exact month doesn't matter clinically (just approximate timeframe), three buttons are faster than 12-option dropdown. **Text inputs increase flexibility** - typing site names allows for custom descriptions ("Left Upper Lobe") without being constrained by preset vocabulary. **Remove dropdowns that don't provide value** - if preset options aren't being used for downstream logic (validation, constraint auto-population), text input is simpler. **Consistent placeholder patterns guide without restricting** - "e.g., [example]" format shows expected input type while allowing any value.

---

## Entry #102
**Focus:** Cross-module staff button rollout - 2-column grid layout applied to all 9 modules

**Smooth:** Successfully migrated staff selection from dropdowns to button grids across all modules. Updated: Fusion, DIBH, HDR, Pacemaker, Neurostimulator, SBRT, SRS, TBI, Prior Dose (9/9). Each module follows identical pattern: (1) Added Controller to react-hook-form imports. (2) Replaced physician/physicist Select dropdowns with Grid-based button layouts. (3) Physician section: Tuli (full width) at top, then Dalwadi|Galvan, Ha|Kluwe, Le|Lewis in 2-column rows. (4) Physicist section: Papanikolaou (full width) at top, then Bassiri|Kirby, Paschal|Rasmussen in 2-column rows. (5) All buttons size "sm" with blue solid (selected) or gray outline (unselected). No linter errors across any module.

**Friction:** None - established pattern from Prior Dose Entry #101 made systematic rollout straightforward. Used parallel grep searches to locate staff sections efficiently across all modules.

**Insight:** **Standardized patterns enable rapid cross-module improvements** - once pattern proven in one module (Prior Dose), applying to 8 remaining modules takes <30min with systematic approach. **Button-based staff selection provides superior UX** - all visible options, one-click selection, clear selected state, responsive 2-column grid. **Visual hierarchy through column spanning** - placing frequently-selected staff (Tuli, Papanikolaou) at top with full width creates clear visual priority. **Controller pattern handles button groups elegantly** - React Hook Form's Controller provides clean integration for button-based selection without complex state management. **Cross-module consistency improves user confidence** - when staff selection works identically in all 9 modules, users develop muscle memory and trust the interface.

---

## Entry #103
**Focus:** SBRT module UX redesign - SRS-style grid selection with inline expansion

**Smooth:** Complete redesign applying SRS/SRT proven pattern to SBRT workflow. (1) Three-column layout: Staff Info (1 col) + Treatment Selection (spanning 2 cols). (2) Site grid with 6 buttons: Liver, Prostate, Breast, Kidney, Pancreas, Bone/Spine, plus "+ Other..." option. All sites use consistent green styling instead of multi-color. (3) Click-to-expand flow: click site button → inline expansion panel appears with Technique buttons (Free Breathing | 4DCT | DIBH), Treatment Type buttons (Standard | SIB), PTV name input, Dose/Fx inputs. (4) Conditional fields: Bone/Spine shows "Level/Location" input (e.g., T11-L1, Femur), "+ Other..." shows "Site Name" input (e.g., Adrenal). (5) Plan Metrics section below with 6-field horizontal grid. (6) Dead field removal: deleted unused `oligomet_location` field from schema and service. (7) Backend updated: added breast and pancreas to treatment sites list with appropriate dose constraints and fractionation schemes.

**Friction:** Initial multi-color design (purple liver, pink breast, etc.) created visual inconsistency - changed all sites to green for cohesion with module header.

**Insight:** **Grid-based site selection works for single-target treatments** - even though SBRT typically has one target (unlike SRS's multi-lesion pattern), the site grid + inline expansion creates a cleaner workflow than dropdown + checkbox combinations. **Inline expansion reduces cognitive load** - hiding technique/SIB/dose options until site is selected focuses user attention on one decision at a time. **Conditional field rendering maintains simplicity** - only showing "Level/Location" for Bone/Spine or "Site Name" for custom sites keeps the UI uncluttered. **Consistent color schemes reduce decision fatigue** - multi-color buttons look playful but can distract from clinical workflow; uniform green matches module header and maintains professional appearance. **Dead code cleanup improves maintainability** - removing unused `oligomet_location` field that was never referenced in any writeup template reduces schema complexity. **Treatment site expansion follows clinical need** - adding breast (partial breast irradiation) and pancreas extends SBRT coverage beyond original lung/liver/prostate/spine/bone/kidney set.

---

## Entry #104
**Focus:** SBRT module UX polish - inline expansion attached to site buttons (SRS pattern)

**Smooth:** Restructured site selection to match SRS/TBI inline expansion pattern. (1) Each site button now wrapped in VStack with expansion panel attached directly below it. (2) When clicking Liver, Prostate, etc., expansion with Technique (FB, 4DCT, DIBH) and Treatment Type (Std, SIB) buttons appears seamlessly attached to THAT button - not in a separate panel below the grid. (3) Bone/Spine shows additional location input ("e.g., T11-L1") in its expansion. (4) "+ Other..." shows custom site name input in its expansion. (5) Expansion has matching green border connecting it to the selected button via `borderBottomRadius={0}` on button and `borderBottomRadius="md"` on panel. (6) Added `isSIB = null` initial state for explicit selection validation.

**Friction:** Initial implementation placed expansion panel below entire site grid, separating it visually from clicked button. User feedback clarified that SRS pattern shows options WITHIN/attached to the clicked cell. Restructured using VStack per site cell to attach expansion directly below each button.

**Insight:** **Inline expansion requires per-item wrapping** - to attach expansion to a specific grid item, each item needs its own VStack container. Grid alone can't conditionally insert content below specific cells. **Border styling creates visual continuity** - matching border colors and removing bottom radius from button when expanded makes button+panel appear as single unified component (TBI lung block pattern). **Compact inline options reduce cognitive load** - technique and treatment type buttons appearing directly under site button eliminate need to scan separate form sections. User's eye stays focused on the selected site area.

**Follow-up:** Moved ALL fields (PTV Name, Dose/Fx, SIB Comment) into each site's inline expansion. Now each site button contains complete lesion configuration: Technique → Treatment Type → SIB Comment (conditional) → PTV Name → Dose/Fx. This self-contained structure lays foundation for future multi-lesion support (like SRS's useFieldArray pattern) - each site expansion would become an independent lesion entry.

---

## Entry #105
**Focus:** SBRT data validation - comprehensive numeric and physics constraints

**Smooth:** Three-layer validation implemented to prevent clinically impossible values. (1) **Frontend minimum validation** - added `min: { value: 0.01, message: '> 0' }` to 5 Plan Metrics fields that were missing validation: Vol at Rx, 100% Vol, 50% Vol, Dmax 2cm, Dmax Target. (2) **Frontend cross-field validation** - added physics constraint checks in onSubmit: V50 must be > V100 (hard error), V100 should be ≥ PTV volume (warning only). (3) **Backend safety net** - added individual field validators for all metrics (positive number checks) plus root_validator to enforce V50 > V100 relationship at API level.

**Friction:** Initial issue discovered through user testing - Gradient Index calculating to 0 when V50 = V100 = 25 cc. This is physically impossible because 50% isodose volume MUST encompass 100% isodose volume. Simple positive-number validation wasn't sufficient; needed relationship validation between fields. Root validator syntax required `root_validator` decorator (not `@validator` with multiple fields).

**Insight:** **Medical physics requires relationship validation, not just range validation** - individual fields being positive isn't enough when physics dictates relationships between values. Gradient Measure formula `GI = ∛(3·V50/4π) - ∛(3·V100/4π)` produces 0 when volumes are equal, masking data entry errors. **Three validation layers provide defense in depth** - (1) Frontend prevents most errors with immediate feedback, (2) Frontend cross-field checks catch relationship violations before API call, (3) Backend validators provide safety net if frontend bypassed. **Hard errors vs warnings for clinical context** - V50 ≤ V100 is hard error (physically impossible), V100 < PTV is warning (may indicate poor coverage but could be intentional in some edge cases). **Pydantic root_validator enables cross-field validation** - accessing multiple values in same validator allows enforcement of inter-field constraints that individual field validators cannot check.

---

## Entry #106
**Focus:** Staff selection order swap - physicists above physicians across all modules

**Smooth:** Systematic swap completed across all 9 modules (Fusion, DIBH, HDR, Pacemaker, Neurostimulator, SBRT, SRS, TBI, Prior Dose). Each module followed identical pattern: moved entire Physicist FormControl block above Physician FormControl block while preserving all button layouts, styling, validation, and error messaging. Zero linter errors after completion.

**Friction:** None - established staff button pattern from Entry #102 made identification straightforward. Large but repetitive changes across 9 files executed cleanly with careful attention to maintaining exact indentation and structure.

**Insight:** **Cross-module consistency enables rapid systematic changes** - when all modules implement identical patterns (2-column button grids, Controller integration, validation structure), making universal changes becomes mechanical rather than exploratory. **Order matters for workflow ergonomics** - placing physicist selection first aligns with clinical reality that physicist typically initiates writeup generation workflow before physician review. **Pattern standardization pays dividends** - Entry #102's button grid rollout created foundation that made this order swap trivial across 9 modules in single session.

---

*Next entry: #107*

*Next consolidation: Reached #100 milestone - consolidate entries #92-106 when convenient*
