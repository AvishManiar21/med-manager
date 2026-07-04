# Requirements - Khan Dental Design Improvements

**Timestamp**: 2026-07-04T00:36:00Z
**Phase**: INCEPTION
**Stage**: Requirements Analysis

## Functional Requirements

### FR-001: Logo Implementation
**Priority**: HIGH
**Source**: Design Audit FINDING-004
**Description**: Replace the generic users icon in blue rounded square with an actual Khan Dental logo

**Details**:
- Current state: Generic users icon (`<Users className="h-8 w-8" />`) in blue rounded square container
- Location: `src/App.tsx:260-262`
- Required change: Replace with Khan Dental brand logo
- Accept criteria: Logo displays correctly on login page, maintains responsive behavior

### FR-002: Border-Radius Hierarchy
**Priority**: MEDIUM
**Source**: Design Audit FINDING-006
**Description**: Implement border-radius hierarchy to reduce uniform "bubbly" appearance

**Details**:
- Current state: All elements use `rounded-2xl` (16px) or larger with no hierarchy
- Problem: Identified as AI slop pattern #5 (uniform bubbly border-radius)
- Required change: Establish border-radius scale
  - Large containers: `rounded-2xl` (16px) or `rounded-3xl` (24px)
  - Medium components: `rounded-xl` (12px)
  - Small elements (buttons, inputs): `rounded-lg` (8px)
  - Nested elements: Use smaller radius than parent
- Affected files: `src/App.tsx` (multiple locations)

### FR-003: Specific Transition Properties
**Priority**: LOW
**Source**: Design Audit FINDING-008
**Description**: Replace `transition-all` with specific transition properties for better performance

**Details**:
- Current state: Multiple instances of `transition-all` throughout components
- Problem: Transitions all properties including layout, causing performance overhead
- Required change: Replace with `transition-[transform,colors,opacity]`
- Affected files: `src/App.tsx` (multiple instances)
- Accept criteria: Animations work identically but with improved performance

### FR-004: Font Weight Adjustment
**Priority**: LOW
**Source**: Design Audit FINDING-010
**Description**: Reduce heading font weight from font-black (900) to font-extrabold (800) or font-bold (700)

**Details**:
- Current state: Headings use `font-black` (900 weight)
- Problem: May appear too heavy, especially with Inter font
- Required change: Test `font-extrabold` (800) first, fallback to `font-bold` (700)
- Location: `src/App.tsx:263` and other heading locations
- Accept criteria: Headings remain prominent but less heavy

## Non-Functional Requirements

### NFR-001: Visual Consistency
- All changes must maintain the existing glassmorphism design system
- Dark mode theming must remain intact
- Responsive behavior must be preserved across all viewports (375px, 768px, 1280px)

### NFR-002: Performance
- Transition changes (FR-003) should not cause any visual regression
- Page load time should remain under 200ms (currently 146ms)

### NFR-003: Accessibility
- All changes must maintain WCAG AA compliance
- Focus states must remain visible
- Touch targets must remain >= 44px

### NFR-004: Code Quality
- Follow existing code style and patterns
- Maintain TypeScript type safety
- No console errors or warnings

## Constraints

1. **Logo Availability**: Actual Khan Dental logo must be provided or created
2. **Existing Design System**: Must work within Tailwind CSS 4 utility classes
3. **Component Structure**: Cannot restructure React components, only modify styling
4. **Git History**: Each finding should be committed separately for clear audit trail

## Success Criteria

- [ ] All 4 design findings addressed
- [ ] No visual regressions introduced
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Dev server runs without errors
- [ ] Design score maintains B+ or improves
- [ ] AI Slop score maintains B or improves

## Dependencies

- Existing design system in `src/index.css`
- React component structure in `src/App.tsx`
- Tailwind CSS 4 configuration
- Inter font (already configured)

## Out of Scope

- Adding new features or functionality
- Restructuring component architecture
- Adding new dependencies or libraries
- Modifying backend Firebase integration
- Changes to authentication logic
