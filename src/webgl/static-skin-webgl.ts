import { CanvasTexture, Color, LinearEncoding, RepeatWrapping, Texture } from 'three';
import { Decal } from '../model/decal';
import { getAssetUrl } from '../utils/network';
import { BodyTexture } from '../3d/body/body-texture';
import { MultiImageLoader, PromiseLoader } from '../utils/loader';
import { Body } from '../model/body';
import { PaintConfig } from '../model/paint-config';
import { RocketConfig } from '../model/rocket-config';
import { bindEmptyTexture, createTextureFromImage, initShaderProgram, setRectangle } from '../utils/webgl';


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
    uniform sampler2D u_decal_map;

    uniform vec4 u_primary;
    uniform vec4 u_accent;
    uniform vec4 u_body_paint;
    uniform vec4 u_paint;
    uniform vec4 u_decal_paint;

    uniform int u_is_blank;

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
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

        // body paint
        if (u_body_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_body_paint.rgb, 1.0 - rgba_map.r);
        }

        // primary color
        if (rgba_map.r > 0.58823529411) { // red 150
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_primary.rgb, rgba_map.r);
        }

        if (u_is_blank == 0) {

            vec4 decal_map = texture2D(u_decal_map, v_texCoord);

            // accent color
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_accent.rgb, decal_map.a);

            // decal paint
            if (u_decal_paint.r >= 0.0) {
                gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_decal_paint.rgb, decal_map.g);
            }
        }

        // accent color on body
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_accent.rgb, rgba_map.g);
    }
`;

export class StaticSkinWebGL implements BodyTexture {

  private readonly loader: PromiseLoader;

  private readonly baseUrl: string;
  private readonly rgbaMapUrl: string;
  private readonly bodyBaseSkinUrl: string;
  private readonly bodyBlankSkinUrl: string;

  private base: HTMLImageElement;
  private decalRgbaMap: HTMLImageElement;
  private bodyBlankSkin: HTMLImageElement;

  private primary: Color;
  private accent: Color;
  private paint: Color;
  private bodyPaint: Color;

  private canvas: OffscreenCanvas;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;

  private primaryLocation: WebGLUniformLocation;
  private bodyPaintLocation: WebGLUniformLocation;
  private paintLocation: WebGLUniformLocation;
  private accentLocation: WebGLUniformLocation;
  private decalPaintLocation: WebGLUniformLocation;

  private baseTexture: WebGLTexture;
  private rgbaMapTexture: WebGLTexture;
  private decalMapTexture: WebGLTexture;

  private texCoordBuffer: WebGLBuffer;
  private positionBuffer: WebGLBuffer;

  private texture: CanvasTexture;

  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new MultiImageLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.baseUrl = getAssetUrl(decal.base_texture, rocketConfig);
    this.rgbaMapUrl = getAssetUrl(decal.rgba_map, rocketConfig);
    this.bodyBaseSkinUrl = getAssetUrl(body.base_skin, rocketConfig);
    this.bodyBlankSkinUrl = getAssetUrl(body.blank_skin, rocketConfig);

    this.primary = paints.primary;
    this.accent = paints.accent;
    this.paint = paints.decal;
    this.bodyPaint = paints.body;
  }

  async load() {
    const baseTask = this.loader.load(this.baseUrl != undefined ? this.baseUrl : this.bodyBaseSkinUrl);
    const rgbaMapTask = this.loader.load(this.rgbaMapUrl);
    const bodyBlankSkinTask = this.loader.load(this.bodyBlankSkinUrl);

    const baseResult = await baseTask;

    const width = baseResult.width;
    const height = baseResult.height;

    this.base = baseResult;

    const rgbaMapResult = await rgbaMapTask;
    if (rgbaMapResult != undefined) {
      this.decalRgbaMap = rgbaMapResult;
    }

    this.bodyBlankSkin = await bodyBlankSkinTask;

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
    const decalMapLocation = this.gl.getUniformLocation(this.program, 'u_decal_map');
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    const isBlankLocation = this.gl.getUniformLocation(this.program, 'u_is_blank');
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

    this.primaryLocation = this.gl.getUniformLocation(this.program, 'u_primary');
    this.bodyPaintLocation = this.gl.getUniformLocation(this.program, 'u_body_paint');
    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    this.accentLocation = this.gl.getUniformLocation(this.program, 'u_accent');
    this.decalPaintLocation = this.gl.getUniformLocation(this.program, 'u_decal_paint');

    this.gl.uniform1i(isBlankLocation, this.decalRgbaMap != undefined ? 0 : 1);

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
    this.rgbaMapTexture = createTextureFromImage(this.gl, this.bodyBlankSkin);

    if (this.decalRgbaMap != undefined) {
      this.decalMapTexture = createTextureFromImage(this.gl, this.decalRgbaMap);
    } else {
      this.decalMapTexture = bindEmptyTexture(this.gl);
    }

    this.gl.uniform1i(baseLocation, 0);
    this.gl.uniform1i(rgbaMapLocation, 1);
    this.gl.uniform1i(decalMapLocation, 2);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.baseTexture);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbaMapTexture);
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.decalMapTexture);

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

  setBodyPaint(color: Color) {
    this.bodyPaint = color;
    this.update();
  }

  setPrimary(color: Color) {
    this.primary = color;
    this.update();
  }

  setAccent(color: Color) {
    this.accent = color;
    this.update();
  }

  setPaint(color: Color) {
    this.paint = color;
    this.update();
  }

  private update() {
    this.gl.uniform4f(this.primaryLocation, this.primary.r, this.primary.g, this.primary.b, 1);
    this.gl.uniform4f(this.accentLocation, this.accent.r, this.accent.g, this.accent.b, 1);

    if (this.bodyPaint != undefined) {
      this.gl.uniform4f(this.bodyPaintLocation, this.bodyPaint.r, this.bodyPaint.g, this.bodyPaint.b, 1);
    } else {
      this.gl.uniform4f(this.bodyPaintLocation, -1, -1, -1, -1);
    }

    if (this.paint != undefined) {
      this.gl.uniform4f(this.decalPaintLocation, this.paint.r, this.paint.g, this.paint.b, 1);
    } else {
      this.gl.uniform4f(this.decalPaintLocation, -1, -1, -1, -1);
    }

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.base = undefined;
    this.decalRgbaMap = undefined;
    this.bodyBlankSkin = undefined;

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.deleteTexture(this.baseTexture);
    this.gl.deleteTexture(this.rgbaMapTexture);
    this.gl.deleteTexture(this.decalMapTexture);
    this.gl.deleteBuffer(this.texCoordBuffer);
    this.gl.deleteBuffer(this.positionBuffer);
  }

  getTexture(): Texture {
    return this.texture;
  }
}
