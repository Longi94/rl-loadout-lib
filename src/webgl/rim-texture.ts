import { Color, Texture } from 'three';
import { bindColor, createTextureFromImage } from '../utils/webgl';
import { WebGLCanvasTexture } from './webgl-texture';
import { COLOR_INCLUDE } from './include/color';

export interface RimTexture {
  setPaint(color: Color);

  /**
   * Animate the rim texture. This is a no-op function unless overridden.
   * @param t time in milliseconds
   */
  animate(t: number);

  dispose();

  getTexture(): Texture;

  clone();
}

// language=GLSL
const FRAGMENT_SHADER = `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;

    uniform vec4 u_paint;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);

        // base body color
        gl_FragColor.rgb = base.rgb;

        // paint
        if (u_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_paint.rgb, mask);
        }
    }
`;

export class WebGLRimTexture extends WebGLCanvasTexture implements RimTexture {

  protected fragmentShader = () => FRAGMENT_SHADER.replace('mask', `${this.invertMask ? '1.0 - ' : ''}rgba_map.${this.maskChannel}`);

  private paintLocation: WebGLUniformLocation;
  private rgbaMapLocation: WebGLUniformLocation;

  private rgbaMapTexture: WebGLTexture;

  constructor(base?: HTMLImageElement, private rgbaMap?: HTMLImageElement, protected paint?: Color, private maskChannel?: string,
              private invertMask = false) {
    super(base);
  }

  protected initWebGL() {
    this.rgbaMapLocation = this.gl.getUniformLocation(this.program, 'u_rgba_map');
    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    super.initWebGL();
  }

  protected createTextures() {
    super.createTextures();
    this.rgbaMapTexture = createTextureFromImage(this.gl, this.rgbaMap);
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

  setPaint(color: Color) {
    this.paint = color;
    this.update();
  }

  protected update() {
    bindColor(this.gl, this.paintLocation, this.paint);
    super.update();
  }

  animate(t: number) {
  }

  dispose() {
    super.dispose();
    this.rgbaMap = undefined;
    if (this.gl != undefined) {
      this.gl.deleteTexture(this.rgbaMapTexture);
    }
  }

  protected copy(other: WebGLRimTexture) {
    super.copy(other);
    this.rgbaMap = other.rgbaMap.cloneNode(true) as HTMLImageElement;
  }

  clone(): WebGLRimTexture {
    const t = new WebGLRimTexture();
    t.copy(this);
    return t;
  }
}
