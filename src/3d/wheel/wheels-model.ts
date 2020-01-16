import { AbstractObject } from '../object';
import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene, Texture, Vector3 } from 'three';
import { Wheel, WheelConfig } from '../../model/wheel';
import { getAssetUrl } from '../../utils/network';
import { SkeletonUtils } from '../../utils/three/skeleton';
import { disposeIfExists } from '../../utils/util';
import { Paintable } from '../paintable';
import { PaintConfig } from '../../model/paint-config';
import { ImageTextureLoader, PromiseLoader } from '../../utils/loader';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from '../constants';
import { RocketConfig } from '../../model/rocket-config';
import { RimTexture } from '../../webgl/rim-texture';
import { TireTexture } from '../../webgl/tire-texture';

class WheelModel {
  model: Object3D;
  config: WheelConfig;
  spinnerJoint: Bone;
}

/**
 * Class that handles loading the 3D model of the car wheels.
 */
export class WheelsModel extends AbstractObject implements Paintable {

  private readonly textureLoader: PromiseLoader;

  wheels: WheelModel[] = [];
  rimMaterial: MeshStandardMaterial;
  rimSkin: RimTexture;
  tireTexture: TireTexture;

  tireMaterial: MeshStandardMaterial;

  private readonly rimBaseUrl: string;
  private readonly rimNUrl: string;
  private readonly tireNUrl: string;

  protected roll = 0;

  /**
   * Create a wheels model object. You should **not** use this unless you know what you are doing. Use {@link createWheelsModel} instead.
   * @param wheel the wheel
   * @param paints the paint config to apply the wheel paint
   * @param rocketConfig configuration used for loading assets
   */
  constructor(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(wheel.model, rocketConfig), rocketConfig.gltfLoader);
    this.textureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    if (wheel.rim_rgb_map != undefined) {
      this.initRimSkin(wheel, paints, rocketConfig);
    } else {
      this.rimBaseUrl = getAssetUrl(wheel.rim_base, rocketConfig);
    }

    if (wheel.tire_base != undefined) {
      this.tireTexture = new TireTexture(getAssetUrl(wheel.tire_base, rocketConfig), paints.wheel, rocketConfig);
    }

    this.rimNUrl = getAssetUrl(wheel.rim_n, rocketConfig);
    this.tireNUrl = getAssetUrl(wheel.tire_n, rocketConfig);
  }

  protected initRimSkin(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig) {
    this.rimSkin = new RimTexture(
      getAssetUrl(wheel.rim_base, rocketConfig),
      getAssetUrl(wheel.rim_rgb_map, rocketConfig),
      paints.wheel,
      rocketConfig
    );
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.rimMaterial);
    disposeIfExists(this.rimSkin);
    this.wheels = [];
  }

  async load() {
    const superTask = super.load();
    const rimNTask = this.textureLoader.load(this.rimNUrl);
    const tireNTask = this.textureLoader.load(this.tireNUrl);

    let tireBaseTask: Promise<void>;
    let rimBaseTask: Promise<Texture>;

    if (this.tireTexture != undefined) {
      tireBaseTask = this.tireTexture.load();
    }

    if (this.rimSkin != undefined) {
      await this.rimSkin.load();
    } else {
      rimBaseTask = this.textureLoader.load(this.rimBaseUrl);
    }

    await superTask;
    if (tireBaseTask != undefined) {
      await tireBaseTask;
    }

    if (this.tireTexture != undefined) {
      this.tireMaterial.map = this.tireTexture.getTexture();
      this.tireMaterial.normalMap = await tireNTask;
    }

    this.rimMaterial.normalMap = await rimNTask;
    if (this.rimSkin) {
      this.rimMaterial.map = this.rimSkin.getTexture();
      this.rimMaterial.needsUpdate = true;
    } else {
      this.rimMaterial.map = await rimBaseTask;
    }
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
    if (this.tireTexture != undefined) {
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
  }
}
