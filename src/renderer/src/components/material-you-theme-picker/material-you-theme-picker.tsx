import { useCallback, useState } from "react";
import cn from "classnames";
import "./material-you-theme-picker.scss";
import {
  M3_PRESET_SEEDS,
  applyMaterialYou,
  getStoredMode,
  getStoredSeed,
  type M3Mode,
} from "@renderer/helpers/material-you";

const MODES: { value: M3Mode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export function MaterialYouThemePicker() {
  const [seed, setSeed] = useState(getStoredSeed());
  const [mode, setMode] = useState<M3Mode>(getStoredMode());

  const handleSeed = useCallback(
    (next: string) => {
      setSeed(next);
      applyMaterialYou(next, mode);
    },
    [mode]
  );

  const handleMode = useCallback(
    (next: M3Mode) => {
      setMode(next);
      applyMaterialYou(seed, next);
    },
    [seed]
  );

  return (
    <section className="m3-picker" aria-label="Material You theme">
      <div className="m3-picker__header">
        <h3 className="m3-picker__title">Material You</h3>
        <p className="m3-picker__subtitle">
          Dynamic color from a seed. Same library, same database.
        </p>
      </div>

      <div className="m3-picker__row">
        {M3_PRESET_SEEDS.map((preset) => (
          <button
            key={preset}
            type="button"
            title={preset}
            aria-label={`Seed ${preset}`}
            onClick={() => handleSeed(preset)}
            className={cn("m3-picker__swatch", {
              "m3-picker__swatch--active":
                seed.toLowerCase() === preset.toLowerCase(),
            })}
            style={{ backgroundColor: preset }}
          />
        ))}

        <label className="m3-picker__custom" title="Custom seed color">
          <input
            type="color"
            value={seed}
            onChange={(event) => handleSeed(event.target.value)}
            aria-label="Custom seed color"
          />
          <span>Custom</span>
        </label>
      </div>

      <div className="m3-picker__row" role="group" aria-label="Color mode">
        {MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handleMode(item.value)}
            className={cn("m3-picker__mode", {
              "m3-picker__mode--active": mode === item.value,
            })}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
