import { BodyLoader } from './body-loader';
import { getAssetUrl } from '../../utils/network';
import { BodyAssets } from './body-assets';

const BODY_ORANGE = 'body/body_maple/Body_Maple1_D.tga';
const BODY_BLUE = 'body/body_maple/Body_Maple2_D.tga';
const CHASSIS_ORANGE = 'body/body_maple/Chassis_Maple1_D.tga';
const CHASSIS_BLUE = 'body/body_maple/Chassis_Maple2_D.tga';

export const MapleLoader: BodyLoader = {
  load: async (body, gltfLoader, textureLoader, rocketConfig): Promise<MapleAssets> => {

    const modelTask = gltfLoader.load(getAssetUrl(body.model, rocketConfig));
    const bodyOrangeTask = textureLoader.load(getAssetUrl(BODY_ORANGE, rocketConfig));
    const bodyBlueTask = textureLoader.load(getAssetUrl(BODY_BLUE, rocketConfig));
    const chassisOrangeTask = textureLoader.load(getAssetUrl(CHASSIS_ORANGE, rocketConfig));
    const chassisBlueTask = textureLoader.load(getAssetUrl(CHASSIS_BLUE, rocketConfig));
    const baseSkin = textureLoader.load(getAssetUrl(body.base_skin, rocketConfig));
    const blankSkin = textureLoader.load(getAssetUrl(body.blank_skin, rocketConfig));
    const chassisD = textureLoader.load(getAssetUrl(body.chassis_base, rocketConfig));
    const chassisN = textureLoader.load(getAssetUrl(body.chassis_n, rocketConfig));

    const a = new MapleAssets();
    a.gltf = await modelTask;
    a.bodyOrange = await bodyOrangeTask;
    a.bodyBlue = await bodyBlueTask;
    a.chassisOrange = await chassisOrangeTask;
    a.chassisBlue = await chassisBlueTask;
    a.baseSkin = await baseSkin;
    a.blankSkin = await blankSkin;
    a.chassisD = await chassisD;
    a.chassisN = await chassisN;
    return a;
  }
};

export class MapleAssets extends BodyAssets {
  bodyOrange: HTMLImageElement;
  bodyBlue: HTMLImageElement;
  chassisOrange: HTMLImageElement;
  chassisBlue: HTMLImageElement;
}
