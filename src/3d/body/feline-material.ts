import { StaticDecalMaterial } from '../../webgl/static-decal-material';

const UNIFORMS = `
  uniform sampler2D rgbaMap;
  uniform vec3 primaryColor;
`;

const DIFFUSE_SHADER = `
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  // black base
  if (rgbaMapColor.r > 0.16470588235) {
      texelColor.rgb = blendNormal(texelColor.rgb, vec3(0.04943346, 0.04943346, 0.04943346), rgbaMapColor.r);
  }

  // primary color
  texelColor.rgb = blendNormal(texelColor.rgb, primaryColor.rgb, 1.0 - rgbaMapColor.a);

  // back light
  texelColor.rgb = blendNormal(texelColor.rgb, vec3(0.5, 0.0, 0.0), rgbaMapColor.g);

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

/**
 * Class for the 3D model of K.I.T.T. Needed because of custom coloring.
 */
export class FelineMaterial extends StaticDecalMaterial {
  constructor() {
    super();
    this.fragmentShader = StaticDecalMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER);
  }
}
