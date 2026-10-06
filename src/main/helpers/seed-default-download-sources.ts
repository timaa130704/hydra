import { createHash } from "node:crypto";
import { downloadSourcesSublevel } from "@main/level";
import { HydraApi } from "@main/services/hydra-api";
import { logger } from "@main/services";
import { DownloadSourceStatus } from "@shared";
import type { DownloadSource } from "@types";

/** Default download sources bundled with UnknownLauncher (same LevelDB). */
export const DEFAULT_DOWNLOAD_SOURCE_URLS = [
  "https://hydralinks.cloud/sources/steamrip.json",
  "https://hydralinks.cloud/sources/fitgirl.json",
  "https://hydralinks.cloud/sources/onlinefix.json",
  "https://hydralinks.cloud/sources/xatab.json",
  "https://wkeynhk.online/steamgg.json",
  "https://raw.githubusercontent.com/KekitU/rutracker-hydra-links/main/all_categories.json",
] as const;

const DEFAULT_DOWNLOAD_SOURCE_NAMES: Record<string, string> = {
  "https://hydralinks.cloud/sources/steamrip.json": "SteamRip",
  "https://hydralinks.cloud/sources/fitgirl.json": "FitGirl",
  "https://hydralinks.cloud/sources/onlinefix.json": "OnlineFix",
  "https://hydralinks.cloud/sources/xatab.json": "Xatab",
  "https://wkeynhk.online/steamgg.json": "SteamGG",
  "https://raw.githubusercontent.com/KekitU/rutracker-hydra-links/main/all_categories.json":
    "Rutracker",
};

const localIdForUrl = (url: string) =>
  `default-${createHash("sha1").update(url).digest("hex").slice(0, 16)}`;

/**
 * Ensures the bundled sources exist in the local DB so the user can pick
 * a source when downloading a game. Entries are stored in the same
 * `downloadSources` sublevel (same database, no schema change).
 * Tries the API first; falls back to a local entry when offline so the
 * source list is never empty. Local fallbacks are picked up later by
 * `migrateDownloadSources` once the API is reachable.
 */
export const seedDefaultDownloadSources = async () => {
  let existing: DownloadSource[] = [];
  try {
    existing = await downloadSourcesSublevel.values().all();
  } catch (error) {
    logger.error("Failed to read download sources for seeding:", error);
    return;
  }

  const existingUrls = new Set(existing.map((source) => source.url));

  for (const url of DEFAULT_DOWNLOAD_SOURCE_URLS) {
    if (existingUrls.has(url)) continue;

    try {
      const downloadSource = await HydraApi.post<DownloadSource>(
        "/download-sources",
        { url },
        { needsAuth: false }
      );

      await downloadSourcesSublevel.put(downloadSource.id, {
        ...downloadSource,
        isRemote: true,
        createdAt: new Date().toISOString(),
      });

      logger.log(`Seeded default download source: ${url}`);
    } catch (error) {
      logger.warn(
        `API unreachable, seeding local fallback for download source: ${url}`,
        error
      );

      const id = localIdForUrl(url);
      try {
        await downloadSourcesSublevel.get(id);
        continue;
      } catch {
        /* not found -> create fallback */
      }

      try {
        await downloadSourcesSublevel.put(id, {
          id,
          name: DEFAULT_DOWNLOAD_SOURCE_NAMES[url] ?? url,
          url,
          status: DownloadSourceStatus.PendingMatching,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
        } as DownloadSource);
      } catch (putError) {
        logger.error(
          `Failed to seed local download source fallback: ${url}`,
          putError
        );
      }
    }
  }
};
