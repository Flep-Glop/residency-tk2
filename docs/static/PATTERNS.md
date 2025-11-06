# MEDICAL PHYSICS TOOLKIT PATTERNS
*What works, what doesn't, and how to implement successfully*

## MODULE DEVELOPMENT WORKFLOW

### Reference Implementation Rule
```
Building new module? → Copy Fusion structure
├─ Fusion is gold standard (1,722 lines, battle-tested)
├─ All edge cases handled
├─ Proven UI patterns
└─ If Fusion doesn't do it, you probably shouldn't either
```

### Three-Phase Checklist
- [ ] **Phase 1: Backend**
  - [ ] Create Pydantic schemas in `schemas/`
  - [ ] Implement service logic in `services/`
  - [ ] Add API router in `routers/`
  - [ ] Test via Swagger UI (http://localhost:8000/docs)
- [ ] **Phase 2: Frontend Service**
  - [ ] Create API client in `services/`
  - [ ] Error handling and response parsing
- [ ] **Phase 3: Frontend UI**
  - [ ] Copy Fusion's component structure
  - [ ] Apply dark theme styling patterns
  - [ ] Implement 3-column responsive grid
  - [ ] Add always-visible results panel
  - [ ] Test on mobile/tablet/desktop

---

## INPUT STYLING (DARK THEME)

### Select Components
✅ **REQUIRED styling for all Select elements:**
```jsx
<Select
  bg="gray.700"
  borderColor="gray.600"
  color="white"
  _hover={{ borderColor: "gray.500" }}
  data-theme="dark"  // CRITICAL: Without this, dropdowns render wrong
  aria-label="descriptive label"
  sx={{
    '& option': {
      backgroundColor: 'gray.700',
      color: 'white',
    }
  }}
>
  <option value="..." style={{ backgroundColor: '#2D3748', color: 'white' }}>
    Option Text
  </option>
</Select>
```

### Input Components
✅ **REQUIRED styling for all Input elements:**
```jsx
<Input
  bg="gray.700"
  borderColor="gray.600"
  color="white"
  _hover={{ borderColor: "gray.500" }}
  _placeholder={{ color: "gray.400" }}  // For text inputs
  type="number"
/>
```

### Why data-theme="dark" Matters
Chakra UI Select components require explicit `data-theme="dark"` to properly render dark backgrounds, even when `bg` color is specified. Missing this causes invisible dropdowns.

---

## BACKEND TEXT GENERATION

### Newline Handling
✅ **CORRECT:**
```python
text = f"Line one\nLine two\n\nParagraph break"
# Single backslash = actual newline
```

❌ **WRONG:**
```python
text = f"Line one\\nLine two\\n\\nParagraph break"
# Double backslash = literal "\n" text
```

**Why it matters:** Backend logs show proper formatting regardless, but frontend displays literal "\n" when escaped.

### Grammar Rules

#### Articles
✅ **CORRECT:** "An MRI" (pronounced "em-ar-eye" starts with vowel sound)  
❌ **WRONG:** "A MRI"

✅ **CORRECT:** "An external MRI study was imported"  
❌ **WRONG:** "A MRI study was imported"

#### Singular/Plural Handling
```python
def get_study_text(count: int, modality: str) -> str:
    if count == 1:
        article = "An" if modality == "MRI" else "A"
        return f"{article} {modality} study was"
    else:
        return f"{count} {modality} studies were"
```

#### Terminology
✅ **CORRECT:** "deformable registration"  
❌ **WRONG:** "deformable enhancement"

✅ **CORRECT:** "The planning CT and imported CT image sets"  
❌ **WRONG:** "The CT and CT image sets"

### Testing Pattern
```python
# 1. Write backend service method
# 2. Test via Swagger UI
# 3. Verify in ACTUAL FRONTEND DISPLAY (not just logs)
# 4. Backend logs lie - frontend is source of truth
```

---

## FORM VALIDATION PATTERNS

### React Hook Form Setup
```jsx
const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
  defaultValues: {
    common_info: {
      physician_name: "",
      physicist_name: "",
      // ...
    },
    module_data: {
      // module-specific fields
    }
  }
});
```

### Dynamic Arrays with useFieldArray
✅ **PREFERRED for dynamic lists:**
```jsx
const { fields, append, remove } = useFieldArray({
  control,
  name: "module_data.registrations"  // or "prior_treatments", etc.
});

// Add item
<Button onClick={() => append({ modality: "MRI", method: "rigid" })}>
  Add Registration
</Button>

// Display items
{fields.map((field, index) => (
  <Box key={field.id}>
    <Input {...register(`module_data.registrations.${index}.modality`)} />
    <Button onClick={() => remove(index)}>Remove</Button>
  </Box>
))}
```

❌ **AVOID manual state management outside form:**
```jsx
// This creates validation issues
const [items, setItems] = useState([]);
```

---

## BUTTON LAYOUT PATTERNS

### Full-Width Primary, Compact Secondary
```jsx
<Flex gap={4} mb={6}>  {/* NO justify="center" */}
  <Button
    colorScheme="green"
    width="100%"        // Spans to fill space
    size="md"
    shadow="md"
  >
    Generate Write-up
  </Button>
  <Button
    variant="outline"
    colorScheme="red"
    width="auto"        // Stays compact
    size="md"
  >
    Reset Form
  </Button>
</Flex>
```

**Why:** Full-width primary action shows importance and is easier to hit.

---

## GRID LAYOUT PATTERN

### 3-Column Responsive
```jsx
<Box maxW="1200px" mx="auto" px={6}>
  <Grid
    templateColumns={{
      base: "1fr",                    // Mobile: stack
      md: "repeat(2, 1fr)",           // Tablet: 2 columns
      lg: "repeat(3, 1fr)"            // Desktop: 3 columns
    }}
    gap={4}
    mb={6}
  >
    <GridItem>
      {/* Left: Input fields */}
    </GridItem>
    
    <GridItem>
      {/* Middle: Patient info */}
    </GridItem>
    
    <GridItem>
      {/* Right: Always-visible results */}
      {writeup ? (
        <Box>{writeup}</Box>
      ) : (
        <Box>Preview structure...</Box>
      )}
    </GridItem>
  </Grid>
</Box>
```

**Critical:** Use `GridItem`, not `Box`. Semantic correctness matters.

---

## COPY-PASTE FUNCTIONALITY

### HTML Tables with MSO Compatibility
```html
<table style="border-collapse: collapse; font-family: Arial, sans-serif;">
  <thead>
    <tr style="background-color: #f0f0f0;">
      <th style="border: 1px solid #333; padding: 8px;">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #333; padding: 8px;">Data</td>
    </tr>
  </tbody>
</table>
```

**Why:** Inline styles ensure formatting preserves when pasted into Word/Outlook.

### Copy Button Implementation
```jsx
const copyToClipboard = () => {
  navigator.clipboard.writeText(writeup);
  toast({
    title: 'Write-up copied!',
    status: 'success',
    duration: 3000,
  });
};
```

---

## HIPAA COMPLIANCE PATTERN

### Patient Name Placeholder
✅ **ALWAYS use `---` in templates:**
```python
text = f"Patient {patient_name} ({age}{sex}) presented for..."
# Where patient_name = "---"
```

**Workflow:**
1. Generate write-up with `---`
2. User copies to clipboard
3. User pastes into EMR
4. User replaces `---` with actual patient name

❌ **NEVER:**
- Collect actual patient names
- Store patient identifiers
- Include PHI in any form

---

## TESTING PATTERNS

### Automated Module Tests
```python
# test_module_name.py
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_writeup_generation():
    payload = {
        "common_info": {...},
        "module_data": {...}
    }
    
    response = requests.post(f"{BASE_URL}/module/generate", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "writeup" in data
    assert "---" in data["writeup"]  # HIPAA compliance
```

**Run tests:**
```bash
python test_pacemaker_module.py  # 13 tests
python test_sbrt_module.py       # 15 tests
```

---

## DEBUGGING WORKFLOW

### When Things Don't Work

#### Step 1: Check Environment (80% of issues)
```bash
# Open DevTools → Network tab
# Look for API call
# Check request URL

✅ GOOD: http://localhost:8000/api/module/generate
❌ BAD:  https://...railway.app/api/module/generate  # Calling production!
```

**Fix:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > frontend/.env.local
# Restart frontend
```

#### Step 2: Check Backend Logs
```bash
# Terminal running uvicorn shows:
INFO: "POST /api/module/generate HTTP/1.1" 200 OK  # ✅ Working
INFO: "POST /api/module/generate HTTP/1.1" 422     # ❌ Validation error
```

#### Step 3: Check Frontend Console
```javascript
// DevTools → Console
// Look for errors, warnings, failed requests
```

#### Step 4: Test Backend Directly
```
http://localhost:8000/docs
# Use FastAPI Swagger UI to isolate issue
```

---

## COMMON SYMPTOMS → SOLUTIONS

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Backend changes have no effect | Wrong environment | Check DevTools Network tab |
| Literal "\n" in write-ups | Escaped newlines `\\n` | Use single `\n` |
| Dropdowns invisible/white | Missing `data-theme="dark"` | Add to Select component |
| Mobile layout broken | Fixed grid columns | Use responsive breakpoints |
| Write-up requires scrolling | Below form placement | Move to 3rd column |
| Validation not working | Manual array state | Use useFieldArray |
| Grammar errors | No singular/plural logic | Add grammar helper methods |

---

## KEY PRINCIPLES

1. **Backend controls content** (never override in frontend)
2. **Copy Fusion's structure** (proven patterns work)
3. **Test in frontend display** (backend logs lie)
4. **HIPAA first** (always use `---` placeholder)
5. **Mobile-first responsive** (works everywhere)
6. **Always-visible results** (no scrolling UX)
7. **Environment verification** (check before debugging)

