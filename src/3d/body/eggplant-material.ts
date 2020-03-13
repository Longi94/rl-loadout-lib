import { StaticDecalMaterial } from '../../webgl/static-decal-material';

const UNIFORMS = `
  uniform sampler2D rgbaMap;
  uniform vec3 primaryColor;
`;

const DIFFUSE_SHADER = `
  vec4 texelColor = vec4(0.1988877, 0.1988877, 0.1988877, 1.0);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  texelColor.rgb = blendNormal(texelColor.rgb, primaryColor.rgb, 1.0 - rgbaMapColor.a);

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class EggplantMaterial extends StaticDecalMaterial {
  constructor() {
    super();
    this.fragmentShader = StaticDecalMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER);
  }
}
