import { AbstractObject } from '../object';
import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene } from 'three';
import { Wheel, WheelConfig } from '../../model/wheel';
import { disposeIfExists, htmlImageToTexture } from '../../utils/util';
import { Paintable } from '../paintable';
import { PaintConfig } from '../../model/paint-config';
import { TireTexture } from '../../webgl/tire-texture';
import { getRimMaterial, getTireTexture } from './texture-factory';
import { WheelAssets } from '../../loader/wheel/wheel-assets';
import { RimMaterial } from '../../webgl/rim-material';

export class WheelModelInternal {
  model: Object3D;
  config: WheelConfig;
  spinnerJoint: Bone;
}

/**
 * Class that handles loading the 3D model of the car wheels.
 */
export class WheelsModel extends AbstractObject implements Paintable {

  rimMesh: Mesh;

  rimMaterial: RimMaterial;
  tireMaterial: MeshStandardMaterial;

  tireTexture: TireTexture | Color;

  constructor(protected assets?: WheelAssets, wheel?: Wheel, paints?: PaintConfig, protected keepContextAlive = false) {
    super(assets);
    if (assets != undefined) {
      this.rimMaterial = getRimMaterial(wheel, assets, paints);
      this.rimMesh.material = this.rimMaterial;
      this.tireTexture = getTireTexture(wheel, assets, paints, keepContextAlive);
    }
    this.init();
  }

  init() {
    if (this.assets != undefined) {
      if (this.tireTexture != undefined) {
        if (!(this.tireTexture instanceof Color)) {
          this.tireMaterial.map = this.tireTexture.getTexture();
        } else if (this.tireTexture instanceof Color) {
          this.tireMaterial.color = this.tireTexture;
        }
      }
      if (this.tireMaterial != undefined) {
        this.tireMaterial.normalMap = htmlImageToTexture(this.assets.tireN);
      }
      this.tireMaterial.needsUpdate = true;

      if (this.rimMaterial != undefined) {
        this.rimMaterial.normalMap = htmlImageToTexture(this.assets.rimN);
        this.rimMaterial.needsUpdate = true;
      }
    }

    if (!this.keepContextAlive) {
      this.tireTexture = undefined;
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.rimMaterial);
  }

  handleModel(scene: Scene) {
    scene.traverse(object => {
      if (object['isMesh']) {
        const mat = (object as Mesh).material as MeshStandardMaterial;
        if (mat.name.includes('rim')) {
          this.rimMesh = object as Mesh;
        } else if (mat.name.includes('tire')) {
          this.tireMaterial = mat;
        }
      }
    });
  }

  setPaintColor(paint: Color) {
    this.rimMaterial.paintColor = paint;
    if (this.tireTexture != undefined && !(this.tireTexture instanceof Color)) {
      this.tireTexture.setPaint(paint);
    }
  }

  /**
   * Animate the wheels. This is a safe no-op if the wheels are not animated.
   * @param t time in milliseconds
   * @param wheel the thing containing the wheel to animate
   * @param roll of the wheel
   */
  animate(t: number, wheel: WheelModelInternal, roll: number) {
    this.rimMaterial?.animate(t);
  }

  clone(): WheelsModel {
    const m = new WheelsModel();
    m.copy(this);
    return m;
  }
}
