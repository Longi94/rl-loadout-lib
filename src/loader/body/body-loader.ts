import { Body } from '../../model/body';
import { RocketConfig } from '../../model/rocket-config';
import { PromiseLoader } from '../../utils/loader';
import { BodyAssets } from './body-assets';
import { getAssetUrl } from '../../utils/network';

export interface BodyLoader {
  load: (body: Body, gltfLoader: PromiseLoader, textureLoader: PromiseLoader, rocketConfig: RocketConfig) => Promise<BodyAssets>;
}

export const DefaultBodyLoader: BodyLoader = {
  load: async (body: Body, gltfLoader: PromiseLoader, textureLoader: PromiseLoader, rocketConfig: RocketConfig): Promise<BodyAssets> => {

    const gltf = gltfLoader.load(getAssetUrl(body.model, rocketConfig));
    const baseSkin = textureLoader.load(getAssetUrl(body.base_skin, rocketConfig));
    const blankSkin = textureLoader.load(getAssetUrl(body.blank_skin, rocketConfig));
    const chassisD = textureLoader.load(getAssetUrl(body.chassis_base, rocketConfig));
    const chassisN = textureLoader.load(getAssetUrl(body.chassis_n, rocketConfig));

    return {
      gltf: await gltf,
      blankSkin: await blankSkin,
      baseSkin: await baseSkin,
      chassisD: await chassisD,
      chassisN: await chassisN
    };
  }
};
