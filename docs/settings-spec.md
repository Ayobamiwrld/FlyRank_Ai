# Settings Page Spec

## Goal
Build a Settings page for the AI Productivity Assistant frontend (Next.js App
Router, TypeScript strict, Tailwind). Follow .cursor/rules/project.mdc and
frontend/AGENTS.md.

## Files (create exactly these)
- frontend/src/app/settings/page.tsx             → page wrapper only
- frontend/src/components/settings-form.tsx      → "use client" form component
- frontend/src/lib/validate-settings.ts          → pure validation function, no React
- frontend/src/lib/settings-storage.ts           → load/save to localStorage
- frontend/src/lib/validate-settings.test.ts     → unit tests
- frontend/src/components/settings-form.test.tsx → component tests
- frontend/vitest.config.mts   → Vitest config (jsdom, react plugin, tsconfig paths)
- frontend/vitest.setup.ts     → imports @testing-library/jest-dom/vitest

## Fields (exactly these 5)
1. Display name: required, trimmed, 2–40 characters
2. Email: required, trimmed, valid email format
3. Timezone: <select>, default "Africa/Lagos", options: Africa/Lagos,
   Europe/London, America/New_York, Asia/Dubai
4. Daily focus goal (hours): whole number 1–12, default 4
5. Email notifications: checkbox, default on

## Behaviour
- Validate a field on blur, and all fields on submit
- Show the error message directly under its field
- On submit with errors: don't save, move focus to the first invalid field
- On valid submit: disable the button and show "Saving…", save, then show
  "Settings saved" in a status message
- Load saved settings on mount (read localStorage in useEffect, not during
  render, to avoid hydration errors)

## Examples (exact error messages)
| Input | Expected result |
|---|---|
| name "  " | "Display name is required" |
| name "A" | "Display name must be at least 2 characters" |
| name longer than 40 chars | "Display name must be 40 characters or fewer" |
| email "" | "Email is required" |
| email "isaac@" | "Enter a valid email address" |
| hours "0", "13", "2.5" or "" | "Enter a whole number from 1 to 12" |
| name "  Isaac  " | saved as "Isaac" |

## Accessibility
- Every input has a <label htmlFor>
- Invalid inputs get aria-invalid="true" and aria-describedby pointing at
  the error element's id
- The status message uses role="status"
- Everything works with keyboard only

## Constraints
- No `any`. No form libraries (no react-hook-form, zod, formik)
- Only new dev dependencies allowed: vitest, @vitejs/plugin-react, jsdom,
  vite-tsconfig-paths, @testing-library/react, @testing-library/dom,
  @testing-library/user-event, @testing-library/jest-dom
- Add "test": "vitest run" to frontend/package.json scripts
- Don't modify unrelated files (do NOT change src/app/page.tsx)

## Verification
After writing the code: write the tests, then run `npm test`,
`npm run lint`, and `npx tsc --noEmit` inside /frontend. Fix until all
pass. Report the real terminal output.