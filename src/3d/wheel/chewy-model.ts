import { RimMaterial } from '../../webgl/rim-material';
import { TireMaterial } from '../../webgl/tire-material';

const UNIFORMS = `
  uniform vec3 paintColor;
  uniform int painted;
`;

const DIFFUSE_SHADER = `
  vec4 normalColor = texture2D(normalMap, vUv);
  vec4 texelColor = vec4(0.078431, 0.078431, 0.078431, 1.0);

  if (painted == 1) {
    texelColor.rgb = blendNormal(texelColor.rgb, paintColor.rgb, normalColor.r);
  }

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class ChewyTireMaterial extends TireMaterial {
  constructor(invertMask: boolean = false) {
    super('r', invertMask);
    let diffuseShader = invertMask ? DIFFUSE_SHADER.replace('normalColor.r', '1.0-normalColor.r') : DIFFUSE_SHADER;
    this.fragmentShader = RimMaterial.createFragmentShader(UNIFORMS, diffuseShader);
  }
}
