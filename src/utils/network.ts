import { RocketConfig, TextureFormat, TextureQuality } from '../model/rocket-config';
import { TIER_2_BODIES, TIER_3_BODIES } from './ids';
import { StringUtil } from './util';

/**
 * Make a json fetch request.
 * @param request request information passed to fetch().
 * @throws an error object if the request was not successful
 * @return the json response object
 */
export async function doRequest<T>(request: RequestInfo | string): Promise<T> {
  const response = await fetch(request);
  const json = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      body: json
    };
  }

  return json as T;
}

/**
 * Change the URL of an asset file based on the configuration.
 * @param path path to the original asset.
 * @param rocketConfig configuration
 */
export function getAssetUrl(path: string, rocketConfig: RocketConfig): string {
  if (StringUtil.nullOrEmpty(path)) {
    return undefined;
  }
  if (path.endsWith('.tga')) {
    if (rocketConfig.textureQuality === TextureQuality.LOW && !path.endsWith('_S.tga')) {
      path = path.replace('.tga', '_S.tga');
    }
    if (rocketConfig.textureFormat === TextureFormat.PNG) {
      path = path.replace('.tga', '.png');
    }
  }
  if (path.endsWith('.glb') && rocketConfig.useCompressedModels && !path.endsWith('.draco.glb')) {
    path = path.replace('.glb', '.draco.glb');
  }
  return `${rocketConfig.assetHost}/${path}`;
}

/**
 * Tiered items can share items but use different assets. This function changes asset urls based on what tier the item is.
 * @param bodyId in-game id of the item
 * @param path path to the asset
 */
export function fixTierUrl(bodyId: number, path: string): string {
  if (path == undefined || path.length === 0) {
    return undefined;
  }
  if (path.toLowerCase().includes('TierAll')) {
    return path;
  }
  if (TIER_2_BODIES.has(bodyId)) {
    return path.replace('Tier1', 'Tier2');
  } else if (TIER_3_BODIES.has(bodyId)) {
    return path.replace('Tier1', 'Tier3');
  }
  return path;
}
