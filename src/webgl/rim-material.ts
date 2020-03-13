import { ExtendedMeshStandardMaterial } from './extended-mesh-standard-material';
import { Color, Texture } from 'three';

export const UNIFORMS = `
  uniform sampler2D rgbaMap;
  uniform vec3 paintColor;
  uniform int painted;
`;

const DIFFUSE_SHADER = `
  // Look up a color from the texture.
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  // paint
  if (painted == 1) {
      texelColor.rgb = blendNormal(texelColor.rgb, paintColor.rgb, mask);
  }

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class RimMaterial extends ExtendedMeshStandardMaterial {
  constructor(private maskChannel: string, private invertMask = false) {
    super();
    this.fragmentShader = ExtendedMeshStandardMaterial.createFragmentShader(UNIFORMS,
      DIFFUSE_SHADER.replace('mask', `${invertMask ? '1.0 - ' : ''}rgbaMapColor.${maskChannel}`));
    this.uniforms.rgbaMap = {value: null};
    this.uniforms.paintColor = {value: new Color()};
    this.uniforms.painted = {value: 0};
  }

  get rgbaMap(): Texture {
    return this.uniforms.rgbaMap.value;
  }

  set rgbaMap(rgbaMap: Texture) {
    this.uniforms.rgbaMap.value = rgbaMap;
  }

  get paintColor(): Color {
    return this.uniforms.paintColor.value;
  }

  set paintColor(paintColor: Color) {
    if (paintColor != undefined) {
      this.uniforms.paintColor.value.copy(paintColor);
      this.uniforms.painted.value = 1;
    } else {
      this.uniforms.painted.value = 0;
    }
  }

  animate(t: number) {
  }
}
