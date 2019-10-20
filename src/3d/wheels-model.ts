import { AbstractObject } from './object';
import { Color, Mesh, MeshStandardMaterial, Object3D, Scene, Vector3 } from 'three';
import { Wheel, WheelConfig } from '../model/wheel';
import { getAssetUrl } from '../utils/network';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';
import { disposeIfExists } from '../utils/util';
import { Paintable } from './paintable';
import { PaintConfig } from '../model/paint-config';
import { Layer, LayeredTexture } from './layered-texture';
import { ImageTextureLoader, PromiseLoader } from '../utils/loader';
import { getChannel, getMaskPixels, ImageChannel, invertChannel } from '../utils/image';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from './constants';
import { RocketConfig } from '../model/rocket-config';

class RimSkin {

  private readonly loader: PromiseLoader;

  texture: LayeredTexture;
  private paintLayer: Layer;
  private paintPixels: Set<number>;

  constructor(private readonly baseUrl, private readonly rgbaMapUrl, private paint: Color, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
  }

  async load() {
    const baseTask = this.loader.load(this.baseUrl);
    const rgbaMapTask = this.loader.load(this.rgbaMapUrl);

    const baseResult = await baseTask;

    if (baseResult != undefined) {
      const rgbaMap = (await rgbaMapTask).data;
      this.texture = new LayeredTexture(baseResult.data, baseResult.width, baseResult.height);

      const paintMask = getChannel(rgbaMap, ImageChannel.R);
      invertChannel(paintMask);

      this.paintLayer = new Layer(paintMask, this.paint);
      this.paintPixels = getMaskPixels(paintMask);

      this.texture.addLayer(this.paintLayer);
      this.texture.update();
    }
  }

  setPaint(color: Color) {
    this.paint = color;
    this.paintLayer.data = color;
    this.texture.update(this.paintPixels);
  }

  dispose() {
    disposeIfExists(this.texture);
  }
}

class WheelModel {
  model: Object3D;
  config: WheelConfig;
}

export class WheelsModel extends AbstractObject implements Paintable {

  wheels: WheelModel[] = [];
  rimMaterial: MeshStandardMaterial;
  rimSkin: RimSkin;

  constructor(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(wheel.model, rocketConfig), rocketConfig.gltfLoader);
    if (wheel.rim_base && wheel.rim_rgb_map) {
      this.rimSkin = new RimSkin(
        getAssetUrl(wheel.rim_base, rocketConfig),
        getAssetUrl(wheel.rim_rgb_map, rocketConfig),
        paints.wheel,
        rocketConfig
      );
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.rimMaterial);
    disposeIfExists(this.rimSkin);
    this.wheels = [];
  }

  async load() {
    const superTask = super.load();

    if (this.rimSkin) {
      await this.rimSkin.load();
    }

    await superTask;

    if (this.rimSkin) {
      this.rimMaterial.map = this.rimSkin.texture.texture;
      this.rimMaterial.needsUpdate = true;
    }
  }

  handleModel(scene: Scene) {
    scene.traverse(object => {
      if (object['isMesh']) {
        const mat = (object as Mesh).material as MeshStandardMaterial;
        if (mat.name.includes('rim')) {
          this.rimMaterial = mat;
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
        wheel.rotation.set(-Math.PI / 2, 0, 0);
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
        wheel.model.rotation.z = angle;
      }
    }
  }
}
