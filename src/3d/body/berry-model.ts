import { BodyModel } from './body-model';
import { Color, Texture } from 'three';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { Body } from '../../model/body';
import { PaintConfig } from '../../model/paint-config';
import { ImageTextureLoader, PromiseLoader } from '../../utils/loader';
import { Layer, LayeredTexture } from '../layered-texture';
import { getAssetUrl } from '../../utils/network';
import { getChannel, getMaskPixels, ImageChannel, invertChannel } from '../../utils/image';
import { WheelConfig } from '../../model/wheel';
import { RocketConfig } from '../../model/rocket-config';

class BerryBodySkin implements BodyTexture {

  private readonly loader: PromiseLoader;

  private readonly baseUrl: string;
  private readonly blankSkinUrl: string;

  private primary: Color;

  private texture: LayeredTexture;

  private primaryLayer: Layer;
  private primaryPixels: Set<number>;

  constructor(body: Body, paints: PaintConfig, rocketConfig: RocketConfig) {
    this.loader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.baseUrl = getAssetUrl(body.base_skin, rocketConfig);
    this.blankSkinUrl = getAssetUrl(body.blank_skin, rocketConfig);
    this.primary = paints.primary;
  }

  async load() {
    const baseTask = this.loader.load(this.baseUrl);
    const rgbaMapTask = this.loader.load(this.blankSkinUrl);

    const baseResult = await baseTask;

    const baseSkinMap = baseResult.data;
    const blankSkinMap = (await rgbaMapTask).data;

    this.texture = new LayeredTexture(baseSkinMap, baseResult.width, baseResult.height);

    const primaryMask = getChannel(blankSkinMap, ImageChannel.A);
    invertChannel(primaryMask);
    this.primaryLayer = new Layer(primaryMask, this.primary);
    this.primaryPixels = getMaskPixels(primaryMask);

    this.texture.addLayer(new Layer(true, new Color(0.25, 0.25, 0.25)));
    this.texture.addLayer(this.primaryLayer);
    this.texture.update();
  }

  dispose() {
    this.texture.dispose();
  }

  setAccent(color: Color) {
  }

  setBodyPaint(color: Color) {
  }

  setPaint(color: Color) {
  }

  setPrimary(color: Color) {
    this.primary = color;
    this.primaryLayer.data = color;
    this.texture.update(this.primaryPixels);
  }

  getTexture(): Texture {
    return this.texture.texture;
  }
}

export class BerryModel extends BodyModel {

  initBodySkin(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig): BodyTexture {
    return new BerryBodySkin(body, paints, rocketConfig);
  }

  setPaintColor(color: Color) {
  }

  async changeDecal(decal: Decal, paints: PaintConfig) {
  }

  setPrimaryColor(color: Color) {
    this.bodySkin.setPrimary(color);
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }

  protected getWheelPositions() {
    super.getWheelPositions();

    const confToAdd: WheelConfig[] = [];

    for (const config of this.wheelConfig) {
      if (!config.front) {
        const newConfig = config.clone();

        if (newConfig.right) {
          newConfig.position.setZ(newConfig.position.z + newConfig.width);
        } else {
          newConfig.position.setZ(newConfig.position.z - newConfig.width);
        }

        confToAdd.push(newConfig);
      }
    }

    this.wheelConfig = this.wheelConfig.concat(confToAdd);
  }
}
