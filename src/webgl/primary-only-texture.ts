import { WebGLCanvasTexture } from './webgl-texture';
import { BodyTexture } from '../3d/body/body-texture';
import { Color } from 'three';
import { PaintConfig } from '../model/paint-config';
import { bindColor, createTextureFromImage } from '../utils/webgl';


export class PrimaryOnlyTexture extends WebGLCanvasTexture implements BodyTexture {

  primary: Color;

  private primaryLocation: WebGLUniformLocation;
  private rgbaMapLocation: WebGLUniformLocation;

  private rgbaMapTexture: WebGLTexture;

  constructor(base: HTMLImageElement, private bodyBlankSkin: HTMLImageElement, paints: PaintConfig, fragmentShader: () => string,
              keepContextAlive = false) {
    super(base, keepContextAlive);
    this.fragmentShader = fragmentShader;
    this.primary = paints.primary;
  }

  protected initWebGL() {
    this.rgbaMapLocation = this.gl.getUniformLocation(this.program, 'u_rgba_map');
    this.primaryLocation = this.gl.getUniformLocation(this.program, 'u_primary');
    super.initWebGL();
  }

  protected createTextures() {
    super.createTextures();
    this.rgbaMapTexture = createTextureFromImage(this.gl, this.bodyBlankSkin);
  }

  protected setTextureLocations() {
    super.setTextureLocations();
    this.gl.uniform1i(this.rgbaMapLocation, 1);
  }

  protected bindTextures() {
    super.bindTextures();
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbaMapTexture);
  }

  protected update() {
    bindColor(this.gl, this.primaryLocation, this.primary);
    super.update();
  }

  dispose() {
    super.dispose();
    this.bodyBlankSkin = undefined;
    if (this.gl != undefined) {
      this.gl.deleteTexture(this.rgbaMapTexture);
    }
    this.rgbaMapTexture = undefined;
  }

  setAccent(color: Color) {
  }

  setBodyPaint(color: Color) {
  }

  setPaint(color: Color) {
  }

  setPrimary(color: Color) {
    this.primary = color;
    this.update();
  }
}
