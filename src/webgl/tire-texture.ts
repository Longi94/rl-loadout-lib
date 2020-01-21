import { Color, Texture } from 'three';
import { RocketConfig } from '../model/rocket-config';
import { bindColor, createTextureFromImage } from '../utils/webgl';
import { WebGLCanvasTexture } from './webgl-texture';
import { COLOR_INCLUDE } from './include/color';

export interface TireTexture {
  load();

  setPaint(color: Color);

  dispose();

  getTexture(): Texture;
}

// language=GLSL
const FRAGMENT_SHADER = `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;
    uniform sampler2D u_normal;

    uniform vec4 u_paint;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 normal = texture2D(u_normal, v_texCoord);

        // base body color
        gl_FragColor.rgb = base.rgb;

        // paint
        if (u_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_paint.rgb, mask);
        }
    }
`;

export class WebGLTireTexture extends WebGLCanvasTexture implements TireTexture {

  private normal: HTMLImageElement;

  private paintLocation: WebGLUniformLocation;
  private normalLocation: WebGLUniformLocation;

  private normalTexture: WebGLTexture;

  protected fragmentShader = () => FRAGMENT_SHADER.replace('mask', `${this.invertMask ? '1.0 - ' : ''}${this.useN ? 'normal' :
    'base'}.${this.maskChannel}`);

  constructor(baseUrl: string, private normalUrl: string, private paint: Color, rocketConfig: RocketConfig, private maskChannel: string,
              private useN: boolean = false, private invertMask: boolean = false) {
    super(baseUrl, rocketConfig);
  }

  async load() {
    const superTask = super.load();
    const normalTask = this.loader.load(this.normalUrl);

    this.normal = await normalTask;
    await superTask;
  }

  protected initWebGL() {
    this.normalLocation = this.gl.getUniformLocation(this.program, 'u_normal');
    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    super.initWebGL();
  }

  protected createTextures() {
    super.createTextures();
    this.normalTexture = createTextureFromImage(this.gl, this.normal);
  }

  protected setTextureLocations() {
    super.setTextureLocations();
    this.gl.uniform1i(this.normalLocation, 1);
  }

  protected bindTextures() {
    super.bindTextures();
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
  }

  setPaint(color: Color) {
    this.paint = color;
    this.update();
  }

  protected update() {
    bindColor(this.gl, this.paintLocation, this.paint);
    super.update();
  }

  dispose() {
    super.dispose();
    this.normal = undefined;
    if (this.gl != undefined) {
      this.gl.deleteTexture(this.normalTexture);
    }
  }
}

export class WebGLUnpaintableTireTexture extends WebGLTireTexture {
  constructor(baseUrl: string, normalUrl: string, rocketConfig: RocketConfig) {
    super(baseUrl, normalUrl, undefined, rocketConfig, 'a');
  }

  setPaint(color: Color) {
    super.setPaint(undefined);
  }
}
