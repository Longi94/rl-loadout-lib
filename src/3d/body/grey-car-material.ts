import { StaticDecalMaterial } from '../../webgl/static-decal-material';

const UNIFORMS = `
  uniform sampler2D rgbaMap;
  uniform vec3 primaryColor;
`;

const DIFFUSE_SHADER = `
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  // primary color
  if (rgbaMapColor.r > 0.16470588235) {
      texelColor.rgb = blendNormal(texelColor.rgb, primaryColor.rgb, rgbaMapColor.r);
  }

  // grey color
  texelColor.rgb = blendNormal(texelColor.rgb, vec3(0.329729, 0.329729, 0.329729), rgbaMapColor.a);

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

/**
 * Class for the 3D model of K.I.T.T. Needed because of custom coloring.
 */
export class GreyCarMaterial extends StaticDecalMaterial {
  constructor() {
    super();
    this.fragmentShader = StaticDecalMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER);
  }
}
