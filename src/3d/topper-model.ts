import { AbstractObject } from './object';
import { Color, Mesh, MeshStandardMaterial, Scene } from 'three';
import { Topper } from '../model/topper';
import { getAssetUrl } from '../utils/network';
import { disposeIfExists } from '../utils/util';
import { Paintable } from './paintable';
import { PaintConfig } from '../model/paint-config';
import { ImageDataLoader, ImageTextureLoader, PromiseLoader } from '../utils/loader';
import { Layer, LayeredTexture } from './layered-texture';
import { getChannel, getMaskPixels, ImageChannel } from '../utils/image';
import { RocketConfig } from '../model/rocket-config';

class TopperSkin {

  private readonly loader: PromiseLoader;

  texture: LayeredTexture;
  private paintLayer: Layer;
  private paintPixels: Set<number>;

  constructor(private readonly baseUrl, private readonly rgbaMapUrl, private paint: Color, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new ImageDataLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
  }

  async load() {
    const baseTask = this.loader.load(this.baseUrl);
    const rgbaMapTask = this.loader.load(this.rgbaMapUrl);

    const baseResult = await baseTask;

    if (baseResult != undefined) {
      const rgbaMap = (await rgbaMapTask).data;
      this.texture = new LayeredTexture(baseResult.data, baseResult.width, baseResult.height);

      const paintMask = getChannel(rgbaMap, ImageChannel.A);

      this.paintLayer = new Layer(paintMask, this.paint);
      this.paintPixels = getMaskPixels(paintMask);

      this.texture.addLayer(this.paintLayer);
      this.texture.update();
    }
  }

  dispose() {
    disposeIfExists(this.texture);
  }

  setPaint(color: Color) {
    this.paint = color;
    this.paintLayer.data = color;
    this.texture.update(this.paintPixels);
  }
}

export class TopperModel extends AbstractObject implements Paintable {

  private textureLoader: PromiseLoader;

  material: MeshStandardMaterial;
  skin: TopperSkin;

  normalMapUrl: string;
  baseTextureUrl: string;

  constructor(topper: Topper, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(topper.model, rocketConfig), rocketConfig.gltfLoader);
    this.textureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.normalMapUrl = getAssetUrl(topper.normal_map, rocketConfig);

    if (topper.rgba_map) {
      this.skin = new TopperSkin(
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
      this.material.map = this.skin.texture.texture;
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
