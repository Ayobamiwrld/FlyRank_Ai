export const timezones = [
  "Africa/Lagos",
  "Europe/London",
  "America/New_York",
  "Asia/Dubai",
] as const;

export type Timezone = (typeof timezones)[number];

export type Settings = {
  displayName: string;
  email: string;
  timezone: Timezone;
  dailyFocusGoalHours: number;
  emailNotifications: boolean;
};

export type SettingsFormValues = Omit<Settings, "dailyFocusGoalHours"> & {
  dailyFocusGoalHours: string;
};

export type SettingsField = keyof SettingsFormValues;

export type SettingsErrors = Partial<Record<SettingsField, string>>;

export type SettingsValidation = {
  errors: SettingsErrors;
  settings: Settings | null;
};

export function validateSettings(values: SettingsFormValues): SettingsValidation {
  const displayName = values.displayName.trim();
  const email = values.email.trim();
  const dailyFocusGoalHours = Number(values.dailyFocusGoalHours);
  const errors: SettingsErrors = {};

  if (!displayName) {
    errors.displayName = "Display name is required";
  } else if (displayName.length < 2) {
    errors.displayName = "Display name must be at least 2 characters";
  } else if (displayName.length > 40) {
    errors.displayName = "Display name must be 40 characters or fewer";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (
    !/^\d+$/.test(values.dailyFocusGoalHours) ||
    !Number.isInteger(dailyFocusGoalHours) ||
    dailyFocusGoalHours < 1 ||
    dailyFocusGoalHours > 12
  ) {
    errors.dailyFocusGoalHours = "Enter a whole number from 1 to 12";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, settings: null };
  }

  return {
    errors,
    settings: {
      displayName,
      email,
      timezone: values.timezone,
      dailyFocusGoalHours,
      emailNotifications: values.emailNotifications,
    },
  };
}
