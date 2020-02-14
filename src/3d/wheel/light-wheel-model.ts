import { WebGLRimTexture } from '../../webgl/rim-texture';
import { Color } from 'three';
import { COLOR_INCLUDE } from '../../webgl/include/color';

const ANIM_INTERVAL = 1000.0;

// language=GLSL
const FRAGMENT_SHADER = () => `
  precision mediump float;
  ` + COLOR_INCLUDE + `

  uniform sampler2D u_base;
  uniform sampler2D u_rgba_map;

  uniform float u_anim_offset;
  uniform vec4 u_paint;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

    vec2 rgba_coord = v_texCoord;
    rgba_coord.x = mod(rgba_coord.x + u_anim_offset, 1.0);

    // Look up a color from the texture.
    vec4 base = texture2D(u_base, v_texCoord);
    vec4 rgba_map = texture2D(u_rgba_map, rgba_coord);
    vec4 lights = texture2D(u_rgba_map, v_texCoord);
    lights.r = 0.0;

    // base body color
    gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, base.rgb, base.a);

    // light
    gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_paint.rgb, rgba_map.r * lights.g * lights.b);
  }
`;

/**
 * Animated rim texture for Photon wheels.
 */
export class LightWheelRimTexture extends WebGLRimTexture {
  fragmentShader = FRAGMENT_SHADER;

  private animOffsetLocation: WebGLUniformLocation;

  constructor(base: HTMLImageElement, rgbaMap: HTMLImageElement, protected paint: Color, keepContextAlive = false) {
    super(base, rgbaMap, paint, undefined, false, keepContextAlive);
    if (this.paint == undefined) {
      this.paint = new Color(0, 1, 1);
    }
  }

  protected initWebGL() {
    this.animOffsetLocation = this.gl.getUniformLocation(this.program, 'u_anim_offset');
    super.initWebGL();
  }

  animate(t: number) {
    if (this.gl != undefined) {
      this.gl.uniform1f(this.animOffsetLocation, (t % ANIM_INTERVAL) / ANIM_INTERVAL);
      this.update();
    }
  }

  setPaint(color: Color) {
    if (color == undefined) {
      color = new Color(0, 1, 1);
    }
    super.setPaint(color);
  }
}
