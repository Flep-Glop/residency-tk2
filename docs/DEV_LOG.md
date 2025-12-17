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

*Next entry: #94*

*Next consolidation: When entries accumulate to ~100 or significant patterns emerge for migration*
