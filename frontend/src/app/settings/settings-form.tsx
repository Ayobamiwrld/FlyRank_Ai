"use client";

import { FormEvent, useEffect, useState } from "react";

type SummaryLength = "brief" | "detailed";
type RankBy = "urgency" | "effort" | "balanced";

type Settings = {
  displayName: string;
  summaryLength: SummaryLength;
  rankBy: RankBy;
};

const defaultSettings: Settings = {
  displayName: "",
  summaryLength: "brief",
  rankBy: "balanced",
};

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("flyrank-settings");
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      setSettings({
        displayName: parsed.displayName ?? defaultSettings.displayName,
        summaryLength: parsed.summaryLength ?? defaultSettings.summaryLength,
        rankBy: parsed.rankBy ?? defaultSettings.rankBy,
      });
    } catch {
      // Ignore corrupt local data and keep defaults.
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Persist locally until the FastAPI settings endpoint exists.
    window.localStorage.setItem("flyrank-settings", JSON.stringify(settings));
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm">
        Display name
        <input
          name="displayName"
          type="text"
          required
          value={settings.displayName}
          onChange={(event) => {
            setSaved(false);
            setSettings({ ...settings, displayName: event.target.value });
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        Summary length
        <select
          name="summaryLength"
          value={settings.summaryLength}
          onChange={(event) => {
            setSaved(false);
            setSettings({
              ...settings,
              summaryLength: event.target.value as SummaryLength,
            });
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="brief">Brief</option>
          <option value="detailed">Detailed</option>
        </select>
      </label>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend>Rank tasks by</legend>
        {(
          [
            ["urgency", "Urgency"],
            ["effort", "Effort"],
            ["balanced", "Balanced"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2">
            <input
              type="radio"
              name="rankBy"
              value={value}
              checked={settings.rankBy === value}
              onChange={() => {
                setSaved(false);
                setSettings({ ...settings, rankBy: value });
              }}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Save settings
      </button>

      {saved ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Settings saved on this device.
        </p>
      ) : null}
    </form>
  );
}
