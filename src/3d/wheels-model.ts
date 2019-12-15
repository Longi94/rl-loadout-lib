import { AbstractObject } from './object';
import { Color, Mesh, MeshStandardMaterial, Object3D, Scene, Texture, Vector3 } from 'three';
import { Wheel, WheelConfig } from '../model/wheel';
import { getAssetUrl } from '../utils/network';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';
import { disposeIfExists } from '../utils/util';
import { Paintable } from './paintable';
import { PaintConfig } from '../model/paint-config';
import { ImageTextureLoader, PromiseLoader } from '../utils/loader';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from './constants';
import { RocketConfig } from '../model/rocket-config';
import { RimTexture } from '../webgl/rim-texture';

class WheelModel {
  model: Object3D;
  config: WheelConfig;
}

export class WheelsModel extends AbstractObject implements Paintable {

  private textureLoader: PromiseLoader;

  wheels: WheelModel[] = [];
  rimMaterial: MeshStandardMaterial;
  rimSkin: RimTexture;

  tireMaterial: MeshStandardMaterial;

  rimBaseUrl: string;
  rimNUrl: string;
  tireBaseUrl: string;
  tireNUrl: string;

  constructor(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(wheel.model, rocketConfig), rocketConfig.gltfLoader);
    this.textureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    if (wheel.rim_rgb_map != undefined) {
      this.rimSkin = new RimTexture(
        getAssetUrl(wheel.rim_base, rocketConfig),
        getAssetUrl(wheel.rim_rgb_map, rocketConfig),
        paints.wheel,
        rocketConfig
      );
    } else {
      this.rimBaseUrl = getAssetUrl(wheel.rim_base, rocketConfig);
    }

    this.rimNUrl = getAssetUrl(wheel.rim_n, rocketConfig);
    this.tireBaseUrl = getAssetUrl(wheel.tire_base, rocketConfig);
    this.tireNUrl = getAssetUrl(wheel.tire_n, rocketConfig);
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
    const tireBaseTask = this.textureLoader.load(this.tireBaseUrl);
    const tireNTask = this.textureLoader.load(this.tireNUrl);
    let rimBaseTask: Promise<Texture>;

    if (this.rimSkin) {
      await this.rimSkin.load();
    } else {
      rimBaseTask = this.textureLoader.load(this.rimBaseUrl);
    }

    await superTask;

    this.rimMaterial.normalMap = await rimNTask;
    this.tireMaterial.map = await tireBaseTask;
    this.tireMaterial.normalMap = await tireNTask;

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

      this.wheels.push({
        model: wheel,
        config: conf
      });
    }
  }

  addToJoints() {
    for (const wheel of this.wheels) {
      wheel.config.joint.add(wheel.model);
    }
  }

  removeFromJoints() {
    for (const wheel of this.wheels) {
      wheel.config.joint.remove(wheel.model);
    }
  }

  setPaintColor(paint: Color) {
    if (this.rimSkin != undefined) {
      this.rimSkin.setPaint(paint);
    }
  }

  visible(visible: boolean) {
    super.visible(visible);
    for (const wheel of this.wheels) {
      wheel.model.visible = visible;
    }
  }

  setRoll(angle: number) {
    for (const wheel of this.wheels) {
      if (wheel.config.right) {
        wheel.model.rotation.z = -angle;
      } else {
        wheel.model.rotation.z = Math.PI + angle;
      }
    }
  }
}
