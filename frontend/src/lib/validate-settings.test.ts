import { describe, expect, it } from "vitest";
import {
  validateSettings,
  type SettingsFormValues,
} from "@/lib/validate-settings";

function values(overrides: Partial<SettingsFormValues> = {}): SettingsFormValues {
  return {
    displayName: "Isaac",
    email: "isaac@example.com",
    timezone: "Africa/Lagos",
    dailyFocusGoalHours: "4",
    emailNotifications: true,
    ...overrides,
  };
}

describe("validateSettings", () => {
  it("requires a non-empty display name", () => {
    expect(validateSettings(values({ displayName: "  " })).errors.displayName).toBe(
      "Display name is required",
    );
  });

  it.each([
    ["1 character", "A", "Display name must be at least 2 characters"],
    ["41 characters", "A".repeat(41), "Display name must be 40 characters or fewer"],
  ])("rejects a display name with %s", (_case, displayName, error) => {
    expect(validateSettings(values({ displayName })).errors.displayName).toBe(error);
  });

  it.each([2, 40])("accepts a display name of exactly %i characters", (length) => {
    const validation = validateSettings(values({ displayName: "A".repeat(length) }));

    expect(validation.errors.displayName).toBeUndefined();
    expect(validation.settings?.displayName).toHaveLength(length);
  });

  it("requires an email address", () => {
    expect(validateSettings(values({ email: "" })).errors.email).toBe("Email is required");
  });

  it("rejects an invalid email address", () => {
    expect(validateSettings(values({ email: "isaac@" })).errors.email).toBe(
      "Enter a valid email address",
    );
  });

  it("trims a valid email address", () => {
    expect(
      validateSettings(values({ email: "  isaac@example.com  " })).settings?.email,
    ).toBe("isaac@example.com");
  });

  it.each(["0", "13", "2.5", ""])(
    "rejects a focus goal of %j",
    (dailyFocusGoalHours) => {
      expect(
        validateSettings(values({ dailyFocusGoalHours })).errors.dailyFocusGoalHours,
      ).toBe("Enter a whole number from 1 to 12");
    },
  );

  it.each(["1", "4", "12"])("accepts a focus goal of %s hours", (dailyFocusGoalHours) => {
    const validation = validateSettings(values({ dailyFocusGoalHours }));

    expect(validation.errors.dailyFocusGoalHours).toBeUndefined();
    expect(validation.settings?.dailyFocusGoalHours).toBe(Number(dailyFocusGoalHours));
  });

  it("trims the display name before returning settings", () => {
    expect(validateSettings(values({ displayName: "  Isaac  " })).settings?.displayName).toBe(
      "Isaac",
    );
  });
});
