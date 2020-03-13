import { AbstractObject } from '../object';
import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene } from 'three';
import { Wheel, WheelConfig } from '../../model/wheel';
import { disposeIfExists } from '../../utils/util';
import { Paintable } from '../paintable';
import { PaintConfig } from '../../model/paint-config';
import { getRimMaterial, getTireMaterial } from './texture-factory';
import { WheelAssets } from '../../loader/wheel/wheel-assets';
import { RimMaterial } from '../../webgl/rim-material';
import { TireMaterial } from '../../webgl/tire-material';

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
  tireMesh: Mesh;

  rimMaterial: RimMaterial;
  tireMaterial: TireMaterial;

  constructor(protected assets?: WheelAssets, wheel?: Wheel, paints?: PaintConfig, protected keepContextAlive = false) {
    super(assets);
    if (assets != undefined) {
      this.rimMaterial = getRimMaterial(wheel, assets, paints);
      this.rimMesh.material = this.rimMaterial;
      if (this.tireMesh != undefined) {
        this.tireMaterial = getTireMaterial(wheel, assets, paints);
        this.tireMesh.material = this.tireMaterial;
      }
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
          this.tireMesh = object as Mesh;
        }
      }
    });
  }

  setPaintColor(paint: Color) {
    this.rimMaterial.paintColor = paint;
    if (this.tireMaterial != undefined) {
      this.tireMaterial.paintColor = paint;
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
