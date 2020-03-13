import { Color, Texture } from 'three';
import { ExtendedMeshStandardMaterial } from './extended-mesh-standard-material';

const UNIFORMS = `
  uniform sampler2D rgbaMap;
  uniform sampler2D decalMap;

  uniform vec3 primaryColor;
  uniform vec3 accentColor;
  uniform vec3 paintColor;
  uniform vec3 bodyPaintColor;
  uniform int bodyPainted;
  uniform int painted;
  uniform int isBlank;
`;

const DIFFUSE_SHADER = `
  // Get color from base map
  vec4 texelColor = texture2D(map, vUv);
  vec4 rgbaMapColor = texture2D(rgbaMap, vUv);
  vec4 decalMapColor = texture2D(decalMap, vUv);

  if (bodyPainted == 1) {
    texelColor.rgb = blendNormal(texelColor.rgb, bodyPaintColor.rgb, 1.0 - rgbaMapColor.r);
  }

  // primary color
  float primaryMask = rgbaMapColor.r;

  if (isBlank == 0) {
    primaryMask = decalMapColor.r;
  }

  if (primaryMask > 0.58823529411) { // red 150
    texelColor.rgb = blendNormal(texelColor.rgb, primaryColor.rgb, primaryMask);
  }

  if (isBlank == 0) {
    // accent color
    if (primaryMask > 0.58823529411) {
      texelColor.rgb = blendNormal(texelColor.rgb, accentColor.rgb, decalMapColor.a);
    }

    // decal paint
    if (painted == 1) {
      texelColor.rgb = blendNormal(texelColor.rgb, paintColor.rgb, decalMapColor.g);
    }
  }

  // accent color on body
  texelColor.rgb = blendNormal(texelColor.rgb, accentColor.rgb, rgbaMapColor.g);

  texelColor = mapTexelToLinear(texelColor);
  diffuseColor *= texelColor;
`;

export class StaticDecalMaterial extends ExtendedMeshStandardMaterial {

  lights = true;

  constructor() {
    super();
    this.fragmentShader = ExtendedMeshStandardMaterial.createFragmentShader(UNIFORMS, DIFFUSE_SHADER);
    this.uniforms.rgbaMap = {value: null};
    this.uniforms.decalMap = {value: null};
    this.uniforms.primaryColor = {value: new Color()};
    this.uniforms.accentColor = {value: new Color()};
    this.uniforms.paintColor = {value: new Color()};
    this.uniforms.bodyPaintColor = {value: new Color()};
    this.uniforms.painted = {value: 0};
    this.uniforms.isBlank = {value: 0};
    this.uniforms.bodyPainted = {value: 0};
  }

  get rgbaMap(): Texture {
    return this.uniforms.rgbaMap.value;
  }

  set rgbaMap(rgbaMap: Texture) {
    this.uniforms.rgbaMap.value = rgbaMap;
  }

  get decalMap(): Texture {
    return this.uniforms.decalMap.value;
  }

  set decalMap(decalMap: Texture) {
    this.uniforms.decalMap.value = decalMap;
    this.uniforms.isBlank.value = decalMap != undefined ? 0 : 1;
  }

  get primaryColor(): Color {
    return this.uniforms.primaryColor.value;
  }

  set primaryColor(primaryColor: Color) {
    if (primaryColor != undefined) {
      this.uniforms.primaryColor.value.copy(primaryColor);
    } else {
      this.uniforms.primaryColor.value.setRGB(0, 0, 0);
    }
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
      this.uniforms.accentColor.value.copy(paintColor);
      this.uniforms.painted.value = 1;
    } else {
      this.uniforms.painted.value = 0.0;
    }
  }

  get bodyPaintColor(): Color {
    return this.uniforms.bodyPaintColor.value;
  }

  set bodyPaintColor(bodyPaintColor: Color) {
    if (bodyPaintColor != undefined) {
      this.uniforms.bodyPaintColor.value.copy(bodyPaintColor);
      this.uniforms.bodyPainted.value = 1;
    } else {
      this.uniforms.bodyPainted.value = 0;
    }
  }
}
