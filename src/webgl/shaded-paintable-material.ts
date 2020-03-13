import { RimMaterial, UNIFORMS } from './rim-material';

const DIFFUSE_SHADER = `
  // Look up a color from the texture.
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  // paint
  vec3 paint = paintColor * (rgbaMapColor.r / 0.5);

  if (painted == 1) {
      texelColor.rgb = blendNormal(texelColor.rgb, paint.rgb, rgbaMapColor.a);
  }

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class ShadedPaintableMaterial extends RimMaterial {
  constructor() {
    super(undefined, false);
    this.fragmentShader = RimMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER)
  }
}
