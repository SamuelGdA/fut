import type { Drift, FingerprintDrift } from "./diff";

/** Plain-text reporting. No colour: this output gets pasted into issues. */

const RULE = "-".repeat(72);

export function heading(text: string): string {
  return `\n${text}\n${RULE}`;
}

export function formatDrift(drifts: Drift[], limit = 40): string {
  if (drifts.length === 0) return "  no change";
  const shown = drifts.slice(0, limit);
  const lines = shown.map((drift) => {
    const magnitude =
      drift.delta === undefined
        ? ""
        : `  (${drift.delta > 0 ? "+" : ""}${drift.delta}${
            drift.pct === undefined ? "" : `, ${drift.pct > 0 ? "+" : ""}${drift.pct}%`
          })`;
    return `  ${drift.path}\n      ${String(drift.before)}  ->  ${String(drift.after)}${magnitude}`;
  });
  if (drifts.length > shown.length) {
    lines.push(`  ... and ${drifts.length - shown.length} more`);
  }
  return lines.join("\n");
}

export function formatFingerprintDrift(drifts: FingerprintDrift[], limit = 25): string {
  if (drifts.length === 0) return "  every career identical";
  const shown = drifts.slice(0, limit);
  const lines = shown.map((drift) => {
    if (drift.kind !== "changed") return `  ${drift.id}: ${drift.kind}`;
    const where =
      drift.divergedAtAge === null
        ? "diverged (no season boundary found)"
        : `diverged at age ${drift.divergedAtAge}`;
    const summary = drift.summaryDrift
      .slice(0, 6)
      .map((entry) => `${entry.path} ${String(entry.before)} -> ${String(entry.after)}`)
      .join("; ");
    return `  ${drift.id}: ${where}${summary ? `\n      ${summary}` : ""}`;
  });
  if (drifts.length > shown.length) {
    lines.push(`  ... and ${drifts.length - shown.length} more careers`);
  }
  return lines.join("\n");
}

export function formatTargets(targets: Record<string, number>): string {
  const width = Math.max(...Object.keys(targets).map((key) => key.length));
  return Object.entries(targets)
    .map(([key, value]) => `  ${key.padEnd(width)}  ${value}`)
    .join("\n");
}
