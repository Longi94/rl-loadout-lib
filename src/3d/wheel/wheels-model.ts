import { AbstractObject } from '../object';
import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene } from 'three';
import { Wheel, WheelConfig } from '../../model/wheel';
import { disposeIfExists, htmlImageToTexture } from '../../utils/util';
import { Paintable } from '../paintable';
import { PaintConfig } from '../../model/paint-config';
import { RimTexture } from '../../webgl/rim-texture';
import { TireTexture } from '../../webgl/tire-texture';
import { getRimTexture, getTireTexture } from './texture-factory';
import { WheelAssets } from '../../loader/wheel/wheel-assets';

export class WheelModelInternal {
  model: Object3D;
  config: WheelConfig;
  spinnerJoint: Bone;
}

/**
 * Class that handles loading the 3D model of the car wheels.
 */
export class WheelsModel extends AbstractObject implements Paintable {

  rimMaterial: MeshStandardMaterial;
  tireMaterial: MeshStandardMaterial;

  rimSkin: RimTexture;
  tireTexture: TireTexture | Color;

  constructor(protected assets?: WheelAssets, wheel?: Wheel, paints?: PaintConfig, protected keepContextAlive = false) {
    super(assets);
    if (assets != undefined) {
      this.rimSkin = getRimTexture(wheel, assets, paints, keepContextAlive);
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
        if (this.rimSkin) {
          this.rimMaterial.map = this.rimSkin.getTexture();
          this.rimMaterial.needsUpdate = true;
        } else {
          this.rimMaterial.map = htmlImageToTexture(this.assets.rimD);
        }
        this.rimMaterial.needsUpdate = true;
      }
    }

    if (!this.keepContextAlive) {
      this.tireTexture = undefined;
      this.rimSkin = undefined;
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.rimMaterial);
    disposeIfExists(this.rimSkin);
  }

  handleModel(scene: Scene) {
    scene.traverse(object => {
      if (object['isMesh']) {
        const mat = (object as Mesh).material as MeshStandardMaterial;
        if (mat.name.includes('rim')) {
          this.rimMaterial = mat;
        } else if (mat.name.includes('tire')) {
          this.tireMaterial = mat;
        }
      }
    });
  }

  setPaintColor(paint: Color) {
    if (!this.keepContextAlive) {
      throw new Error('Wheel color not updatable');
    }
    if (this.rimSkin != undefined) {
      this.rimSkin.setPaint(paint);
    }
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
    if (this.rimSkin != undefined) {
      this.rimSkin.animate(t);
    }
  }

  clone(): WheelsModel {
    const m = new WheelsModel();
    m.copy(this);
    return m;
  }
}
