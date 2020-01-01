import { AbstractObject } from './object';
import { Color, Mesh, MeshStandardMaterial, Scene } from 'three';
import { Topper } from '../model/topper';
import { getAssetUrl } from '../utils/network';
import { disposeIfExists } from '../utils/util';
import { Paintable } from './paintable';
import { PaintConfig } from '../model/paint-config';
import { ImageTextureLoader, PromiseLoader } from '../utils/loader';
import { RocketConfig } from '../model/rocket-config';
import { TopperTexture } from '../webgl/topper-texture';

/**
 * Class that handles loading the 3D model of the car topper.
 */
export class TopperModel extends AbstractObject implements Paintable {

  private readonly textureLoader: PromiseLoader;

  material: MeshStandardMaterial;
  skin: TopperTexture;

  private readonly normalMapUrl: string;
  private readonly baseTextureUrl: string;

  /**
   * Create an topper object.
   * @param topper the topper
   * @param paints the paint config to apply the topper paint
   * @param rocketConfig configuration used for loading assets
   */
  constructor(topper: Topper, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(topper.model, rocketConfig), rocketConfig.gltfLoader);
    this.textureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.normalMapUrl = getAssetUrl(topper.normal_map, rocketConfig);

    if (topper.rgba_map) {
      this.skin = new TopperTexture(
        getAssetUrl(topper.base_texture, rocketConfig),
        getAssetUrl(topper.rgba_map, rocketConfig),
        paints.topper,
        rocketConfig
      );
    } else {
      this.baseTextureUrl = getAssetUrl(topper.base_texture, rocketConfig);
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.material);
    disposeIfExists(this.skin);
  }

  handleModel(scene: Scene) {
    scene.traverse(object => {
      if (object['isMesh']) {
        this.material = (object as Mesh).material as MeshStandardMaterial;
      }
    });
  }

  async load() {
    const superTask = super.load();
    const normalMapTask = this.textureLoader.load(this.normalMapUrl);
    const skinTask = this.skin ? this.skin.load() : this.textureLoader.load(this.baseTextureUrl);

    await superTask;
    const skin = await skinTask;
    this.material.normalMap = await normalMapTask;

    if (this.skin) {
      this.material.map = this.skin.getTexture();
      this.material.needsUpdate = true;
    } else {
      this.material.map = skin;
    }
  }

  setPaintColor(color: Color) {
    if (this.skin) {
      this.skin.setPaint(color);
    }
  }
}
