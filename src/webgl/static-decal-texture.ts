import { Color } from 'three';
import { BodyTexture } from '../3d/body/body-texture';
import { PaintConfig } from '../model/paint-config';
import { bindColor, bindEmptyTexture, createTextureFromImage } from '../utils/webgl';
import { WebGLCanvasTexture } from './webgl-texture';
import { COLOR_INCLUDE } from './include/color';

// language=GLSL
const FRAGMENT_SHADER = () => `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;
    uniform sampler2D u_decal_map;

    uniform vec4 u_primary;
    uniform vec4 u_accent;
    uniform vec4 u_body_paint;
    uniform vec4 u_decal_paint;

    uniform int u_is_blank;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);
        vec4 decal_map = texture2D(u_decal_map, v_texCoord);

        // base body color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

        // body paint
        if (u_body_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_body_paint.rgb, 1.0 - rgba_map.r);
        }

        // primary color
        float primary_mask = rgba_map.r;

        if (u_is_blank == 0) {
            primary_mask = decal_map.r;
        }

        if (primary_mask > 0.58823529411) { // red 150
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_primary.rgb, primary_mask);
        }

        if (u_is_blank == 0) {
            // accent color
            if (primary_mask > 0.58823529411) {
                gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_accent.rgb, decal_map.a);
            }

            // decal paint
            if (u_decal_paint.r >= 0.0) {
                gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_decal_paint.rgb, decal_map.g);
            }
        }

        // accent color on body
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_accent.rgb, rgba_map.g);
    }
`;

export class StaticDecalTexture extends WebGLCanvasTexture implements BodyTexture {

  protected fragmentShader = FRAGMENT_SHADER;

  private primary: Color;
  private accent: Color;
  private paint: Color;
  private bodyPaint: Color;

  private primaryLocation: WebGLUniformLocation;
  private bodyPaintLocation: WebGLUniformLocation;
  private accentLocation: WebGLUniformLocation;
  private decalPaintLocation: WebGLUniformLocation;
  private rgbaMapLocation: WebGLUniformLocation;
  private decalMapLocation: WebGLUniformLocation;

  private rgbaMapTexture: WebGLTexture;
  private decalMapTexture: WebGLTexture;

  constructor(base: HTMLImageElement, private decalRgbaMap: HTMLImageElement, private bodyBlankSkin: HTMLImageElement,
              paints: PaintConfig, keepContextAlive = false) {
    super(base, keepContextAlive);

    this.primary = paints.primary;
    this.accent = paints.accent;
    this.paint = paints.decal;
    this.bodyPaint = paints.body;
  }

  protected initWebGL() {
    this.rgbaMapLocation = this.gl.getUniformLocation(this.program, 'u_rgba_map');
    this.decalMapLocation = this.gl.getUniformLocation(this.program, 'u_decal_map');
    const isBlankLocation = this.gl.getUniformLocation(this.program, 'u_is_blank');

    this.primaryLocation = this.gl.getUniformLocation(this.program, 'u_primary');
    this.bodyPaintLocation = this.gl.getUniformLocation(this.program, 'u_body_paint');
    this.accentLocation = this.gl.getUniformLocation(this.program, 'u_accent');
    this.decalPaintLocation = this.gl.getUniformLocation(this.program, 'u_decal_paint');

    this.gl.uniform1i(isBlankLocation, this.decalRgbaMap != undefined ? 0 : 1);

    super.initWebGL();
  }

  protected createTextures() {
    super.createTextures();
    this.rgbaMapTexture = createTextureFromImage(this.gl, this.bodyBlankSkin);

    if (this.decalRgbaMap != undefined) {
      this.decalMapTexture = createTextureFromImage(this.gl, this.decalRgbaMap);
    } else {
      this.decalMapTexture = bindEmptyTexture(this.gl);
    }
  }

  protected setTextureLocations() {
    super.setTextureLocations();
    this.gl.uniform1i(this.rgbaMapLocation, 1);
    this.gl.uniform1i(this.decalMapLocation, 2);
  }

  protected bindTextures() {
    super.bindTextures();
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbaMapTexture);
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.decalMapTexture);
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

  protected update() {
    bindColor(this.gl, this.primaryLocation, this.primary);
    bindColor(this.gl, this.accentLocation, this.accent);
    bindColor(this.gl, this.bodyPaintLocation, this.bodyPaint);
    bindColor(this.gl, this.decalPaintLocation, this.paint);
    super.update();
  }

  dispose() {
    super.dispose();
    this.decalRgbaMap = undefined;
    this.bodyBlankSkin = undefined;
    if (this.gl != undefined) {
      this.gl.deleteTexture(this.rgbaMapTexture);
      this.gl.deleteTexture(this.decalMapTexture);
    }
    this.rgbaMapTexture = undefined;
    this.decalMapTexture = undefined;
  }
}
