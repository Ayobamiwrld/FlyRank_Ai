import {
  timezones,
  type Settings,
  type Timezone,
} from "@/lib/validate-settings";

const storageKey = "flyrank-ai-settings";

function isTimezone(value: unknown): value is Timezone {
  return typeof value === "string" && timezones.some((timezone) => timezone === value);
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.displayName === "string" &&
    typeof candidate.email === "string" &&
    isTimezone(candidate.timezone) &&
    typeof candidate.dailyFocusGoalHours === "number" &&
    typeof candidate.emailNotifications === "boolean"
  );
}

export function loadSettings(): Settings | null {
  const storedSettings = window.localStorage.getItem(storageKey);
  if (storedSettings === null) {
    return null;
  }

  const parsedSettings: unknown = JSON.parse(storedSettings);
  if (!isSettings(parsedSettings)) {
    throw new Error("Stored settings have an invalid format");
  }

  return parsedSettings;
}

export function saveSettings(settings: Settings): void {
  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}
