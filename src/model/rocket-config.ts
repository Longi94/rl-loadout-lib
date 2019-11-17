import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DefaultLoadingManager, LoadingManager } from 'three';

const DEFAULT_BUCKET = 'https://storage.googleapis.com/rl-loadout';
const DEFAULT_HOST = 'https://rocket-loadout.com';

export class RocketConfig {
  backendHost: string = DEFAULT_HOST;
  assetHost: string = DEFAULT_BUCKET;
  gltfLoader: GLTFLoader;
  loadingManager: LoadingManager = DefaultLoadingManager;
  textureQuality: TextureQuality = TextureQuality.HIGH;
  textureFormat: TextureFormat = TextureFormat.TGA;
  modelQuality: ModelQuality = ModelQuality.HIGH;
  useCompressedModels: boolean = false;

  public constructor(init?: Partial<RocketConfig>) {
    Object.assign(this, init);
  }
}

export enum TextureQuality {
  LOW, HIGH
}

export enum TextureFormat {
  PNG, TGA
}

export enum ModelQuality {
  LOW, HIGH
}
