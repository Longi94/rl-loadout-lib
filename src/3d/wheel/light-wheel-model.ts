import { WheelsModel } from './wheels-model';
import { RimTexture } from '../../webgl/rim-texture';
import { Color } from 'three';
import { getAssetUrl } from '../../utils/network';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { Wheel } from '../../model/wheel';

const ANIM_INTERVAL = 1000.0;

// language=GLSL
const FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_base;
  uniform sampler2D u_rgba_map;

  uniform float u_anim_offset;
  uniform vec4 u_paint;

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
    gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, vec3(0, 1, 1), rgba_map.r * lights.g * lights.b);
  }
`;

class LightWheelRimTexture extends RimTexture {
  fragmentShader = FRAGMENT_SHADER;

  private animOffsetLocation: WebGLUniformLocation;

  protected initWebGL(width: number, height: number) {
    this.animOffsetLocation = this.gl.getUniformLocation(this.program, 'u_anim_offset');
    super.initWebGL(width, height);
  }

  animate(t: number) {
    if (this.gl != undefined) {
      this.gl.uniform1f(this.animOffsetLocation, t);
      this.update();
    }
  }
}

/**
 * Animated model for Photon wheels.
 */
export class LightWheelModel extends WheelsModel {
  animate(t: number) {
    (this.rimSkin as LightWheelRimTexture).animate((t % ANIM_INTERVAL) / ANIM_INTERVAL);
    this.rimMaterial.needsUpdate = true;
  }

  protected initRimSkin(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig) {
    this.rimSkin = new LightWheelRimTexture(
      getAssetUrl(wheel.rim_base, rocketConfig),
      getAssetUrl(wheel.rim_rgb_map, rocketConfig),
      paints.wheel,
      rocketConfig)
  }
}
