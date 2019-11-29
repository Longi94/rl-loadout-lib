import { BodyModel } from './body-model';
import { Color } from 'three';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { Body } from '../../model/body';
import { PaintConfig } from '../../model/paint-config';
import { getAssetUrl } from '../../utils/network';
import { RocketConfig } from '../../model/rocket-config';
import { bindColor, createTextureFromImage } from '../../utils/webgl';
import { WebGLCanvasTexture } from '../../webgl/webgl-texture';

// language=GLSL
const FRAGMENT_SHADER = `
    precision mediump float;

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;

    uniform vec4 u_primary;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    vec3 blendNormal(vec3 base, vec3 blend) {
        return blend;
    }

    vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
        return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
    }

    void main() {
        gl_FragColor = vec4(0.1988877, 0.1988877, 0.1988877, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);

        // base body color TODO somehow use base texture?
        // gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

        // primary color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_primary.rgb, 1.0 - rgba_map.a);
    }
`;


class EggplantBodySkin extends WebGLCanvasTexture implements BodyTexture {

  protected fragmentShader: string = FRAGMENT_SHADER;

  private readonly blankSkinUrl: string;

  private bodyBlankSkin: HTMLImageElement;

  private primary: Color;

  private primaryLocation: WebGLUniformLocation;
  private rgbaMapLocation: WebGLUniformLocation;

  private rgbaMapTexture: WebGLTexture;

  constructor(body: Body, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(body.base_skin, rocketConfig), rocketConfig);
    this.blankSkinUrl = getAssetUrl(body.blank_skin, rocketConfig);
    this.primary = paints.primary;
  }

  async load() {
    const superTask = super.load();
    const rgbaMapTask = this.loader.load(this.blankSkinUrl);

    this.bodyBlankSkin = await rgbaMapTask;
    await superTask;
  }

  protected initWebGL(width: number, height: number) {
    this.rgbaMapLocation = this.gl.getUniformLocation(this.program, 'u_rgba_map');
    this.primaryLocation = this.gl.getUniformLocation(this.program, 'u_primary');
    super.initWebGL(width, height);
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
    this.gl.deleteTexture(this.rgbaMapTexture);
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

export class EggplantModel extends BodyModel {

  initBodySkin(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig): BodyTexture {
    return new EggplantBodySkin(body, paints, rocketConfig);
  }

  setPaintColor(color: Color) {
  }

  async changeDecal(decal: Decal, paints: PaintConfig) {
  }

  setPrimaryColor(color: Color) {
    this.bodySkin.setPrimary(color);
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }
}
