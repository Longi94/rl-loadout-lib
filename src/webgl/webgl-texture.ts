import { createTextureFromImage, initShaderProgram, setRectangle } from '../utils/webgl';
import { CanvasTexture, DataTexture, LinearEncoding, RepeatWrapping, RGBAFormat, Texture } from 'three';
import { createOffscreenCanvas } from '../utils/offscreen-canvas';
import { BASIC_VERT_SHADER } from './include/vertex';
import { GlobalWebGLContext } from './global-context';

// language=GLSL
const VERTEX_SHADER = () => BASIC_VERT_SHADER;

// language=GLSL
const FRAGMENT_SHADER = () => `
  precision mediump float;

  uniform sampler2D u_base;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_base, v_texCoord);
  }
`;

export class WebGLCanvasTexture {

  protected vertexShader: () => string = VERTEX_SHADER;
  protected fragmentShader: () => string = FRAGMENT_SHADER;

  protected canvas: OffscreenCanvas | HTMLCanvasElement;
  protected gl: WebGLRenderingContext;
  protected program: WebGLProgram;

  private baseTexture: WebGLTexture;

  private texCoordBuffer: WebGLBuffer;
  private positionBuffer: WebGLBuffer;

  private texture: CanvasTexture;

  private baseLocation: WebGLUniformLocation;

  constructor(protected base: HTMLImageElement, protected keepContextAlive = false) {
  }

  private init() {
    const width = this.base.width;
    const height = this.base.height;

    if (this.keepContextAlive) {
      this.canvas = createOffscreenCanvas(width, height);
      this.gl = this.canvas.getContext('webgl', {premultipliedAlpha: false});
    } else {
      this.gl = GlobalWebGLContext.get();
      this.canvas = GlobalWebGLContext.canvas;
    }

    this.program = initShaderProgram(this.gl, this.vertexShader(), this.fragmentShader());
    this.gl.useProgram(this.program);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);

    this.initWebGL();
    this.update();

    if (this.keepContextAlive) {
      // @ts-ignore
      this.texture = new CanvasTexture(this.canvas);
      this.texture.flipY = false;
    } else {
      const pixels = new Uint8Array(this.gl.drawingBufferWidth * this.gl.drawingBufferHeight * 4);
      this.gl.readPixels(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      this.texture = new DataTexture(pixels, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight, RGBAFormat);
      this.texture.flipY = true;
      this.dispose();
    }

    this.texture.wrapS = RepeatWrapping;
    this.texture.wrapT = RepeatWrapping;
    this.texture.encoding = LinearEncoding;
    this.texture.needsUpdate = true;
  }

  protected initWebGL() {
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
    this.texture.needsUpdate = true;
    return this.texture;
  }

  protected update() {
    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.texture != undefined) {
      this.texture.needsUpdate = true;
    }
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
      this.gl.deleteProgram(this.program);
    }

    this.program = undefined;
    this.baseTexture = undefined;
    this.texCoordBuffer = undefined;
    this.positionBuffer = undefined;
  }
}
