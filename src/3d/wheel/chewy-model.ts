import { TireTexture } from '../../webgl/tire-texture';
import { CanvasTexture, Color, LinearEncoding, RepeatWrapping, Texture } from 'three';
import { BASIC_VERT_SHADER } from '../../webgl/include/vertex';
import { MultiImageLoader, PromiseLoader } from '../../utils/loader';
import { RocketConfig } from '../../model/rocket-config';
import { createOffscreenCanvas } from '../../utils/offscreen-canvas';
import { bindColor, createTextureFromImage, initShaderProgram, setRectangle } from '../../utils/webgl';
import { disposeIfExists } from '../../utils/util';
import { COLOR_INCLUDE } from '../../webgl/include/color';

// language=GLSL
const FRAGMENT_SHADER = () => `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_normal;

    uniform vec4 u_paint;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.078431, 0.078431, 0.078431, 1.0);
        // Look up a color from the texture.
        vec4 normal = texture2D(u_normal, v_texCoord);

        // paint
        if (u_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_paint.rgb, 1.0 - normal.r);
        }
    }
`;

export class ChewyTireTexture implements TireTexture {

  protected readonly loader: PromiseLoader;

  protected normal: HTMLImageElement;

  protected canvas: OffscreenCanvas | HTMLCanvasElement;
  protected gl: WebGLRenderingContext;
  protected program: WebGLProgram;

  private normalTexture: WebGLTexture;

  private texCoordBuffer: WebGLBuffer;
  private positionBuffer: WebGLBuffer;

  private texture: CanvasTexture;

  private paintLocation: WebGLUniformLocation;
  private normalLocation: WebGLUniformLocation;

  constructor(private readonly normalUrl: string, private paint: Color, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new MultiImageLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
  }

  async load() {
    const normalTask = this.loader.load(this.normalUrl);
    this.normal = await normalTask;
  }

  private init() {
    const width = this.normal.width;
    const height = this.normal.height;

    this.canvas = createOffscreenCanvas(width, height);

    this.gl = this.canvas.getContext('webgl', {premultipliedAlpha: false});
    this.program = initShaderProgram(this.gl, BASIC_VERT_SHADER, FRAGMENT_SHADER());
    this.gl.useProgram(this.program);

    this.initWebGL();

    // @ts-ignore
    this.texture = new CanvasTexture(this.canvas);
    this.texture.wrapS = RepeatWrapping;
    this.texture.wrapT = RepeatWrapping;
    this.texture.encoding = LinearEncoding;
    this.texture.flipY = false;
    this.update();
  }

  protected initWebGL() {
    // look up where the vertex data needs to go.
    this.normalLocation = this.gl.getUniformLocation(this.program, 'u_normal');
    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

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

    this.normalTexture = createTextureFromImage(this.gl, this.normal);
    this.gl.uniform1i(this.normalLocation, 0);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);

    // set the resolution
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    // Create a buffer for the position of the rectangle corners.
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    setRectangle(this.gl, 0, 0, this.normal.width, this.normal.height);
  }

  getTexture(): Texture {
    if (this.texture == undefined) {
      this.init();
    }
    return this.texture;
  }

  setPaint(color: Color) {
    this.paint = color;
    this.update();
  }

  protected update() {
    bindColor(this.gl, this.paintLocation, this.paint);
    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.normal = undefined;
    this.canvas = undefined;

    if (this.gl != undefined) {
      const numTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
      for (let unit = 0; unit < numTextureUnits; ++unit) {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
      }

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      this.gl.deleteTexture(this.normalTexture);
      this.gl.deleteBuffer(this.texCoordBuffer);
      this.gl.deleteBuffer(this.positionBuffer);
    }
    disposeIfExists(this.texture);
  }
}
