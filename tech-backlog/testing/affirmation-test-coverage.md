# Affirmation Module Test Coverage Audit

Date: August 13, 2026
Branch: `feat/mood-affiramtion`

## Current automated coverage

- Jest test suites: `8`
- Jest tests: `20`
- E2E coverage: `0`

Covered test files:

- `features/self-care/services/__tests__/affirmationService.test.ts`
- `features/self-care/screens/__tests__/AffirmationScreen.test.tsx`
- `features/self-care/screens/__tests__/CreateAffirmationScreen.test.tsx`
- `features/self-care/components/affirmation/__tests__/AffirmationListCard.test.tsx`
- `features/self-care/components/affirmation/__tests__/AffirmationRecommendationCard.test.tsx`
- `features/self-care/components/affirmation/__tests__/AffirmationStoryModal.test.tsx`
- `features/self-care/utils/__tests__/affirmationLibrary.test.ts`
- `features/self-care/utils/__tests__/mindPractices.test.ts`

Latest verification:

- `8/8` suites passed
- `20/20` tests passed

## Scenario coverage against the CRUD checklist

The earlier manual checklist contained `42` scenarios across Create, Read, Update, Delete, Filtering, UI/UX, and API/Data Integrity.

Current status:

- Directly covered: `18`
- Partially covered: `4`
- Not covered: `20`

## Coverage by area

### Create

Status: `4/8` covered

Covered:

- Render create form with the initial three statement inputs
- Add statements up to the allowed maximum
- Prevent adding more than seven statements
- Submit a custom affirmation and return to the affirmation screen

Missing:

- Validation for empty title, empty detail, empty statements, and invalid tags
- Error toast or failure state when creation fails
- Success toast assertion after creation
- Duplicate submit prevention / loading state assertion

### Read: list screen

Status: `4/6` covered

Covered:

- Recommendation row renders
- Affirmation list content renders
- Newly created affirmation is re-added into the list
- Count label updates on the list screen

Missing:

- Empty-state rendering when API returns no affirmations
- Screen-level API error and retry behavior

### Read: detail/open flow

Status: `5/6` covered

Covered:

- Clicking a card opens the story modal
- Detail is fetched by the clicked affirmation slug
- Title renders in the opened view
- Statement carousel renders
- Detail guidance copy renders for the opened affirmation

Partially covered:

- Statement progression UX is present, but the "last statement hides next-swipe guidance" behavior is not asserted directly

Missing:

- Explicit test for last-statement behavior

### Update

Status: `0/6` covered

Missing:

- Edit existing affirmation flow
- Prefill existing values in edit mode
- Update title/detail/tags/statements
- Add and remove statements during edit
- Successful update toast / navigation
- Failed update handling

### Delete

Status: `0/4` covered

Missing:

- Delete action from list or detail
- Delete confirmation behavior
- Successful deletion removes item from UI
- Failed deletion handling

### Filtering

Status: `2/4` covered

Covered:

- Tone filtering utility behavior
- Tone label formatting utility behavior

Missing:

- Screen interaction test for dynamic tone pills
- API-driven tone list rendering on the screen

### UI/UX

Status: `3/4` covered

Covered:

- List card shows title, detail, and tone chip
- Recommendation card renders correctly and is tappable
- Story modal renders the selected affirmation content

Partially covered:

- Recent UX copy and label changes exist in implementation, but most are not asserted by tests

Missing:

- Assertions for updated copy such as the new count label and removed helper text in all relevant states

### API and data integrity

Status: `4/4` covered or partially covered

Covered:

- API list response maps into app deck shape
- API failure falls back correctly
- Recommendation list is derived from the first item in each tone
- Story slides derive from the full card list

Partially covered:

- Dynamic tone support is validated through utilities and screen behavior, but not with a broader set of edge payloads

## What is covered by the current Jest suite

### Service tests

- API payload mapping
- API fallback behavior

### Screen tests

- List rendering
- Recommendation rendering
- Navigation back from create flow
- Open-by-slug detail flow
- Navigate to create screen

### Component tests

- List card rendering
- Recommendation card rendering
- Story modal rendering

### Utility tests

- Recommendation builder
- Story slide builder
- Word trimming helper
- Tone filter helper

## Main gaps

Highest-risk missing coverage:

1. No update flow tests
2. No delete flow tests
3. No screen-level empty/error/retry coverage
4. No explicit assertions for the new create-success toast
5. No explicit assertions for last-statement modal behavior
6. No true E2E journey for list -> open -> swipe -> create -> return

## Recommended next tests

Add these next, in order:

1. `AffirmationScreen.test.tsx`
   - dynamic tone pills render from API payload
   - selecting a tone pill filters visible cards
   - empty-state rendering
   - error + retry behavior

2. `AffirmationStoryModal.test.tsx`
   - counter updates while progressing through statements
   - last statement hides next guidance
   - tone and tags render in opened detail

3. `CreateAffirmationScreen.test.tsx`
   - success toast appears with the new copy
   - failed create shows error handling
   - submit disabled while request is in flight

4. New edit/delete tests
   - `EditAffirmationScreen.test.tsx` if edit screen exists
   - delete action tests wherever delete is implemented

5. Add one E2E flow
   - open affirmation screen
   - filter by tone
   - open detail
   - progress through statements
   - create affirmation
   - return and verify the new card appears

## Summary

The affirmation module has good early coverage for create and read behavior, but it is still missing most update, delete, empty/error, and end-to-end validation. The current automated coverage is best described as solid component/screen/service coverage for the happy path, with roughly half of the broader manual scenario checklist still uncovered.
