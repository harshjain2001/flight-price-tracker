"use client";

import { useState } from "react";

type CronResponse = {
  ok?: boolean;
  error?: string;
  matchCount?: number;
  emailSent?: boolean;
  dryRun?: boolean;
  maxPrice?: number;
  origin?: string;
  destinations?: string[];
};

export function RunCronButton() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleRun() {
    const token = secret.trim();
    if (!token) {
      setIsError(true);
      setResult("Enter your CRON_SECRET to run.");
      return;
    }

    setLoading(true);
    setResult(null);
    setIsError(false);

    try {
      const response = await fetch("/api/cron", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as CronResponse;

      if (!response.ok || data.ok === false) {
        setIsError(true);
        setResult(data.error ?? `Request failed (${response.status})`);
        return;
      }

      const emailNote = data.dryRun
        ? "dry run — no email sent"
        : data.emailSent
          ? "email sent"
          : "no email (no matches under max price)";

      setResult(
        `Found ${data.matchCount ?? 0} match(es); ${emailNote}.`,
      );
    } catch (error) {
      setIsError(true);
      setResult(
        error instanceof Error ? error.message : "Failed to reach /api/cron",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Run check now
      </p>
      <p className="text-xs text-zinc-500">
        Uses the same job as the daily cron. Paste{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
          CRON_SECRET
        </code>{" "}
        (not stored in the page). If dry run is off and matches exist, you get
        email immediately.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          autoComplete="off"
          placeholder="CRON_SECRET"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Running…" : "Check prices now"}
        </button>
      </div>
      {result ? (
        <p
          className={`text-xs ${isError ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          {result}
        </p>
      ) : null}
    </div>
  );
}
