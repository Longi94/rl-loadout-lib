import { StaticDecalMaterial } from '../../webgl/static-decal-material';

const UNIFORMS = `
  uniform sampler2D rgbaMap;
  uniform vec3 primaryColor;
`;

const DIFFUSE_SHADER = `
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  // shadows
  texelColor.rgb = blendNormal(texelColor.rgb, vec3(0.0, 0.0, 0.0), 1.0 - rgbaMapColor.g);

  // primary color
  texelColor.rgb = blendNormal(texelColor.rgb, primaryColor.rgb, 1.0 - rgbaMapColor.a);

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class DarkCarMaterial extends StaticDecalMaterial {
  constructor() {
    super();
    this.fragmentShader = StaticDecalMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER);
  }
}
