/**
 * A short, stable digest of an arbitrary value.
 *
 * FNV-1a over a canonical serialisation. Not a cryptographic hash and does not
 * need to be: nothing here is defending against a forged career, it is
 * detecting an accidental one. What it does need is to be identical on every
 * machine and every Node version forever, which rules out anything that walks
 * object keys in insertion order or prints floats differently.
 */

function canonical(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undef";

  if (typeof value === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (!Number.isFinite(value)) return value > 0 ? "Inf" : "-Inf";
    // Six decimals is far finer than anything the game prints, and coarse
    // enough that the last bit of floating-point noise cannot flip a digest.
    return Number.isInteger(value) ? String(value) : value.toFixed(6);
  }

  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";

  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      // Sorted, so a refactor that reorders a literal cannot look like a
      // change in the game.
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, v]) => `${JSON.stringify(key)}:${canonical(v)}`);
    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(String(value));
}

export function digest(value: unknown): string {
  const text = canonical(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  let second = 0x9e3779b9;
  for (let i = text.length - 1; i >= 0; i -= 1) {
    second ^= text.charCodeAt(i);
    second = Math.imul(second, 0x85ebca6b);
  }
  return (
    (hash >>> 0).toString(16).padStart(8, "0") +
    (second >>> 0).toString(16).padStart(8, "0")
  );
}

export { canonical as canonicalForTests };
