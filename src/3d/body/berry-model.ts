import { BodyModel } from './body-model';
import { Color } from 'three';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { PaintConfig } from '../../model/paint-config';
import { WheelConfig } from '../../model/wheel';
import { PrimaryOnlyTexture } from '../../webgl/primary-only-texture';
import { COLOR_INCLUDE } from '../../webgl/include/color';
import { BodyAssets } from '../../loader/body/body-assets';
import { DecalAssets } from '../../loader/decal/decal-assets';

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
        gl_FragColor = vec4(0.25, 0.25, 0.25, 1.0);
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
 * Class for the 3D model of The Dark Knight Rises Tumbler. Needed because of the double back wheels and custom coloring.
 */
export class BerryModel extends BodyModel {

  protected initBodySkin(bodyAssets: BodyAssets, decalAssets: DecalAssets, paints: PaintConfig): BodyTexture {
    return new PrimaryOnlyTexture(bodyAssets.baseSkin, bodyAssets.blankSkin, paints, FRAGMENT_SHADER, this.keepContextAlive);
  }

  setPaintColor(color: Color) {
  }

  changeDecal(decalAssets: DecalAssets, paints: PaintConfig) {
  }

  setPrimaryColor(color: Color) {
    //this.bodySkin.setPrimary(color);
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }

  protected getWheelPositions() {
    super.getWheelPositions();

    const confToAdd: WheelConfig[] = [];

    for (const config of this.wheelConfig) {
      if (!config.front) {
        const newConfig = config.clone();

        if (newConfig.right) {
          newConfig.position.setY(newConfig.position.y - newConfig.width);
        } else {
          newConfig.position.setY(newConfig.position.y + newConfig.width);
        }

        confToAdd.push(newConfig);
      }
    }

    this.wheelConfig = this.wheelConfig.concat(confToAdd);
  }
}
