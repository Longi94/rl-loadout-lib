import { AbstractObject } from '../object';
import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene, Texture, Vector3 } from 'three';
import { Wheel, WheelConfig } from '../../model/wheel';
import { SkeletonUtils } from '../../utils/three/skeleton';
import { disposeIfExists } from '../../utils/util';
import { Paintable } from '../paintable';
import { PaintConfig } from '../../model/paint-config';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from '../constants';
import { RimTexture } from '../../webgl/rim-texture';
import { TireTexture } from '../../webgl/tire-texture';
import { getRimTexture, getTireTexture } from './texture-factory';
import { WheelAssets } from '../../loader/wheel/wheel-assets';

class WheelModel {
  model: Object3D;
  config: WheelConfig;
  spinnerJoint: Bone;
}

/**
 * Class that handles loading the 3D model of the car wheels.
 */
export class WheelsModel extends AbstractObject implements Paintable {

  config: WheelConfig[];
  wheels: WheelModel[] = [];

  rimMaterial: MeshStandardMaterial;
  tireMaterial: MeshStandardMaterial;

  rimSkin: RimTexture;
  tireTexture: TireTexture | Color;

  protected roll = 0;

  constructor(assets?: WheelAssets, wheel?: Wheel, paints?: PaintConfig) {
    super(assets);
    if (assets != undefined) {
      this.rimSkin = getRimTexture(wheel, assets, paints);
      this.tireTexture = getTireTexture(wheel, assets, paints);

      if (this.tireTexture != undefined) {
        if (!(this.tireTexture instanceof Color)) {
          this.tireMaterial.map = this.tireTexture.getTexture();
        } else if (this.tireTexture instanceof Color) {
          this.tireMaterial.color = this.tireTexture;
        }
      }
      if (this.tireMaterial != undefined) {
        this.tireMaterial.normalMap = new Texture(assets.tireN);
      }

      if (this.rimMaterial != undefined) {
        this.rimMaterial.normalMap = new Texture(assets.rimN);
        if (this.rimSkin) {
          this.rimMaterial.map = this.rimSkin.getTexture();
          this.rimMaterial.needsUpdate = true;
        } else {
          this.rimMaterial.map = new Texture(assets.rimD);
        }
      }
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.rimMaterial);
    disposeIfExists(this.rimSkin);
    this.wheels = [];
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

  /**
   * This is used internally by {@link BodyModel} to apply the wheel positions and scale based on the car body.
   * @param config wheel configuration of the car body
   */
  applyWheelConfig(config: WheelConfig[]) {
    this.config = config;
    this.wheels = [];
    for (const conf of config) {
      const widthScale = conf.width / BASE_WHEEL_MESH_WIDTH;
      const radiusScale = conf.radius / BASE_WHEEL_MESH_RADIUS;
      const offset = conf.offset;

      const wheel = SkeletonUtils.clone(this.scene) as Object3D;
      const position = new Vector3();
      position.copy(conf.position);

      if (!conf.right) {
        wheel.rotation.set(-Math.PI / 2, 0, Math.PI);
        position.add(new Vector3(0, offset, 0));
      } else {
        wheel.rotation.set(Math.PI / 2, 0, 0);
        position.add(new Vector3(0, -offset, 0));
      }

      wheel.scale.set(radiusScale, radiusScale, widthScale);
      wheel.position.copy(position);

      let spinnerJoint: Bone;
      wheel.traverse(object => {
        if (object['isBone']) {
          if (object.name === 'spinner_jnt') {
            spinnerJoint = object as Bone;
          }
        }
      });

      this.wheels.push({
        model: wheel,
        config: conf,
        spinnerJoint
      });
    }
  }

  /**
   * This is used internally by {@link BodyModel} to attach the wheels to the joints of the car body skeleton.
   */
  addToJoints() {
    for (const wheel of this.wheels) {
      wheel.config.joint.add(wheel.model);
    }
  }

  /**
   * This is used internally by {@link BodyModel} to detach the wheels from the joints of the car body skeleton.
   */
  removeFromJoints() {
    for (const wheel of this.wheels) {
      wheel.config.joint.remove(wheel.model);
    }
  }

  setPaintColor(paint: Color) {
    if (this.rimSkin != undefined) {
      this.rimSkin.setPaint(paint);
    }
    if (this.tireTexture != undefined && !(this.tireTexture instanceof Color)) {
      this.tireTexture.setPaint(paint);
    }
  }

  visible(visible: boolean) {
    super.visible(visible);
    for (const wheel of this.wheels) {
      wheel.model.visible = visible;
    }
  }

  /**
   * Set roll rotation of the wheels.
   * @param angle roll angle in radians
   */
  setRoll(angle: number) {
    this.roll = angle;
    for (const wheel of this.wheels) {
      if (wheel.config.right) {
        wheel.model.rotation.z = -angle;
      } else {
        wheel.model.rotation.z = Math.PI + angle;
      }

      if (wheel.spinnerJoint != undefined) {
        if (wheel.config.right) {
          wheel.spinnerJoint.rotation.y = angle;
        } else {
          wheel.spinnerJoint.rotation.y = -angle;
        }
      }
    }
  }

  /**
   * Animate the wheels. This is a safe no-op if the wheels are not animated.
   * @param t time in milliseconds
   */
  animate(t: number) {
    if (this.rimSkin != undefined) {
      this.rimSkin.animate(t);
    }
  }

  protected copy(other: WheelsModel) {
    super.copy(other);
    if (other.tireTexture != undefined) {
      this.tireTexture = other.tireTexture.clone();
    }
    if (other.rimSkin != undefined) {
      this.rimSkin = other.rimSkin.clone();
    }
    this.applyWheelConfig(other.config);
    this.roll = other.roll;
  }

  clone(): WheelsModel {
    const m = new WheelsModel();
    m.copy(this);
    return m;
  }
}
