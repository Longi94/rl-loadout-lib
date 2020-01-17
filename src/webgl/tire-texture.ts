import { Color } from 'three';
import { RocketConfig } from '../model/rocket-config';
import { bindColor } from '../utils/webgl';
import { WebGLCanvasTexture } from './webgl-texture';
import { COLOR_INCLUDE } from './include/color';

// language=GLSL
const FRAGMENT_SHADER = `
    precision mediump float;
  ` + COLOR_INCLUDE + `

    uniform sampler2D u_base;

    uniform vec4 u_paint;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Look up a color from the texture.
        vec4 base = texture2D(u_base, v_texCoord);

        // base body color
        gl_FragColor.rgb = base.rgb;

        // paint
        if (u_paint.r >= 0.0) {
            gl_FragColor.rgb = blendNormal(gl_FragColor.rgb, u_paint.rgb, 1.0 - base.a);
        }
    }
`;

export class TireTexture extends WebGLCanvasTexture {

  protected fragmentShader: string = FRAGMENT_SHADER;

  private paintLocation: WebGLUniformLocation;

  constructor(baseUrl, private paint: Color, rocketConfig: RocketConfig) {
    super(baseUrl, rocketConfig);
  }

  protected initWebGL(width: number, height: number) {
    this.paintLocation = this.gl.getUniformLocation(this.program, 'u_paint');
    super.initWebGL(width, height);
  }

  setPaint(color: Color) {
    this.paint = color;
    this.update();
  }

  protected update() {
    bindColor(this.gl, this.paintLocation, this.paint);
    super.update();
  }

}
