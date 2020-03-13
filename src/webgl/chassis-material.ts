import { Color, Texture } from 'three';
import { createOffscreenCanvas } from '../utils/offscreen-canvas';
import { ExtendedMeshStandardMaterial } from './extended-mesh-standard-material';

const UNIFORMS = `
  uniform sampler2D rgbaMap;

  uniform vec3 accentColor;
  uniform vec3 paintColor;
  uniform int painted;
  uniform int hasAlpha;
`;

const DIFFUSE_SHADER = `
  // Get color from base map
  vec4 texelColor = texture2D(map, vUv);

  // get color from rgba map
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);

  if (painted == 1) {
    texelColor.rgb = blendNormal(texelColor.rgb, paintColor.rgb, rgbaMapColor.r);
  }

  // accent color on body
  if (hasAlpha == 1) {
    texelColor.rgb = blendNormal(texelColor.rgb, accentColor.rgb, texelColor.a);
  }

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class ChassisMaterial extends ExtendedMeshStandardMaterial {

  paintable = false;

  constructor() {
    super(
      {
        rgbaMap: {value: null},
        accentColor: {value: new Color()},
        paintColor: {value: new Color()},
        painted: {value: 0},
        hasAlpha: {value: 0},
      },
      UNIFORMS,
      DIFFUSE_SHADER
    );
  }

  get map(): Texture {
    return this.uniforms.map.value;
  }

  set map(map: Texture) {
    this.uniforms.map.value = map;
    this.uniforms.hasAlpha.value = hasAlpha(map.image) ? 1 : 0;
  }

  get normalMap(): Texture {
    return this.uniforms.normalMap.value;
  }

  set normalMap(normalMap: Texture) {
    this.uniforms.normalMap.value = normalMap;
  }

  get envMap(): Texture {
    return this.uniforms.envMap.value;
  }

  set envMap(envMap: Texture) {
    this.uniforms.envMap.value = envMap;
  }

  get rgbaMap(): Texture {
    return this.uniforms.rgbaMap.value;
  }

  set rgbaMap(rgbaMap: Texture) {
    this.uniforms.rgbaMap.value = rgbaMap;
  }

  get accentColor(): Color {
    return this.uniforms.accentColor.value;
  }

  set accentColor(accentColor: Color) {
    if (accentColor != undefined) {
      this.uniforms.accentColor.value.copy(accentColor);
    } else {
      this.uniforms.accentColor.value.setRGB(0, 0, 0);
    }
  }

  get paintColor(): Color {
    return this.uniforms.paintColor.value;
  }

  set paintColor(paintColor: Color) {
    if (paintColor != undefined) {
      this.uniforms.paintColor.value.copy(paintColor);
      this.uniforms.painted.value = this.paintable ? 1 : 0;
    } else {
      this.uniforms.painted.value = 0;
    }
  }
}

// so hacky
function hasAlpha(image): boolean {
  const canvas = createOffscreenCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(0, 0, image.width, image.height).data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      return true;
    }
  }

  return false;
}
