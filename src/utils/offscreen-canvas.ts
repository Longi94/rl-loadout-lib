/**
 * Creates and OffscreenCanvas. Falls back to HTMLCanvasElement if OffscreenCanvas is not supported.
 * @param width width of the canvas in pixels
 * @param height height of the canvas in pixels
 */
export function createOffscreenCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  const useOffscreen = typeof OffscreenCanvas !== 'undefined';
  const canvas = useOffscreen ? new OffscreenCanvas(width, height) : document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
}
