Workflow Drill: Vague vs Precise Prompting
The feature
A Settings form for my Flyrank Ai capstone, built twice from the same main commit on two branches.
git add WORKFLOW.md .cursor/rules/project.mdc
git commit -m "docs: use consistent project name"
git push
Round 1 – Vague (feat/settings-vague)
Tool: Cursor Agent. Prompt: "make a settings page with a form". I accepted everything. It created a single 123-line src/app/settings/settings-form.tsx, changed 25 lines of src/app/page.tsx without being asked, and shipped zero tests. The build passed.

Round 2 – Precise (feat/settings-precise)
Cursor's free limit ran out, so I used GitHub Copilot (Plan, then Agent) with docs/settings-spec.md: exact files, five fields, error messages, accessibility rules, allowed dependencies and a verification step.

Comparison
Correctness
The vague AI chose its own fields (display name, summary length, "rank tasks by"), not the ones I needed. Its only validation is the HTML required attribute (line 55), so a name of three spaces passes and is saved untrimmed by handleSubmit (line 44). There is no length limit. Precise moves all rules into src/lib/validate-settings.ts (74 lines): trimming, 2–40 characters, email format, and whole-number hours from 1–12.

Accessibility
Vague wraps inputs in labels and uses a fieldset/legend for the radios, which is good. But the "Settings saved on this device" message (line 117) has no role="status", so screen readers never announce it, and there are no custom error messages to link. Precise adds aria-invalid, aria-describedby, role="status" and focus on the first invalid field, and component tests check them.

Edge cases
Vague loads localStorage in useEffect and catches corrupt JSON, but line 30 casts stored data with as Partial<Settings> without checking it, so a bad rankBy value would be trusted. Precise rejects hours of 0, 13, 2.5 and empty, and tests the name boundaries 1/41 (invalid) and 2/40 (valid).

Review effort
Vague: 123 lines and no tests, so every behaviour had to be checked by hand. Precise: about 700 lines across 9 files (excluding the lockfile), but 22/22 tests (16 unit, 6 component), lint, tsc and build all passed when I re-ran them myself. It also left page.tsx untouched. There was more to read, but much less guessing.

AI mistakes I caught
My long pasted prompt was truncated. Copilot's first plan invented an "AI assistant settings" section, used in-memory state, refused my allowed test libraries and planned no tests. I rejected it and moved the spec into a file.
The revised plan said "add no config files", which would have broken the jsdom tests. I amended the spec to allow vitest.config.mts and vitest.setup.ts.
Copilot summarised "22 tests passed" instead of pasting the real output, so I verified it myself.
What I'll do differently
Put specs in files, review the plan before any code, and never accept "tests pass" without running them.