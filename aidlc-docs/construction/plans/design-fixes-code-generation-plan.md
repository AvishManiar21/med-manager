# Code Generation Plan - Design Fixes Unit

**Timestamp**: 2026-07-04T00:40:00Z
**Phase**: CONSTRUCTION
**Stage**: Code Generation - Part 1 (Planning)
**Unit**: design-fixes
**Workspace Root**: C:\dev\Med_Manager\med-manager
**Project Type**: Brownfield

## Unit Context

This unit implements 4 deferred design findings from the design audit report:
- FINDING-004: Replace users icon with Khan Dental logo
- FINDING-006: Implement border-radius hierarchy
- FINDING-008: Replace transition-all with specific properties
- FINDING-010: Reduce font-black to font-extrabold

## Target Files

### Primary File
- `C:\dev\Med_Manager\med-manager\src\App.tsx` (MODIFY - brownfield)

### Supporting Files (if needed)
- `C:\dev\Med_Manager\med-manager\src\index.css` (MODIFY - brownfield)
- `C:\dev\Med_Manager\med-manager\public\logo.svg` (CREATE - if logo provided)

## Detailed Generation Steps

### Step 1: Fix FINDING-008 - Replace transition-all with Specific Properties
**Status**: [ ]
**File**: `src/App.tsx`
**Impact**: 78 occurrences
**Change**:
- Find all instances of `transition-all`
- Replace with `transition-[transform,colors,opacity]`
- Preserve all other class names and attributes

**Lines to Modify** (representative sample, full list in verification):
- Line 256, 296, 328, 364, 377, 392, 425, 467, 726, 763, 802, 814, 846, 907, 916, 925, 973, 1174, 1195, 1208, 1219, 1236, 1248, 1259, 1291, 1307, 1332, 1345, 1358, 1375, 1384, 1470, 1497, 1635, 1652, 1708, 1721, 1737, 1748, 1760, 1783, 1800, 1812, 1836, 1850, 1873, 1881, 1954, 2001, 2018, 2070, 2083, 2091, 2099, 2190, 2200, 2217, 2230, 2242, 2257, 2265, 2420, 2448, 2498, 2517, 2595, 2606, 2831, 2847, 2866, 2883, 2897, 2910, 2930, 2944, 2957, 2971, 2986, 2997, 3007, 3025, 3037, 3045, 3054, 3069, 3083, 3104, 3114, 3123, 3224, 3231, 3239, 3251, 3258, 3265, 3274

**Verification**:
- Count instances before: 78
- Count instances after: 0
- Verify all replaced with transition-[transform,colors,opacity]

**Commit Message**:
```
style(design): FINDING-008 — replace transition-all with specific properties for better performance

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Step 2: Fix FINDING-010 - Reduce font-black to font-extrabold
**Status**: [ ]
**File**: `src/App.tsx`
**Impact**: 14 occurrences
**Change**:
- Find all instances of `font-black`
- Replace with `font-extrabold` (800 weight)
- Preserve all other class names and attributes

**Lines to Modify**:
- Line 263: Login heading "KHAN DENTAL"
- Line 484: Dashboard stat card value
- Line 1456: Analytics heading
- Line 1630: Stock & Inventory heading
- Line 1684: Stock item price
- Line 1864: Purchase total (inline span)
- Line 2065: Appointment Calendar heading
- Line 2415: Prescriptions heading
- Line 2787: Doctor Profile heading
- Line 3090: Confirm Identity heading
- Line 3217: Financial Sheets heading
- Line 3255, 3262, 3269: Financial totals
- Line 3315: Table header font weight

**Verification**:
- Count instances before: 14
- Count instances after: 0
- Visual check: headings still prominent but less heavy
- Verify no regression in dark mode

**Commit Message**:
```
style(design): FINDING-010 — reduce font weight from font-black to font-extrabold for better readability

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Step 3: Fix FINDING-006 - Implement Border-Radius Hierarchy
**Status**: [ ]
**File**: `src/App.tsx`
**Impact**: ~50+ elements
**Strategy**: Apply hierarchy rules
- Large containers (cards, modals): Keep `rounded-2xl` (16px) or `rounded-3xl` (24px)
- Medium components (inputs, buttons): Change to `rounded-xl` (12px)
- Small elements (pills, badges): Keep `rounded-full` or use `rounded-lg` (8px)
- Nested elements: Use smaller radius than parent

**Hierarchy Rules**:
1. **Login card container** (line 256): Keep `rounded-[2rem]` (large container)
2. **Inputs** (lines 296, 328, 364): Change `rounded-2xl` → `rounded-xl` (nested in large card)
3. **Buttons** (lines 377, 392): Change `rounded-2xl` → `rounded-xl` (nested in large card)
4. **Stat cards** (line 467): Keep `rounded-2xl md:rounded-3xl` (top-level cards)
5. **Stat card icons** (line 487): Change `rounded-xl md:rounded-2xl` → `rounded-lg md:rounded-xl` (nested)
6. **Modal containers**: Keep `rounded-3xl` (large overlays)
7. **Modal inputs/buttons**: Change `rounded-xl` or `rounded-2xl` → `rounded-lg` or `rounded-xl` based on nesting

**Detailed Changes** (representative, ~30-40 changes total):
- Input fields in cards: `rounded-2xl` → `rounded-xl`
- Buttons in cards: `rounded-2xl` → `rounded-xl`
- Nested icons/badges: Reduce by one step
- Maintain consistency within component groups

**Verification**:
- Visual check: Clear hierarchy visible (larger containers = larger radius)
- No uniform "bubbly" appearance
- Each component group maintains internal consistency
- Responsive breakpoints preserved

**Commit Message**:
```
style(design): FINDING-006 — implement border-radius hierarchy to eliminate uniform bubbly appearance

Establishes clear visual hierarchy:
- Large containers: rounded-2xl/3xl (16-24px)
- Medium components: rounded-xl (12px)
- Small elements: rounded-lg (8px)
- Nested elements use smaller radius than parent

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Step 4: Fix FINDING-004 - Replace Users Icon with Khan Dental Logo
**Status**: [ ]
**File**: `src/App.tsx`
**Impact**: Line 261 (login page icon)
**Dependency**: Logo asset required

**Current Code** (line 260-262):
```tsx
<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-500/20">
  <Users className="h-8 w-8" />
</div>
```

**Options**:

**Option A: SVG Logo Component (Preferred)**
- Create logo SVG in `public/logo.svg` or inline as component
- Replace Users icon with logo
- Maintain sizing and container

**Option B: Text-Based Logo (Fallback)**
- If no logo asset available, use stylized "KD" monogram
- Apply brand styling

**Option C: Keep Icon, Add Brand Context (Minimal)**
- Keep Users icon but enhance with "Khan Dental" text overlay
- Less impactful but requires no asset

**Recommended Approach**: Option A with placeholder until real logo provided

**Changes Required**:
1. Add logo asset to project (if available)
2. Import logo component or image
3. Replace `<Users className="h-8 w-8" />` with logo
4. Adjust sizing if needed (maintain w-16 h-16 container)
5. Ensure logo works in dark mode

**Note**: This step may require user input for logo asset. If not available, will create a placeholder "KD" monogram.

**Commit Message** (if logo provided):
```
style(design): FINDING-004 — replace generic users icon with Khan Dental logo

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Message** (if placeholder):
```
style(design): FINDING-004 — replace generic users icon with KD monogram placeholder

Removes AI slop pattern (icon in colored circle). Real logo can replace monogram when available.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Summary

**Total Steps**: 4
**Files Modified**: 1 (src/App.tsx)
**Files Created**: 0-1 (logo.svg if provided)
**Commits**: 4 (one per finding)

**Execution Order**:
1. FINDING-008 (transition-all) - Low risk, easy verification
2. FINDING-010 (font-black) - Low risk, visual check only
3. FINDING-006 (border-radius) - Medium complexity, requires careful hierarchy
4. FINDING-004 (logo) - May need user input

**Story Traceability**:
- FR-001: Step 4 (Logo Implementation)
- FR-002: Step 3 (Border-Radius Hierarchy)
- FR-003: Step 1 (Specific Transition Properties)
- FR-004: Step 2 (Font Weight Adjustment)

**Dependencies**:
- Steps 1-3 have no dependencies
- Step 4 may require logo asset from user

**Verification Strategy**:
- After each step: Count pattern occurrences
- After all steps: Run dev server, visual inspection
- Final: Build & Test phase will verify no errors

---

## Next Action

**Awaiting Approval**: This plan must be approved by user before proceeding to Code Generation Part 2 (Generation).
