import { COLOR_INCLUDE } from '../../webgl/include/color';
import { RimMaterial } from '../../webgl/rim-material';

const ANIM_INTERVAL = 1000.0;

const UNIFORMS = `
  uniform sampler2D rgbaMap;

  uniform float animOffset;
  uniform vec3 paintColor;
  uniform int painted;
`;

const DIFFUSE_SHADER = `
  vec2 rgbaCoord = vUv;
  rgbaCoord.x = mod(rgbaCoord.x + animOffset, 1.0);

  // Look up a color from the texture.
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, rgbaCoord);
  vec4 lights = texture2D(rgbaMap, vUv);
  lights.r = 0.0;

  // light
  if (painted == 1) {
    texelColor.rgb = blendNormal(texelColor.rgb, paintColor.rgb, rgbaMapColor.r * lights.g * lights.b);
  } else {
    texelColor.rgb = blendNormal(texelColor.rgb, lights.rgb, rgbaMapColor.r * lights.g * lights.b);
  }

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

/**
 * Animated rim texture for Photon wheels.
 */
export class LightWheelRimMaterial extends RimMaterial {
  constructor() {
    super('');
    this.fragmentShader = RimMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER);
    this.uniforms.animOffset = {value: 0.0};
  }

  animate(t: number) {
    this.uniforms.animOffset.value = (t % ANIM_INTERVAL) / ANIM_INTERVAL;
  }
}

