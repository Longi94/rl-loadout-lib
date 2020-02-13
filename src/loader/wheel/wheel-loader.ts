import { getAssetUrl, PromiseLoader, RocketConfig, Wheel } from '../..';
import { WheelAssets } from './wheel-assets';

export interface WheelLoader {
  load: (wheel: Wheel, gltfLoader: PromiseLoader, textureLoader: PromiseLoader, rocketConfig: RocketConfig) => Promise<WheelAssets>;
}

export const DefaultWheelLoader: WheelLoader = {
  load: async (wheel: Wheel, gltfLoader: PromiseLoader, textureLoader: PromiseLoader, rocketConfig: RocketConfig): Promise<WheelAssets> => {

    const gltf = gltfLoader.load(getAssetUrl(wheel.model, rocketConfig));
    const rimD = textureLoader.load(getAssetUrl(wheel.rim_base, rocketConfig));
    const rimN = textureLoader.load(getAssetUrl(wheel.rim_n, rocketConfig));
    const rimRgba = textureLoader.load(getAssetUrl(wheel.rim_rgb_map, rocketConfig));
    const tireD = textureLoader.load(getAssetUrl(wheel.tire_base, rocketConfig));
    const tireN = textureLoader.load(getAssetUrl(wheel.tire_n, rocketConfig));

    return {
      gltf: await gltf,
      rimD: await rimD,
      rimN: await rimN,
      rimRgba: await rimRgba,
      tireN: await tireD,
      tireD: await tireN
    };
  }
};
