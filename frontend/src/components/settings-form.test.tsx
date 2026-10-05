// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsForm from "@/components/settings-form";
import * as settingsStorage from "@/lib/settings-storage";
import type { Settings } from "@/lib/validate-settings";

const savedSettings: Settings = {
  displayName: "Isaac",
  email: "isaac@example.com",
  timezone: "Europe/London",
  dailyFocusGoalHours: 6,
  emailNotifications: false,
};

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsForm", () => {
  it("renders exactly five labeled fields with the specified defaults", () => {
    const { container } = render(<SettingsForm />);

    expect(screen.getByLabelText("Display name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Timezone")).toHaveValue("Africa/Lagos");
    expect(screen.getByLabelText("Daily focus goal (hours)")).toHaveValue(4);
    expect(screen.getByLabelText("Email notifications")).toBeChecked();
    expect(container.querySelectorAll("label")).toHaveLength(5);
    expect(screen.queryByText(/assistant settings/i)).not.toBeInTheDocument();
  });

  it("loads saved settings after mounting", async () => {
    window.localStorage.setItem("flyrank-ai-settings", JSON.stringify(savedSettings));
    render(<SettingsForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Display name")).toHaveValue("Isaac");
    });
    expect(screen.getByLabelText("Email")).toHaveValue("isaac@example.com");
    expect(screen.getByLabelText("Timezone")).toHaveValue("Europe/London");
    expect(screen.getByLabelText("Daily focus goal (hours)")).toHaveValue(6);
    expect(screen.getByLabelText("Email notifications")).not.toBeChecked();
  });

  it("validates a field on blur and associates its error accessibly", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);
    const displayName = screen.getByLabelText("Display name");

    await user.click(displayName);
    await user.tab();

    expect(await screen.findByText("Display name is required")).toBeInTheDocument();
    expect(displayName).toHaveAttribute("aria-invalid", "true");
    expect(displayName).toHaveAttribute("aria-describedby", "display-name-error");
  });

  it("validates all fields, does not save, and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    const saveSpy = vi.spyOn(settingsStorage, "saveSettings");
    render(<SettingsForm />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Display name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Display name")).toHaveFocus();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("shows a disabled saving state, persists trimmed values, and announces success", async () => {
    const user = userEvent.setup();
    const originalSave = settingsStorage.saveSettings;
    const saveSpy = vi
      .spyOn(settingsStorage, "saveSettings")
      .mockImplementation(
        (settings) =>
          new Promise<void>((resolve) => {
            window.setTimeout(() => {
              originalSave(settings);
              resolve();
            }, 30);
          }),
      );
    render(<SettingsForm />);

    await user.type(screen.getByLabelText("Display name"), "  Isaac  ");
    await user.type(screen.getByLabelText("Email"), " isaac@example.com ");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const savingButton = screen.getByRole("button", { name: "Saving…" });
    expect(savingButton).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Saving…");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Settings saved");
    });
    expect(saveSpy).toHaveBeenCalledWith({
      ...savedSettings,
      displayName: "Isaac",
      email: "isaac@example.com",
      timezone: "Africa/Lagos",
      dailyFocusGoalHours: 4,
      emailNotifications: true,
    });
    expect(JSON.parse(window.localStorage.getItem("flyrank-ai-settings") ?? "null")).toEqual({
      displayName: "Isaac",
      email: "isaac@example.com",
      timezone: "Africa/Lagos",
      dailyFocusGoalHours: 4,
      emailNotifications: true,
    });
  });

  it("supports keyboard-only editing and submission", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    await user.tab();
    await user.keyboard("Isaac");
    await user.tab();
    await user.keyboard("isaac@example.com");
    await user.tab();
    await user.keyboard("{ArrowDown}");
    await user.tab();
    await user.keyboard("{Control>}a{/Control}4");
    await user.tab();
    await user.keyboard(" ");
    await user.tab();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("status")).toHaveTextContent("Settings saved");
    expect(window.localStorage.getItem("flyrank-ai-settings")).not.toBeNull();
  });
});
