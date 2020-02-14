import { Color } from 'three';
import { COLOR_INCLUDE } from './include/color';
import { WebGLRimTexture } from './rim-texture';

// language=GLSL
const FRAGMENT_SHADER = () => `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;
    uniform sampler2D u_rgba_map;

    uniform vec4 u_paint;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 rgba_map = texture2D(u_rgba_map, v_texCoord);

        // base body color
        gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

        vec4 paint = u_paint * (rgba_map.r / 0.5);

        // paint
        if (u_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, paint.rgb, rgba_map.a);
        }
    }
`;

export class ShadedPaintableTexture extends WebGLRimTexture {
  fragmentShader = FRAGMENT_SHADER;

  constructor(base: HTMLImageElement, rgbaMap: HTMLImageElement, protected paint: Color, keepContextAlive = false) {
    super(base, rgbaMap, paint, undefined, false, keepContextAlive);
  }
}
