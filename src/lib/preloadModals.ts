"use client";

// Preloaders map targeting dynamic modal chunks
export const modalLoaders = {
  // Priority 1: Core daily workflow modals (opened most frequently by user)
  connect: () => import("@/components/connectBar"),
  extra: () => import("@/components/extraSettingBar"),
  lightcone: () => import("@/components/lightconeBar"),
  relic: () => import("@/components/relicBar"),

  // Priority 2: Profile management & Battle settings
  profileManager: () => import("@/components/profileManager"),
  copyImport: () => import("@/components/importBar/copy"),
  monster: () => import("@/components/monsterBar"),

  // Priority 3: Data importers (ordered by usage)
  freesr: () => import("@/components/importBar/freesr"),
  hoyolab: () => import("@/components/importBar/hoyolab"),
  fribbels: () => import("@/components/importBar/fribbels"),
  enka: () => import("@/components/importBar/enka"),

  // Changelog is statically imported in Header so it opens instantly on version updates,
  // but loader is preserved here for completeness.
  changelog: () => import("@/components/changelog"),
} as const;

export type ModalKey = keyof typeof modalLoaders;


const PRELOAD_STAGES: ModalKey[][] = [
  ["monster", "relic"],
  ["lightcone"],
  ["connect", "extra"],
  ["freesr", "hoyolab", "fribbels", "enka"],
  ["profileManager", "copyImport"],
];

const preloadedKeys = new Set<string>();
let isPreloadStarted = false;

/**
 * Safely preload a specific modal on demand.
 * Guaranteed to execute only once per modal.
 */
export function preloadModal(key: ModalKey): void {
  if (typeof window === "undefined" || preloadedKeys.has(key)) return;
  preloadedKeys.add(key);

  try {
    const loader = modalLoaders[key];
    if (loader) {
      loader().catch((err) => {
        // Suppress network/chunk error during preload without throwing
        console.warn(`[Preload] Error preloading modal "${key}":`, err);
        preloadedKeys.delete(key);
      });
    }
  } catch {
    preloadedKeys.delete(key);
  }
}

/**
 * Run task in browser idle time to avoid interfering with user input or main thread rendering.
 */
function runWhenIdle(callback: () => void, timeout = 2500): void {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number })
      .requestIdleCallback(() => callback(), { timeout });
  } else {
    setTimeout(callback, 50);
  }
}

/**
 * Initiates staged background preloading across idle cycles after initial data is ready.
 * Modals are loaded sequentially with intervals to keep CPU and network free for UI.
 */
export function startPreloadModals(): void {
  if (typeof window === "undefined" || isPreloadStarted) return;
  isPreloadStarted = true;

  let delay = 100; // Initial delay after data load ready
  const STAGE_INTERVAL = 300; // ms interval between priority stages
  const ITEM_INTERVAL = 150; // ms interval between items within a stage

  for (const stage of PRELOAD_STAGES) {
    for (const key of stage) {
      const scheduledKey = key;
      const scheduledDelay = delay;

      setTimeout(() => {
        runWhenIdle(() => {
          preloadModal(scheduledKey);
        });
      }, scheduledDelay);

      delay += ITEM_INTERVAL;
    }
    delay += STAGE_INTERVAL;
  }
}
