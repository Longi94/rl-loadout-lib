import { createOffscreenCanvas } from '../utils/offscreen-canvas';

export class GlobalWebGLContext {
  static canvas: OffscreenCanvas | HTMLCanvasElement;
  static gl: WebGLRenderingContext;

  static get() {
    if (GlobalWebGLContext.canvas == undefined) {
      GlobalWebGLContext.canvas = createOffscreenCanvas(2048, 2048);
    }
    if (GlobalWebGLContext.gl == undefined) {
      GlobalWebGLContext.gl = this.canvas.getContext('webgl', {premultipliedAlpha: false});
    }
    return GlobalWebGLContext.gl;
  }

  static dispose() {
    const numTextureUnits = GlobalWebGLContext.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
    for (let unit = 0; unit < numTextureUnits; ++unit) {
      GlobalWebGLContext.gl.activeTexture(GlobalWebGLContext.gl.TEXTURE0 + unit);
      GlobalWebGLContext.gl.bindTexture(GlobalWebGLContext.gl.TEXTURE_2D, null);
      GlobalWebGLContext.gl.bindTexture(GlobalWebGLContext.gl.TEXTURE_CUBE_MAP, null);
    }
    GlobalWebGLContext.canvas = undefined;
    GlobalWebGLContext.gl = undefined;
  }
}
