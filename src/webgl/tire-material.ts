import { ExtendedMeshStandardMaterial } from './extended-mesh-standard-material';
import { Color } from 'three';

const UNIFORMS = `
  uniform vec3 paintColor;
  uniform int painted;
  uniform int colorOnly;
`;

const DIFFUSE_SHADER = `
  // Look up a color from the texture.
  if (colorOnly == 0) {
    vec4 texelColor = texture2D(map, vUv);
    vec4 normalMapColor = texture2D(normalMap, vUv);;

    // paint
    if (painted == 1) {
      texelColor.rgb = blendNormal(texelColor.rgb, paintColor.rgb, mask);
    }

    texelColor = mapTexelToLinear(texelColor);
    diffuseColor *= texelColor;
  }
`;

export class TireMaterial extends ExtendedMeshStandardMaterial {
  constructor(private maskChannel: string, private useN = false, private invertMask = false) {
    super();
    this.fragmentShader = ExtendedMeshStandardMaterial.createFragmentShader(UNIFORMS,
      DIFFUSE_SHADER.replace('mask', `${invertMask ? '1.0 - ' : ''}${useN ? 'normalMapColor' : 'texelColor'}.${maskChannel}`));
    this.uniforms.paintColor = {value: new Color()};
    this.uniforms.painted = {value: 0};
  }

  get color(): Color {
    return this.uniforms.color.value;
  }

  set color(color: Color) {
    this.uniforms.color.value = color;
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

  get colorOnly(): boolean {
    return this.uniforms.colorOnly.value === 1;
  }

  set colorOnly(colorOnly: boolean) {
    this.uniforms.colorOnly.value = colorOnly ? 1 : 0;
  }
}

export class UnpaintableTireMaterial extends TireMaterial {
  constructor() {
    super('a');
  }

  get paintColor(): Color {
    return undefined;
  }

  set paintColor(paintColor: Color) {
    super.paintColor = undefined;
  }
}
