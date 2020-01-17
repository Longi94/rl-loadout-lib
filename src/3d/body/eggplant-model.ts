import { BodyModel } from './body-model';
import { Color } from 'three';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { Body } from '../../model/body';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { PrimaryOnlyTexture } from '../../webgl/primary-only-texture';
import { COLOR_INCLUDE } from '../../webgl/include/color';

// language=GLSL
const FRAGMENT_SHADER = `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;

    uniform vec4 u_primary;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

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

/**
 * Class for the 3D model of 89' Batmobile. Needed because of custom coloring.
 */
export class EggplantModel extends BodyModel {

  initBodySkin(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig): BodyTexture {
    return new PrimaryOnlyTexture(body, paints, rocketConfig, FRAGMENT_SHADER);
  }

  setPaintColor(color: Color) {
  }

  async changeDecal(decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
  }

  setPrimaryColor(color: Color) {
    this.bodySkin.setPrimary(color);
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }
}
