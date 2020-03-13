import { BodyModel } from './body-model';
import { Color } from 'three';
import { Decal } from '../../model/decal';
import { Body } from '../../model/body';
import { PaintConfig } from '../../model/paint-config';
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
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);

        // base body color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

        // primary color
        if (rgba_map.r > 0.16470588235) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_primary.rgb, rgba_map.r);
        }

        // grey color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, vec3(0.329729, 0.329729, 0.329729), rgba_map.a);
    }
`;

/**
 * Class for the 3D model of DeLorean Time Machine. Needed because of custom coloring.
 */
export class GreyCarModel extends BodyModel {

  constructor(body?: Body, decal?: Decal, bodyAssets?: BodyAssets, decalAssets?: DecalAssets, paints?: PaintConfig,
              keepContextAlive = false) {
    super(body, decal, bodyAssets, decalAssets, paints, keepContextAlive);
    this.setPrimaryColor(this.bodyMaterial.primaryColor);
  }

  setPaintColor(color: Color) {
  }

  changeDecal(decalAssets: DecalAssets, paints: PaintConfig) {
  }

  setPrimaryColor(color: Color) {
    this.bodyMaterial.primaryColor = color;
    this.chassisMaterial.paintColor = color;
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }
}
