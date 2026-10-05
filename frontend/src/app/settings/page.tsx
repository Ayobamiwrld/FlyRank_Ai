import Link from "next/link";
import { SettingsForm } from "./settings-form";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Back home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Choose how Flyrank Ai summarises notes and ranks tasks.
        </p>
      </div>
      <SettingsForm />
    </main>
  );
}
