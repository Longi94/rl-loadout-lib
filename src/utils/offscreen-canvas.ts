export function createOffscreenCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  const useOffscreen = typeof OffscreenCanvas !== 'undefined';
  const canvas = useOffscreen ? new OffscreenCanvas(width, height) : document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
}
