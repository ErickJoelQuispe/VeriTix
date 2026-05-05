# Frontend Component Architecture Audit

**VeriTix** — Date: 2026-05-05 | Scope: `app/components/**`, `app/pages/**`, `app/layouts/**`

> Note: this report captures the pre-refactor baseline. The quick wins for pagination, carousel, and section decoration were implemented later in code.

---

## Summary

The component taxonomy follows the documented structure with minor violations. The architecture is generally sound with 49 components across 10 folders:

- **base/**: 10 components — atoms (Button, Badge, Icon, Container, etc.)
- **ui/**: 7 components — reusable presentation wrappers
- **form/**: 7 components + context — complete form primitive system
- **layout/**: 3 components — global shell (Header, Footer, AccountMenu)
- **background/**: 3 components — decorative layers
- **admin/**: 12 components — domain-specific CRUD components
- **events/**: 5 components — event domain components
- **users/**: 4 components — user profile components
- **home/**: 4 components — home page sections (page-scoped)
- **auth/**: 2 components — auth domain
- **account/**: 1 component — account menu panel

**Key Findings:**
- No direct Nuxt UI (`U*`) component usage found — boundary is intact
- Duplication is minimal but present in specific spots (Carousels, Shells)
- Some page-scoped components inappropriately generic (HeroSection in home/)
- Form system is well-structured with `FormRoot` → `FormField` → `FormInput` hierarchy
- Shell pattern consistently applied per domain, but with unnecessary wrappers

---

## Inventory Findings

### base/ (10) ✅ Correct Placement

| Component | Consumers | Assessment |
|------------|-----------|-------------|
| `Button` | 44 files — core primitive, correctly placed | ✅ PROPER |
| `Badge` | 4 files (SettingsShell) — correct | ✅ PROPER |
| `Pagination` | AdminPaginationBar — correct | ✅ PROPER |
| `Container` | Layout, Sections, Shells — correct | ✅ PROPER |
| `Icon` | 20+ files — correct | ✅ PROPER |
| `Carousel` | EventsCarousel (1 consumer) | ⚠️ REVIEW — see Duplicates |
| `Main`, `Skeleton`, `Popover`, `Avatar` | Low usage, appropriately placed | ✅ PROPER |

### form/ (7 + context) ✅ Excellent

| Component | Purpose | Assessment |
|----------|---------|-------------|
| `Root` | Form provider + validation | ✅ PROPER |
| `Field` | Label + Input + error state | ✅ PROPER |
| `Input` | Text input with icon slots | ✅ PROPER |
| `Select` | Select with options | ✅ PROPER |
| `Password` | Password with visibility toggle | ✅ PROPER |
| `Textarea` | Textarea with styling | ✅ PROPER |
| `context.ts` | FormContext injection | ✅ PROPER |

**Note**: Complete form system — no duplication, clean hierarchy. All admin forms (`UserForm`, `EventForm`, `ArtistForm`) use these primitives correctly.

### ui/ (7) — Minor Issues

| Component | Consumers | Assessment |
|-----------|-----------|-------------|
| `Card` | 2 files (admin/) | ✅ PROPER |
| `GlassPanel` | 7 files — core panel primitive | ✅ PROPER |
| `SectionContainer` | HeroSection, SectionHeading | ⚠️ MIXED CONCERNS |
| `MetaLabel` | 10+ files | ✅ PROPER |
| `EmptyState` | Footer | ✅ PROPER |
| `SectionHeading` | FilterSection | ✅ PROPER |
| `ToastHost` | Layout | ✅ PROPER |

**Issue**: `SectionContainer` bakes in animation + decorative `::before` pseudo-element — mixes presentation with visual decoration. Could split into `ui/Container` (static) + `background/` decorator.

### layout/ (3) ✅ Correct

| Component | Assessment |
|-----------|-------------|
| `Header` | ✅ PROPER — global, uses BaseButton, BaseContainer |
| `Footer` | ✅ PROPER |
| `AccountMenu` | ✅ PROPER — auth-aware menu |

### admin/ (12) ✅ Appropriately Domain-Scoped

| Component | Consumers | Assessment |
|-----------|-----------|-------------|
| `PageShell` | All admin pages | ✅ PROPER |
| `EventForm`, `UserForm`, `ArtistForm` | Admin pages | ✅ PROPER |
| `StatCard` | Admin index | ✅ PROPER |
| `PaginationBar` | 6 admin pages | ⚠️ WRAPPER — wraps BasePagination unnecessarily |
| `SegmentedControl` | Admin PageShell | ✅ PROPER |
| `FiltersBar`, `FilterGrid` | Admin event/user lists | ✅ PROPER |
| `DeleteAction`, `EventRow` | Admin lists | ✅ PROPER |
| `OverviewPanel` | Admin index | ✅ PROPER |

### events/ (5) ✅

| Component | Consumers | Assessment |
|-----------|-----------|-------------|
| `ListingCard` | EventsCarousel, event pages | ✅ PROPER |
| `PageShell` | Events index/detail | ✅ PROPER |
| `FilterSection` | Events index | ✅ PROPER |
| `Carousel` | FeaturedEventsSection | ⚠️ THIN WRAPPER — see Duplicates |
| `FilterChip` | Events index | ✅ PROPER |

### home/ (4) ⚠️ Page-Scoped But Too Generic

| Component | Assessment |
|-----------|-------------|
| `HeroSection` | **MISPLACED** — contains generic search form, could be `ui/SearchHero` or `ui/SearchSection` |
| `FeaturedEventsSection` | Ok as page-scoped |
| `HowItWorksSection` | Ok as page-scoped |
| `PsychedelicOrb` | Ok as page-scoped decorative |

### users/ (4) ✅

| Component | Assessment |
|-----------|-------------|
| `SettingsShell` | ✅ PROPER |
| `ProfileFields` | ✅ PROPER |
| `PasswordFields` | ✅ PROPER |
| `ProfileAside` | ✅ PROPER |

---

## Duplicates

### 1. Carousel Duplication (MEDIUM — Merge Candidate)

| Component | Lines | What it does |
|-----------|------|-------------|
| `base/Carousel.vue` | 41 | Generic horizontal scroll container with `items` prop |
| `events/Carousel.vue` | 32 | Thin wrapper that passes `events` → `EventsListingCard` slot |

**Problem**: `events/Carousel` is almost identical to a slot-calling pattern. Could be replaced with a prop-based version of `BaseCarousel` or eliminated.

**Consumers**: `EventsCarousel` used by `home/FeaturedEventsSection` only.

**Recommendation**: Merge `EventsCarousel` into `base/Carousel` by adding an optional item renderer prop or simply use `BaseCarousel` directly with named slot.

---

### 2. Shell Pattern Duplication (LOW — Acceptable)

| Component | Lines | What it does |
|-----------|------|-------------|
| `admin/PageShell.vue` | 103 | Header + nav + content slot |
| `events/PageShell.vue` | 34 | Decorative background + container |
| `users/SettingsShell.vue` | 140 | Complex header with glows + 2-col layout |
| `auth/Shell.vue` | ~70 | Auth layout wrapper |

**Problem**: Each domain has its own Shell with different responsibilities — some mix container, header, decoration, navigation.

**Assessment**: Acceptable variation per domain. Not worth merging unless you create a unified `PageShell` primitive.

---

### 3. Pagination Wrapper (LOW — Unnecessary)

| Component | Lines | What it does |
|-----------|------|-------------|
| `base/Pagination.vue` | 129 | Full pagination with controls |
| `admin/PaginationBar.vue` | 40 | Wrapper that adds bg + rounded container |

**Problem**: `AdminPaginationBar` adds only styling wrapper. Could be replaced with BasePagination + appropriate classes in consumer.

**Recommendation**: Eliminate wrapper, use `BasePagination` directly.

---

## Misplacements

### HeroSection in home/ (HIGH — Should Move to ui/)

**Location**: `components/home/HeroSection.vue`

**Issue**: Contains a generic search form with `FormInput` and `BaseButton`. This pattern could appear on any page with event search.

**Current code**:
- Uses `UiSectionContainer` (should be `ui/`)
- Contains generic hero with search bar (could be reusable)
- Page-specific decorative (`PsychedelicOrb`)

**Recommendation**: 
1. Move generic hero pattern to `ui/HeroSearch.vue` or `ui/HeroSection.vue`
2. Move page-specific decorative to `home/PsychedelicOrb.vue` (keep where it is)
3. Simplify `home/HeroSection.vue` to compose these

---

### SectionContainer mixes concerns (MEDIUM)

**Location**: `components/ui/SectionContainer.vue`

**Issue**: 
- Bakes in animation (`animation: section-fade-in`)
- Has decorative `::before` pseudo-element with gradient
- Static content wrapper should be separate from decoration

**Recommendation**: 
1. Create `ui/Container` (or use existing `base/Container`) for static wrapper
2. Move fade animation to CSS module in consumer or new `ui/SectionFade.vue`
3. Keep `SectionContainer` only if it's a required common pattern

---

## Recommended Reorganization

### Phase 1: Quick Wins (Low Risk)

| Action | Files | Effort |
|--------|-------|--------|
| Eliminate `admin/PaginationBar` wrapper | 6 consumers + component | LOW |
| Merge `events/Carousel` into `base/Carousel` | 2 files | LOW |

### Phase 2: Moderate Changes (Medium Risk)

| Action | Files | Effort |
|--------|-------|--------|
| Move `home/HeroSection` generic parts to `ui/HeroSection` | 2 files | MEDIUM |
| Split `ui/SectionContainer` into static + decorative | 3 files | MEDIUM |

### Phase 3: Larger Refactors (Higher Risk)

| Action | Files | Effort |
|--------|-------|--------|
| Unify Shell pattern (optional) | 4 shells | HIGH |
| Create `ui/Card` + `ui/GlassPanel` unified primitive | 2 files | MEDIUM |

---

## Anti-Patterns Found

### 1. Wrapper Wrapper Anti-Pattern ✅ FIXED ALREADY
- `AdminPaginationBar` wrapping `BasePagination` — unnecessary indirection

### 2. Page-Scoped Too Generic ⚠️
- `home/HeroSection` has generic search that could be reused

### 3. Baked-In Decoration ⚠️
- `ui/SectionContainer` mixes content + animation + decoration

### 4. Shell Overload ⚠️
- Each domain has Shell with different responsibilities (acceptable but confusing)

---

## Test / Boundary Gaps

### Missing Boundary Tests

1. **Nuxt UI Boundary Test** ✅ Already exists (mentioned in context)
   - Confirmed: No `U*` direct usage found

2. **Component Placement Test** — MISSING
   - No test enforcing: 
     - No `page/` folder (should be domain or `ui/`)
     - Max depth 2 in components/
     - No generic components in page-scoped folders

3. **Usage Auditing** — Could Automate
   - Script to list components by folder with consumer count
   - Flag components with >5 consumers not in `base/` or `ui/`

---

## Next Actions

1. **Run inventory script** — Generate usage counts automatically:
   ```bash
   # Pseudocode: count component consumers per folder
   ```

2. **Eliminate AdminPaginationBar** — inline wrapper or use BasePagination directly

3. **Audit EventsCarousel** — decide if we merge into BaseCarousel

4. **Consider ui/SectionContainer split** — static container vs decorative wrapper

5. **Document Shell patterns** — clarify each Shell's responsibility in CONTRIBUTING.md

---

## Relevant Files

- `frontend/app/components/base/Button.vue` — core primitive (44 consumers)
- `frontend/app/components/ui/GlassPanel.vue` — main panel primitive
- `frontend/app/components/form/` — excellent form primitives
- `frontend/app/components/admin/PageShell.vue` — admin layout
- `frontend/app/components/events/PageShell.vue` — events decoration
- `frontend/app/components/home/HeroSection.vue` — misplacement candidate
- `frontend/app/components/ui/SectionContainer.vue` — mixed concerns
