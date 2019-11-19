import { RocketConfig, TextureFormat, TextureQuality } from '../model/rocket-config';

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

export function getAssetUrl(path: string, rocketConfig: RocketConfig): string {
  if (path == undefined || path.length === 0) {
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
