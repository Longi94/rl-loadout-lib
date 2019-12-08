import { RocketConfig } from '../model/rocket-config';
import { MultiImageLoader, PromiseLoader } from '../utils/loader';
import { createTextureFromImage, initShaderProgram, setRectangle } from '../utils/webgl';
import { CanvasTexture, LinearEncoding, RepeatWrapping, Texture } from 'three';
import { createOffscreenCanvas } from '../utils/offscreen-canvas';
import { disposeIfExists } from '../utils/util';

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

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = texture2D(u_base, v_texCoord);
    }
`;

export class WebGLCanvasTexture {

  protected readonly loader: PromiseLoader;

  protected vertexShader: string = VERTEX_SHADER;
  protected fragmentShader: string = FRAGMENT_SHADER;

  protected base: HTMLImageElement;

  protected canvas: OffscreenCanvas | HTMLCanvasElement;
  protected gl: WebGLRenderingContext;
  protected program: WebGLProgram;

  private baseTexture: WebGLTexture;

  private texCoordBuffer: WebGLBuffer;
  private positionBuffer: WebGLBuffer;

  private texture: CanvasTexture;

  private baseLocation: WebGLUniformLocation;

  constructor(private readonly baseUrl: string, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new MultiImageLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
  }

  async load() {
    const baseTask = this.loader.load(this.baseUrl);
    this.base = await baseTask;
  }

  private init() {
    const width = this.base.width;
    const height = this.base.height;

    this.canvas = createOffscreenCanvas(width, height);

    this.gl = this.canvas.getContext('webgl', {premultipliedAlpha: false});
    this.program = initShaderProgram(this.gl, this.vertexShader, this.fragmentShader);
    this.gl.useProgram(this.program);

    this.initWebGL(width, height);

    // @ts-ignore
    this.texture = new CanvasTexture(this.canvas);
    this.texture.wrapS = RepeatWrapping;
    this.texture.wrapT = RepeatWrapping;
    this.texture.encoding = LinearEncoding;
    this.texture.flipY = false;
    this.update();
  }

  protected initWebGL(width: number, height: number) {
    // look up where the vertex data needs to go.
    this.baseLocation = this.gl.getUniformLocation(this.program, 'u_base');
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

    this.createTextures();
    this.setTextureLocations();
    this.bindTextures();

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

  protected createTextures() {
    this.baseTexture = createTextureFromImage(this.gl, this.base);
  }

  protected setTextureLocations() {
    this.gl.uniform1i(this.baseLocation, 0);
  }

  protected bindTextures() {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.baseTexture);
  }

  getTexture(): Texture {
    if (this.texture == undefined) {
      this.init();
    }
    return this.texture;
  }

  protected update() {
    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.base = undefined;
    this.canvas = undefined;

    if (this.gl != undefined) {
      const numTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
      for (let unit = 0; unit < numTextureUnits; ++unit) {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
      }

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      this.gl.deleteTexture(this.baseTexture);
      this.gl.deleteBuffer(this.texCoordBuffer);
      this.gl.deleteBuffer(this.positionBuffer);
    }
    disposeIfExists(this.texture);
  }
}
