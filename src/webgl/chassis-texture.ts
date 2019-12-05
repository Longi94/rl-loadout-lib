import { Color } from 'three';
import { PaintConfig } from '../model/paint-config';
import { RocketConfig } from '../model/rocket-config';
import { bindColor, createTextureFromImage } from '../utils/webgl';
import { WebGLCanvasTexture } from './webgl-texture';
import { createOffscreenCanvas } from '../utils/offscreen-canvas';


// language=GLSL
const FRAGMENT_SHADER = `
    precision mediump float;

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;

    uniform vec4 u_accent;
    uniform vec4 u_paint;

    uniform int u_has_alpha;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    vec3 blendNormal(vec3 base, vec3 blend) {
        return blend;
    }

    vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
        return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
    }

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);

        // base body color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, 1.0);

        // body paint
        if (u_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_paint.rgb, rgba_map.r);
        }

        // accent color on body
        if (u_has_alpha > 0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_accent.rgb, base.a);
        }
    }
`;

export class ChassisTexture extends WebGLCanvasTexture {

  private rgbaMap: HTMLImageElement;

  protected fragmentShader: string = FRAGMENT_SHADER;

  private accent: Color;
  private paint: Color;

  private paintLocation: WebGLUniformLocation;
  private accentLocation: WebGLUniformLocation;
  private rgbaMapLocation: WebGLUniformLocation;

  private rgbaMapTexture: WebGLTexture;

  constructor(baseUrl: string, private readonly rgbaMapUrl: string, private readonly paintable: boolean,
              paints: PaintConfig, rocketConfig: RocketConfig) {
    super(baseUrl, rocketConfig);
    this.accent = paints.accent;
    this.paint = paints.body;
  }

  async load() {
    const superTask = super.load();
    const rgbaMapTask = this.loader.load(this.rgbaMapUrl);
    this.rgbaMap = await rgbaMapTask;
    await superTask;
  }

  protected initWebGL(width: number, height: number) {
    this.rgbaMapLocation = this.gl.getUniformLocation(this.program, 'u_rgba_map');
    const hasAlphaLocation = this.gl.getUniformLocation(this.program, 'u_has_alpha');

    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    this.accentLocation = this.gl.getUniformLocation(this.program, 'u_accent');

    this.gl.uniform1i(hasAlphaLocation, hasAlpha(this.base) ? 1 : 0);

    super.initWebGL(width, height);
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

  setPaint(paint: Color) {
    this.paint = paint;
    this.update();
  }

  setAccent(accent: Color) {
    this.accent = accent;
    this.update();
  }

  protected update() {
    bindColor(this.gl, this.accentLocation, this.accent);
    bindColor(this.gl, this.paintLocation, this.paintable ? this.paint : undefined);
    super.update();
  }

  dispose() {
    super.dispose();
    this.rgbaMap = undefined;
    this.gl.deleteTexture(this.rgbaMapTexture);
  }
}

// so hacky
function hasAlpha(image): boolean {
  const canvas = createOffscreenCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(0, 0, image.width, image.height).data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      return true;
    }
  }

  return false;
}
