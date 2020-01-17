// language=GLSL
export const COLOR_INCLUDE = `
  vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
    return (blend * opacity + base * (1.0 - opacity));
  }
`;
