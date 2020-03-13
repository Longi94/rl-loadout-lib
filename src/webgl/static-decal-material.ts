import { Color, ShaderLib, ShaderMaterial, Texture, UniformsLib, UniformsUtils } from 'three';
import { COLOR_INCLUDE } from './include/color';

// language=GLSL
const FRAGMENT_SHADER = `
  #define STANDARD
  #ifdef PHYSICAL
  #define REFLECTIVITY
  #define CLEARCOAT
  #define TRANSPARENCY
  #endif
  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform float roughness;
  uniform float metalness;
  uniform float opacity;
  #ifdef TRANSPARENCY
  uniform float transparency;
  #endif
  #ifdef REFLECTIVITY
  uniform float reflectivity;
  #endif
  #ifdef CLEARCOAT
  uniform float clearcoat;
  uniform float clearcoatRoughness;
  #endif
  #ifdef USE_SHEEN
  uniform vec3 sheen;
  #endif
  varying vec3 vViewPosition;
  #ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
  varying vec3 vTangent;
  varying vec3 vBitangent;
  #endif
  #endif
  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <bsdfs>
  #include <cube_uv_reflection_fragment>
  #include <envmap_common_pars_fragment>
  #include <envmap_physical_pars_fragment>
  #include <fog_pars_fragment>
  #include <lights_pars_begin>
  #include <lights_physical_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <clearcoat_normalmap_pars_fragment>
  #include <roughnessmap_pars_fragment>
  #include <metalnessmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>

  ` + COLOR_INCLUDE + `

  uniform sampler2D baseMap;
  uniform sampler2D rgbaMap;
  uniform sampler2D decalMap;

  uniform vec3 primaryColor;
  uniform vec3 accentColor;
  uniform vec3 paintColor;
  uniform vec3 bodyPaintColor;
  uniform int bodyPainted;
  uniform int painted;
  uniform int isBlank;

  void main() {
    #include <clipping_planes_fragment>
    vec4 diffuseColor = vec4(diffuse, opacity);
    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 totalEmissiveRadiance = emissive;
    #include <logdepthbuf_fragment>

    // Get color from base map
    vec4 texelColor = texture2D(baseMap, vUv);
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

    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <clearcoat_normal_fragment_begin>
    #include <clearcoat_normal_fragment_maps>
    #include <emissivemap_fragment>
    #include <lights_physical_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    #include <aomap_fragment>
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    #ifdef TRANSPARENCY
    diffuseColor.a *= saturate(1. - transparency + linearToRelativeLuminance(reflectedLight.directSpecular + reflectedLight.indirectSpecular));
    #endif
    gl_FragColor = vec4(outgoingLight, diffuseColor.a);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;

export class StaticDecalMaterial extends ShaderMaterial {

  lights = true;

  constructor() {
    super({
      vertexShader: ShaderLib.standard.vertexShader,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: UniformsUtils.merge([
        UniformsLib.common,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.emissivemap,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.roughnessmap,
        UniformsLib.metalnessmap,
        UniformsLib.fog,
        UniformsLib.lights,
        {
          emissive: {value: new Color(0x000000)},
          roughness: {value: 0.5},
          metalness: {value: 0.5},
          envMapIntensity: {value: 1}, // temporary
          baseMap: {value: null},
          rgbaMap: {value: null},
          decalMap: {value: null},
          primaryColor: {value: new Color()},
          accentColor: {value: new Color()},
          paintColor: {value: new Color()},
          bodyPaintColor: {value: new Color()},
          painted: {value: 0},
          isBlank: {value: 0},
          bodyPainted: {value: 0}
        },
      ]),
    });
  }

  get baseMap(): Texture {
    return this.uniforms.baseMap.value;
  }

  set baseMap(baseMap: Texture) {
    this.uniforms.baseMap.value = baseMap;
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
}
