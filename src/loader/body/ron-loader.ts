import { BodyLoader } from './body-loader';
import { getAssetUrl } from '../../utils/network';
import { BodyAssets } from './body-assets';

const CARBON_FIBRE = 'body/body_ron/CarbonFiber_Flipped_N.tga';
const DECALS_DIFFUSE = 'body/body_ron/Body_Ron_Decals_D.tga';
const DECALS_NORMAL = 'body/body_ron/Body_Ron_Decals_N.tga';
const HEX_DIFFUSE = 'body/body_ron/hex.tga';
const HEX_NORMAL = 'body/body_ron/Detail_HexPattern9000_N.tga';

export const RonLoader: BodyLoader = {
  load: async (body, gltfLoader, textureLoader, rocketConfig): Promise<RonAssets> => {

    const gltf = gltfLoader.load(getAssetUrl(body.model, rocketConfig));
    const baseSkin = textureLoader.load(getAssetUrl(body.base_skin, rocketConfig));
    const blankSkin = textureLoader.load(getAssetUrl(body.blank_skin, rocketConfig));
    const chassisD = textureLoader.load(getAssetUrl(body.chassis_base, rocketConfig));
    const chassisN = textureLoader.load(getAssetUrl(body.chassis_n, rocketConfig));
    const carbonFibre = textureLoader.load(getAssetUrl(CARBON_FIBRE, rocketConfig));
    const decalsD = textureLoader.load(getAssetUrl(DECALS_DIFFUSE, rocketConfig));
    const decalsN = textureLoader.load(getAssetUrl(DECALS_NORMAL, rocketConfig));
    const hexD = textureLoader.load(getAssetUrl(HEX_DIFFUSE, rocketConfig));
    const hexN = textureLoader.load(getAssetUrl(HEX_NORMAL, rocketConfig));

    return {
      gltf: await gltf,
      blankSkin: await blankSkin,
      baseSkin: await baseSkin,
      chassisD: await chassisD,
      chassisN: await chassisN,
      carbonFibre: await carbonFibre,
      decalsD: await decalsD,
      decalsN: await decalsN,
      hexD: await hexD,
      hexN: await hexN
    };
  }
};

export class RonAssets extends BodyAssets {
  carbonFibre: HTMLImageElement;
  decalsD: HTMLImageElement;
  decalsN: HTMLImageElement;
  hexD: HTMLImageElement;
  hexN: HTMLImageElement;
}
