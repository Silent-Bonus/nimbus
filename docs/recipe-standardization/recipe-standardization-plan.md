# Recipe Standardization Plan

Last updated: August 26, 2026

## Objective

Make the recipe flow visually and structurally consistent with the premium
self-care screens, while reducing tech debt in typography, screen shells,
services, and types.

## Decision

Use the self-care list/detail screens as the reference standard.

That means recipe screens should converge on:

- `AppHeader` as the default header primitive
- `svaTypography` as the long-term typography source of truth
- consistent screen padding and list-shell structure
- consistent pill filter styling
- consistent input/search styling
- recipe-specific types/services/utils living under recipe-specific files

## Current Status

Completed:

- [x] Recipe list helpers moved to `features/tools/utils/recipeList.ts`
- [x] Recipe-specific services moved to `features/tools/services/recipeService.ts`
- [x] Recipe-specific types moved to `features/tools/types/recipeTypes.ts`
- [x] `ScreenHeader` reduced to a compatibility wrapper over `AppHeader`
- [x] Recipe list shell aligned more closely with self-care list-screen layout

In progress:

- [ ] remove mixed `typography` and `svaTypography` usage in recipe flow
- [ ] standardize recipe detail typography and spacing against self-care detail screens

Not started:

- [ ] add migration guardrails so new recipe screens do not use legacy `typography`
- [ ] define final removal path for legacy `typography`

## Phase Plan

### Phase 1: Freeze The Standard

- [ ] Confirm `svaTypography` is the forward-looking typography API
- [ ] Mark `typography` as legacy in code comments and migration docs
- [ ] Document the token mapping for common roles:
  - `h1`
  - `h2`
  - `h3`
  - `body`
  - `caption`
  - `button`

### Phase 2: Standardize Shared Primitives

- [ ] Make shared components prefer `svaTypography`
- [ ] Keep legacy fallbacks only where migration is incomplete
- [ ] Review these components first:
  - [ ] `components/layout/AppHeader.tsx`
  - [ ] `components/ui/PillFilters.tsx`
  - [ ] common card components used by recipe/self-care
  - [ ] shared input/search field styling

### Phase 3: Recipe Flow Standardization

- [x] Move recipe helpers into recipe-dedicated utils
- [x] Move recipe service calls into a recipe-dedicated service file
- [x] Move recipe response/payload types into recipe-dedicated type files
- [x] Align recipe list-screen shell with self-care list-screen shell
- [ ] Standardize `RecipeDetailScreen` spacing and text hierarchy
- [ ] Standardize recipe modal styles with the rest of the premium flows
- [ ] Remove remaining legacy typography usage inside recipe screens/components
- [ ] Audit recipe empty states, badges, chips, and title lengths for consistency

### Phase 4: Feature-Folder Guardrails

- [ ] Add a lint rule, script, or CI grep check for recipe folders
- [ ] Block new `typography.` usage in migrated recipe files
- [ ] Block new imports from shared tool files when recipe-specific files exist

### Phase 5: Broader Tools Alignment

- [ ] Compare article, curated manifest, and recipe list shells
- [ ] Create one standard tools list-screen shell if the patterns are identical
- [ ] Remove one-off header/search/filter styling where shared styling is enough

### Phase 6: Remove Legacy Typography

- [ ] Reach zero `typography` usage in migrated folders
- [ ] Remove `typography` from new screen implementations
- [ ] Remove `typography` from `ThemeContext` only after usage reaches zero
- [ ] Clean up obsolete theme types and compatibility code

## Recipe Screen Standard

Use this checklist for every recipe screen:

- [ ] uses `AppHeader` directly unless there is a justified exception
- [ ] uses `svaTypography` tokens for title, subtitle, labels, and inputs
- [ ] uses the standard screen padding and content rhythm
- [ ] uses consistent search input height, border, radius, and placeholder color
- [ ] uses standard pill typography and active/inactive treatment
- [ ] keeps remote image handling and placeholder behavior consistent
- [ ] keeps empty-state messaging and spacing consistent
- [ ] keeps route params minimal and serializable
- [ ] keeps recipe business logic in recipe-specific utils/services/types

## Open Questions

- Should `AppHeader` itself own the premium subtitle style by default, or should
  screens keep passing subtitle variants explicitly?
- Should tools list screens share one reusable search-and-filter header block?
- Should `PillFilters` move fully to token-based typography so screens stop
  overriding label styles repeatedly?

## Suggested Next Steps

1. Finish recipe detail-screen standardization.
2. Convert recipe flow to `svaTypography` only.
3. Add guardrails so new code cannot regress to mixed typography usage.
4. Use the same pattern to clean up the rest of the tools list screens.
