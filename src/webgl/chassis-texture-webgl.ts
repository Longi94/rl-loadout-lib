import { CanvasTexture, Color, LinearEncoding, RepeatWrapping, Texture } from 'three';
import { MultiImageLoader, PromiseLoader } from '../utils/loader';
import { PaintConfig } from '../model/paint-config';
import { RocketConfig } from '../model/rocket-config';
import { bindColor, createTextureFromImage, initShaderProgram, setRectangle } from '../utils/webgl';


// language=GLSL
const VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
    }
`;

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

export class ChassisTextureWebGL {

  private readonly loader: PromiseLoader;

  private base: HTMLImageElement;
  private rgbaMap: HTMLImageElement;

  private accent: Color;
  private paint: Color;

  private canvas: OffscreenCanvas;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;

  private paintLocation: WebGLUniformLocation;
  private accentLocation: WebGLUniformLocation;

  private baseTexture: WebGLTexture;
  private rgbaMapTexture: WebGLTexture;

  private texCoordBuffer: WebGLBuffer;
  private positionBuffer: WebGLBuffer;

  private texture: CanvasTexture;

  constructor(private readonly baseUrl: string, private readonly rgbaMapUrl: string, private readonly paintable: boolean,
              paints: PaintConfig, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new MultiImageLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.accent = paints.accent;
    this.paint = paints.body;
  }

  async load() {
    const baseTask = this.loader.load(this.baseUrl);
    const rgbaMapTask = this.loader.load(this.rgbaMapUrl);

    this.base = await baseTask;
    this.rgbaMap = await rgbaMapTask;

    const width = this.base.width;
    const height = this.base.height;

    this.initWebGL(width, height);

    // @ts-ignore
    this.texture = new CanvasTexture(this.canvas);
    this.texture.wrapS = RepeatWrapping;
    this.texture.wrapT = RepeatWrapping;
    this.texture.encoding = LinearEncoding;
    this.texture.flipY = false;
    this.update();
  }

  private initWebGL(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height);

    this.gl = this.canvas.getContext('webgl', {premultipliedAlpha: false});
    this.program = initShaderProgram(this.gl, VERTEX_SHADER, FRAGMENT_SHADER);
    this.gl.useProgram(this.program);

    // look up where the vertex data needs to go.
    const baseLocation = this.gl.getUniformLocation(this.program, 'u_base');
    const rgbaMapLocation = this.gl.getUniformLocation(this.program, 'u_rgba_map');
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    const hasAlphaLocation = this.gl.getUniformLocation(this.program, 'u_has_alpha');
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    this.accentLocation = this.gl.getUniformLocation(this.program, 'u_accent');

    this.gl.uniform1i(hasAlphaLocation, hasAlpha(this.base) ? 1 : 0);

    // provide texture coordinates for the rectangle.
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.baseTexture = createTextureFromImage(this.gl, this.base);
    this.rgbaMapTexture = createTextureFromImage(this.gl, this.rgbaMap);

    this.gl.uniform1i(baseLocation, 0);
    this.gl.uniform1i(rgbaMapLocation, 1);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.baseTexture);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbaMapTexture);

    // set the resolution
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    // Create a buffer for the position of the rectangle corners.
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    setRectangle(this.gl, 0, 0, this.base.width, this.base.height);
  }

  setPaint(paint: Color) {
    this.paint = paint;
    this.update();
  }

  setAccent(accent: Color) {
    this.accent = accent;
    this.update();
  }

  private update() {
    bindColor(this.gl, this.accentLocation, this.accent);
    bindColor(this.gl, this.paintLocation, this.paintable ? this.paint : undefined);

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.base = undefined;
    this.rgbaMap = undefined;

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.deleteTexture(this.baseTexture);
    this.gl.deleteTexture(this.rgbaMapTexture);
    this.gl.deleteBuffer(this.texCoordBuffer);
    this.gl.deleteBuffer(this.positionBuffer);
  }

  getTexture(): Texture {
    return this.texture;
  }
}

// so hacky
function hasAlpha(image): boolean {
  const canvas = new OffscreenCanvas(image.width, image.height);
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
