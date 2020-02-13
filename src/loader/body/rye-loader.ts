import { BodyLoader } from './body-loader';
import { getAssetUrl } from '../../utils/network';
import { BodyAssets } from './body-assets';

const LIGHTS_DIFFUSE = 'body/Body_Rye_Tier1/Chassis_Rye_Lights_D.tga';
const LIGHTS_NORMAL = 'body/Body_Rye_Tier1/Chassis_Rye_Lights_N.tga';
const GRILL_NORMAL = 'body/Body_Rye_Tier1/Car_Grille_Hexy_N.tga';

const KIT_DIFFUSE = 'body/Body_Rye_Tier2/Body_Rye_BodyKit_D.tga';
const KIT_NORMAL = 'body/Body_Rye_Tier2/Body_Rye_BodyKit_N.tga';

export const RyeTier1Loader: BodyLoader = {
  load: async (body, gltfLoader, textureLoader, rocketConfig): Promise<RyeTier1Assets> => {

    const gltf = gltfLoader.load(getAssetUrl(body.model, rocketConfig));
    const baseSkin = textureLoader.load(getAssetUrl(body.base_skin, rocketConfig));
    const blankSkin = textureLoader.load(getAssetUrl(body.blank_skin, rocketConfig));
    const chassisD = textureLoader.load(getAssetUrl(body.chassis_base, rocketConfig));
    const chassisN = textureLoader.load(getAssetUrl(body.chassis_n, rocketConfig));
    const lightsD = textureLoader.load(getAssetUrl(LIGHTS_DIFFUSE, rocketConfig));
    const lightsN = textureLoader.load(getAssetUrl(LIGHTS_NORMAL, rocketConfig));
    const grillN = textureLoader.load(getAssetUrl(GRILL_NORMAL, rocketConfig));

    return {
      gltf: await gltf,
      blankSkin: await blankSkin,
      baseSkin: await baseSkin,
      chassisD: await chassisD,
      chassisN: await chassisN,
      lightsD: await lightsD,
      lightsN: await lightsN,
      grillN: await grillN
    };
  }
};

export class RyeTier1Assets extends BodyAssets {
  lightsD: HTMLImageElement;
  lightsN: HTMLImageElement;
  grillN: HTMLImageElement;
}


export const RyeTier2Loader: BodyLoader = {
  load: async (body, gltfLoader, textureLoader, rocketConfig): Promise<RyeTier2Assets> => {

    const gltf = gltfLoader.load(getAssetUrl(body.model, rocketConfig));
    const baseSkin = textureLoader.load(getAssetUrl(body.base_skin, rocketConfig));
    const blankSkin = textureLoader.load(getAssetUrl(body.blank_skin, rocketConfig));
    const chassisD = textureLoader.load(getAssetUrl(body.chassis_base, rocketConfig));
    const chassisN = textureLoader.load(getAssetUrl(body.chassis_n, rocketConfig));
    const lightsD = textureLoader.load(getAssetUrl(LIGHTS_DIFFUSE, rocketConfig));
    const lightsN = textureLoader.load(getAssetUrl(LIGHTS_NORMAL, rocketConfig));
    const grillN = textureLoader.load(getAssetUrl(GRILL_NORMAL, rocketConfig));
    const kitD = textureLoader.load(getAssetUrl(KIT_DIFFUSE, rocketConfig));
    const kitN = textureLoader.load(getAssetUrl(KIT_NORMAL, rocketConfig));

    return {
      gltf: await gltf,
      blankSkin: await blankSkin,
      baseSkin: await baseSkin,
      chassisD: await chassisD,
      chassisN: await chassisN,
      lightsD: await lightsD,
      lightsN: await lightsN,
      grillN: await grillN,
      kitD: await kitD,
      kitN: await kitN
    };
  }
};

export class RyeTier2Assets extends RyeTier1Assets {
  kitD: HTMLImageElement;
  kitN: HTMLImageElement;
}
