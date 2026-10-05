"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  timezones,
  type Settings,
  type SettingsErrors,
  type SettingsField,
  type SettingsFormValues,
  validateSettings,
} from "@/lib/validate-settings";
import { loadSettings, saveSettings } from "@/lib/settings-storage";

const defaultValues: SettingsFormValues = {
  displayName: "",
  email: "",
  timezone: "Africa/Lagos",
  dailyFocusGoalHours: "4",
  emailNotifications: true,
};

const fieldOrder: SettingsField[] = [
  "displayName",
  "email",
  "timezone",
  "dailyFocusGoalHours",
  "emailNotifications",
];

function toFormValues(settings: Settings): SettingsFormValues {
  return {
    ...settings,
    dailyFocusGoalHours: String(settings.dailyFocusGoalHours),
  };
}

export default function SettingsForm() {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fields = useRef<Partial<Record<SettingsField, HTMLElement | null>>>({});

  useEffect(() => {
    try {
      const settings = loadSettings();
      if (settings) {
        queueMicrotask(() => setValues(toFormValues(settings)));
      }
    } catch {
      queueMicrotask(() => setStatus("Unable to load settings. Please try again."));
    }
  }, []);

  function updateField<Field extends SettingsField>(
    field: Field,
    value: SettingsFormValues[Field],
  ) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setStatus("");
  }

  function validateField(field: SettingsField) {
    const fieldErrors = validateSettings(values).errors;
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: fieldErrors[field],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    const validation = validateSettings(values);
    setErrors(validation.errors);

    if (!validation.settings) {
      const firstInvalidField = fieldOrder.find((field) => validation.errors[field]);
      if (firstInvalidField) {
        fields.current[firstInvalidField]?.focus();
      }
      return;
    }

    setIsSaving(true);
    setStatus("Saving…");
    try {
      await saveSettings(validation.settings);
      setStatus("Settings saved");
    } catch {
      setStatus("Unable to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Manage your account details and daily productivity preferences.
          </p>
        </header>

        <form
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="space-y-6 p-6 sm:p-8" aria-labelledby="profile-heading">
            <div>
              <h2 id="profile-heading" className="text-lg font-semibold">
                Profile
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your details help personalize your workspace.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="display-name" className="mb-2 block text-sm font-medium">
                  Display name
                </label>
                <input
                  ref={(element) => {
                    fields.current.displayName = element;
                  }}
                  id="display-name"
                  name="displayName"
                  autoComplete="name"
                  value={values.displayName}
                  onChange={(event) => updateField("displayName", event.target.value)}
                  onBlur={() => validateField("displayName")}
                  aria-invalid={errors.displayName ? true : undefined}
                  aria-describedby={errors.displayName ? "display-name-error" : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 aria-invalid:border-rose-500 aria-invalid:focus:ring-rose-100"
                />
                {errors.displayName && (
                  <p id="display-name-error" className="mt-2 text-sm text-rose-600">
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  ref={(element) => {
                    fields.current.email = element;
                  }}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  onBlur={() => validateField("email")}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 aria-invalid:border-rose-500 aria-invalid:focus:ring-rose-100"
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-rose-600">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            className="space-y-6 border-t border-slate-200 p-6 sm:p-8"
            aria-labelledby="preferences-heading"
          >
            <div>
              <h2 id="preferences-heading" className="text-lg font-semibold">
                Preferences
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Set the rhythm that works best for your day.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="timezone" className="mb-2 block text-sm font-medium">
                  Timezone
                </label>
                <select
                  ref={(element) => {
                    fields.current.timezone = element;
                  }}
                  id="timezone"
                  name="timezone"
                  value={values.timezone}
                  onChange={(event) =>
                    updateField("timezone", event.target.value as Settings["timezone"])
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {timezones.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="daily-focus-goal" className="mb-2 block text-sm font-medium">
                  Daily focus goal (hours)
                </label>
                <input
                  ref={(element) => {
                    fields.current.dailyFocusGoalHours = element;
                  }}
                  id="daily-focus-goal"
                  name="dailyFocusGoalHours"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="12"
                  step="1"
                  value={values.dailyFocusGoalHours}
                  onChange={(event) =>
                    updateField("dailyFocusGoalHours", event.target.value)
                  }
                  onBlur={() => validateField("dailyFocusGoalHours")}
                  aria-invalid={errors.dailyFocusGoalHours ? true : undefined}
                  aria-describedby={
                    errors.dailyFocusGoalHours ? "daily-focus-goal-error" : undefined
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 aria-invalid:border-rose-500 aria-invalid:focus:ring-rose-100"
                />
                {errors.dailyFocusGoalHours && (
                  <p id="daily-focus-goal-error" className="mt-2 text-sm text-rose-600">
                    {errors.dailyFocusGoalHours}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <input
                ref={(element) => {
                  fields.current.emailNotifications = element;
                }}
                id="email-notifications"
                name="emailNotifications"
                type="checkbox"
                checked={values.emailNotifications}
                onChange={(event) =>
                  updateField("emailNotifications", event.target.checked)
                }
                className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              />
              <div>
                <label htmlFor="email-notifications" className="text-sm font-medium">
                  Email notifications
                </label>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Receive helpful updates and reminders in your inbox.
                </p>
              </div>
            </div>
          </section>

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p role="status" aria-live="polite" className="min-h-5 text-sm text-slate-600">
              {status}
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}
