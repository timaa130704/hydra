/* Material You dynamic-color helper for UnknownLauncher.
 * Derives an M3 tonal scheme from a seed color at runtime and applies it
 * as CSS variables on <html>. Persisted in localStorage only.
 * LevelDB / backend are never touched here. */

import Color from "color";

export type M3Mode = "dark" | "light" | "system";

const SEED_KEY = "m3-seed";
const MODE_KEY = "m3-mode";

export const M3_DEFAULT_SEED = "#16b195";

export const M3_PRESET_SEEDS = [
  "#16b195",
  "#3e62c0",
  "#6750a4",
  "#b3261e",
  "#c27400",
  "#1d6b30",
  "#7d5260",
] as const;

const isValidHex = (value: string | null): value is string =>
  typeof value === "string" && /^#(?:[0-9a-fA-F]{6})$/.test(value.trim());

export const getStoredSeed = (): string => {
  try {
    const stored = window.localStorage.getItem(SEED_KEY);
    if (isValidHex(stored)) return stored;
  } catch {
    /* ignore */
  }
  return M3_DEFAULT_SEED;
};

export const getStoredMode = (): M3Mode => {
  try {
    const stored = window.localStorage.getItem(MODE_KEY);
    if (stored === "dark" || stored === "light" || stored === "system")
      return stored;
  } catch {
    /* ignore */
  }
  return "dark";
};

export const resolveMode = (mode: M3Mode): "dark" | "light" => {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return mode;
};

/** Mix a hex color towards white (amount 0..1) or black (amount -1..0). */
const tonal = (hex: string, amount: number): string => {
  const base = Color(hex);
  if (amount >= 0) return base.mix(Color("#ffffff"), amount).hex();
  return base.mix(Color("#000000"), -amount).hex();
};

export interface M3Scheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  errorContainer: string;
  surface: string;
  surfaceLowest: string;
  surfaceLow: string;
  surfaceContainer: string;
  surfaceHigh: string;
  surfaceHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
}

export const seedToScheme = (seed: string, mode: "dark" | "light"): M3Scheme => {
  const s = isValidHex(seed) ? seed : M3_DEFAULT_SEED;
  const secondarySeed = Color(s).rotate(36).hex();
  const tertiarySeed = Color(s).rotate(-60).hex();

  if (mode === "light") {
    return {
      primary: tonal(s, -0.45),
      onPrimary: "#ffffff",
      primaryContainer: tonal(s, 0.72),
      onPrimaryContainer: tonal(s, -0.72),
      secondary: tonal(secondarySeed, -0.45),
      onSecondary: "#ffffff",
      secondaryContainer: tonal(secondarySeed, 0.72),
      onSecondaryContainer: tonal(secondarySeed, -0.72),
      tertiary: tonal(tertiarySeed, -0.45),
      tertiaryContainer: tonal(tertiarySeed, 0.72),
      onTertiaryContainer: tonal(tertiarySeed, -0.72),
      error: "#ba1a1a",
      errorContainer: "#ffdad6",
      surface: "#f7faf8",
      surfaceLowest: "#ffffff",
      surfaceLow: "#f0f3f1",
      surfaceContainer: "#eaedeb",
      surfaceHigh: "#e4e7e5",
      surfaceHighest: "#dee3e0",
      onSurface: "#191c1b",
      onSurfaceVariant: "#3f4946",
      outline: "#6f7976",
      outlineVariant: "#bec9c4",
    };
  }

  return {
    primary: tonal(s, 0.55),
    onPrimary: tonal(s, -0.78),
    primaryContainer: tonal(s, -0.42),
    onPrimaryContainer: tonal(s, 0.78),
    secondary: tonal(secondarySeed, 0.5),
    onSecondary: tonal(secondarySeed, -0.7),
    secondaryContainer: tonal(secondarySeed, -0.35),
    onSecondaryContainer: tonal(secondarySeed, 0.75),
    tertiary: tonal(tertiarySeed, 0.5),
    tertiaryContainer: tonal(tertiarySeed, -0.35),
    onTertiaryContainer: tonal(tertiarySeed, 0.75),
    error: "#ffb4ab",
    errorContainer: "#93000a",
    surface: "#131615",
    surfaceLowest: "#0c0f0e",
    surfaceLow: "#1a1d1c",
    surfaceContainer: "#1e2120",
    surfaceHigh: "#282b2a",
    surfaceHighest: "#333635",
    onSurface: "#dde4e1",
    onSurfaceVariant: "#bec9c4",
    outline: "#8a938f",
    outlineVariant: "#3a4340",
  };
};

export const applyMaterialYou = (seed?: string, mode?: M3Mode): void => {
  const nextSeed = isValidHex(seed ?? null)
    ? (seed as string)
    : getStoredSeed();
  const nextMode: M3Mode = mode ?? getStoredMode();
  const resolved = resolveMode(nextMode);
  const scheme = seedToScheme(nextSeed, resolved);
  const root = window.document.documentElement;

  root.dataset.m3Mode = resolved;
  root.style.setProperty("--m3-seed", nextSeed);
  root.style.setProperty("--m3-primary", scheme.primary);
  root.style.setProperty("--m3-on-primary", scheme.onPrimary);
  root.style.setProperty("--m3-primary-container", scheme.primaryContainer);
  root.style.setProperty(
    "--m3-on-primary-container",
    scheme.onPrimaryContainer
  );
  root.style.setProperty("--m3-secondary", scheme.secondary);
  root.style.setProperty("--m3-on-secondary", scheme.onSecondary);
  root.style.setProperty("--m3-secondary-container", scheme.secondaryContainer);
  root.style.setProperty(
    "--m3-on-secondary-container",
    scheme.onSecondaryContainer
  );
  root.style.setProperty("--m3-tertiary", scheme.tertiary);
  root.style.setProperty("--m3-tertiary-container", scheme.tertiaryContainer);
  root.style.setProperty(
    "--m3-on-tertiary-container",
    scheme.onTertiaryContainer
  );
  root.style.setProperty("--m3-error", scheme.error);
  root.style.setProperty("--m3-error-container", scheme.errorContainer);
  root.style.setProperty("--m3-surface", scheme.surface);
  root.style.setProperty("--m3-surface-container-lowest", scheme.surfaceLowest);
  root.style.setProperty("--m3-surface-container-low", scheme.surfaceLow);
  root.style.setProperty("--m3-surface-container", scheme.surfaceContainer);
  root.style.setProperty("--m3-surface-container-high", scheme.surfaceHigh);
  root.style.setProperty(
    "--m3-surface-container-highest",
    scheme.surfaceHighest
  );
  root.style.setProperty("--m3-on-surface", scheme.onSurface);
  root.style.setProperty("--m3-on-surface-variant", scheme.onSurfaceVariant);
  root.style.setProperty("--m3-outline", scheme.outline);
  root.style.setProperty("--m3-outline-variant", scheme.outlineVariant);

  try {
    window.localStorage.setItem(SEED_KEY, nextSeed);
    window.localStorage.setItem(MODE_KEY, nextMode);
  } catch {
    /* ignore */
  }
};

/** Apply stored theme once and keep `system` in sync with the OS. */
export const initMaterialYou = (): (() => void) => {
  applyMaterialYou();

  const media = window.matchMedia("(prefers-color-scheme: light)");
  const onChange = () => {
    if (getStoredMode() === "system") applyMaterialYou();
  };

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }

  return () => {};
};
