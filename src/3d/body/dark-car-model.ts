import { BodyModel } from './body-model';
import { Color } from 'three';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { PaintConfig } from '../../model/paint-config';
import { Body } from '../../model/body';
import { RocketConfig } from '../../model/rocket-config';
import { PrimaryOnlyTexture } from '../../webgl/primary-only-texture';
import { COLOR_INCLUDE } from '../../webgl/include/color';

// language=GLSL
const FRAGMENT_SHADER = () => `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;

    uniform vec4 u_primary;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);

        // base body color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

        // shadows
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, vec3(0.0, 0.0, 0.0), 1.0 - rgba_map.g);

        // primary color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_primary.rgb, 1.0 - rgba_map.a);
    }
`;

/**
 * Class for the 3D model of 16' Batmobile. Needed because of custom coloring.
 */
export class DarkCarModel extends BodyModel {

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
