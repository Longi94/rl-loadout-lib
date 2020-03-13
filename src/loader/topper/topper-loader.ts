import { Topper } from '../../model/topper';
import { RocketConfig } from '../../model/rocket-config';
import { getAssetUrl } from '../../utils/network';
import { PromiseLoader } from '../../utils/loader';
import { TopperAssets } from './topper-assets';

export interface TopperLoader {
  load: (topper: Topper, gltfLoader: PromiseLoader, textureLoader: PromiseLoader, rocketConfig: RocketConfig) => Promise<TopperAssets>;
}

export const DefaultTopperLoader: TopperLoader = {
  load: async (topper: Topper, gltfLoader: PromiseLoader, textureLoader: PromiseLoader, rocketConfig: RocketConfig):
    Promise<TopperAssets> => {

    const gltf = gltfLoader.load(getAssetUrl(topper.model, rocketConfig));
    const baseTexture = textureLoader.load(getAssetUrl(topper.base_texture, rocketConfig));
    const normalMap = textureLoader.load(getAssetUrl(topper.normal_map, rocketConfig));
    const rgbaMap = textureLoader.load(getAssetUrl(topper.rgba_map, rocketConfig));

    return {
      gltf: await gltf,
      diffuse: await baseTexture,
      normalMap: await normalMap,
      rgbaMap: await rgbaMap
    };
  }
};
