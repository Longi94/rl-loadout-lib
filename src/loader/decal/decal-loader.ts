import { Body, Decal, fixTierUrl, getAssetUrl, PromiseLoader, RocketConfig } from '../..';
import { DecalAssets } from './decal-assets';

export interface DecalLoader {
  load: (body: Body, decal: Decal, textureLoader: PromiseLoader, rocketConfig: RocketConfig) => Promise<DecalAssets>;
}

export const StaticDecalLoader: DecalLoader = {
  load: async (body, decal, textureLoader, rocketConfig) => {

    const baseTexture = textureLoader.load(getAssetUrl(body.chassis_base, rocketConfig));
    const rgbaMap = textureLoader.load(fixTierUrl(body.id, getAssetUrl(body.chassis_n, rocketConfig)));

    return {
      baseTexture: await baseTexture,
      rgbaMap: await rgbaMap
    };
  }
};
