// icons.ts — SVG registry, asset preload pipeline, and monochrome draw helper.
//
// Design rules enforced here:
//   • All icons render monochromatically — brand colors are ignored.
//   • A single tint color + globalCompositeOperation is applied per draw call.
//   • Icons are preloaded and cached before the animation loop starts.
//   • Failures are non-fatal: the icon is simply skipped.

// ---------------------------------------------------------------------------
// SVG URLs — served from /public/icons/ as static assets
// ---------------------------------------------------------------------------

const amazonUrl        = '/icons/amazon-svgrepo-com.svg';
const androidUrl       = '/icons/android-svgrepo-com.svg';
const awsLambdaUrl     = '/icons/aws-lambda-svgrepo-com (1).svg';
const awsUrl           = '/icons/aws-svgrepo-com.svg';
const nginxUrl         = '/icons/brand-nginx-svgrepo-com.svg';
const coffeeUrl        = '/icons/coffee-bean-for-a-coffee-break-svgrepo-com.svg';
const datadogUrl       = '/icons/datadog-svgrepo-com (1).svg';
const dockerUrl        = '/icons/docker-svgrepo-com (1).svg';
const gameUrl          = '/icons/game-svgrepo-com.svg';
const garlicUrl        = '/icons/garlic-svgrepo-com.svg';
const githubUrl        = '/icons/github-svgrepo-com.svg';
const kubernetesUrl    = '/icons/kubernetes-svgrepo-com (1).svg';
const javascriptUrl    = '/icons/language-javascript-svgrepo-com.svg';
const typescriptUrl    = '/icons/language-typescript-svgrepo-com.svg';
const linuxUrl         = '/icons/linux-svgrepo-com (1).svg';
const llamaUrl         = '/icons/llama-svgrepo-com.svg';
const pythonUrl        = '/icons/python-127-svgrepo-com.svg';
const slackUrl         = '/icons/slack-outline-svgrepo-com.svg';
const slothUrl         = '/icons/sloth-svgrepo-com.svg';
const snakeUrl         = '/icons/snake-svgrepo-com.svg';
const terraformUrl     = '/icons/terraform-svgrepo-com.svg';
const whaleUrl         = '/icons/whale-svgrepo-com.svg';

// ---------------------------------------------------------------------------
// Icon registry — maps stable keys to resolved asset URLs
// ---------------------------------------------------------------------------

export const ICON_REGISTRY: Readonly<Record<string, string>> = {
  amazon:     amazonUrl,
  android:    androidUrl,
  awsLambda:  awsLambdaUrl,
  aws:        awsUrl,
  nginx:      nginxUrl,
  coffee:     coffeeUrl,
  datadog:    datadogUrl,
  docker:     dockerUrl,
  game:       gameUrl,
  garlic:     garlicUrl,
  github:     githubUrl,
  kubernetes: kubernetesUrl,
  javascript: javascriptUrl,
  typescript: typescriptUrl,
  linux:      linuxUrl,
  llama:      llamaUrl,
  python:     pythonUrl,
  slack:      slackUrl,
  sloth:      slothUrl,
  snake:      snakeUrl,
  terraform:  terraformUrl,
  whale:      whaleUrl,
};

/** Ordered array of all icon keys, used for random sampling in the particle system. */
export const ICON_KEYS: ReadonlyArray<string> = Object.keys(ICON_REGISTRY);

// ---------------------------------------------------------------------------
// Preload pipeline
// ---------------------------------------------------------------------------

/** Cache of successfully loaded icon images keyed by icon key. */
const imageCache = new Map<string, HTMLImageElement>();

/** Singleton readiness promise — call preloadIcons() multiple times safely. */
let _readyPromise: Promise<Map<string, HTMLImageElement>> | null = null;

function loadSingleIcon(key: string, url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(key, img);
      resolve();
    };
    img.onerror = () => {
      // Non-fatal: warn and skip — missing icons won't crash the engine.
      console.warn(`[icons] Failed to load icon "${key}" from ${url}`);
      resolve();
    };
    img.src = url;
  });
}

/**
 * Preloads all registered icons into the image cache.
 * Returns a Promise that resolves with the populated cache.
 * Safe to call multiple times — returns the same promise after the first call.
 *
 * The engine must await this before entering the animation loop.
 */
export function preloadIcons(): Promise<Map<string, HTMLImageElement>> {
  if (_readyPromise) return _readyPromise;

  _readyPromise = Promise.all(
    Object.entries(ICON_REGISTRY).map(([key, url]) => loadSingleIcon(key, url)),
  ).then(() => imageCache);

  return _readyPromise;
}

/**
 * Synchronously retrieves a cached icon image.
 * Returns undefined if the icon hasn't been loaded yet.
 */
export function getIconImage(key: string): HTMLImageElement | undefined {
  return imageCache.get(key);
}

/**
 * Returns whether all icons have finished loading.
 * Useful for a startup guard in the engine.
 */
export function iconsReady(): boolean {
  return imageCache.size > 0 && _readyPromise !== null;
}

// ---------------------------------------------------------------------------
// Monochrome draw helper
// ---------------------------------------------------------------------------

/**
 * Draws a single icon onto `ctx` with monochrome tinting.
 *
 * Strategy:
 *   1. Draw the icon normally (preserves alpha/shape).
 *   2. Overlay the tint color using `source-atop` compositing so only
 *      icon pixels are tinted — brand colors are effectively replaced.
 *
 * @param ctx        - Canvas 2D context.
 * @param img        - Preloaded icon image.
 * @param x          - Draw X position (centre of icon).
 * @param y          - Draw Y position (centre of icon).
 * @param size       - Rendered icon size in logical pixels.
 * @param tintColor  - CSS color string for the monochrome tint.
 * @param alpha      - Overall opacity (0–1).
 */
export function drawMonochromeIcon(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  tintColor: string,
  alpha: number,
): void {
  const half = size / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Step 1 — draw the icon shape (establishes the alpha mask).
  ctx.drawImage(img, x - half, y - half, size, size);

  // Step 2 — paint tint color on top, clipped to the icon's own pixels.
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = tintColor;
  ctx.fillRect(x - half, y - half, size, size);

  // Restore default composite op before returning.
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

