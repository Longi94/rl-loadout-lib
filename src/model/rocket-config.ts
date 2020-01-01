import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DefaultLoadingManager, LoadingManager } from 'three';

const DEFAULT_BUCKET = 'https://storage.googleapis.com/rl-loadout';
const DEFAULT_HOST = 'https://rocket-loadout.com';

/**
 * Configuration class that affects how rl-loadout-lib behaves.
 */
export class RocketConfig {
  /**
   * The host of the API used for retrieving item information. Default: https://rocket-loadout.com
   */
  backendHost: string = DEFAULT_HOST;
  /**
   * The Google Cloud Storage bucket that contains the assets. Default : https://storage.googleapis.com/rl-loadout
   */
  assetHost: string = DEFAULT_BUCKET;
  /**
   * Loader used for loading GLTF files. This needs to be provided, because draco decompressing files must be served separately.
   */
  gltfLoader: GLTFLoader;
  /**
   * Loading manager used by all loaders inside rl-loadout-lib.
   */
  loadingManager: LoadingManager = DefaultLoadingManager;
  /**
   * Quality of textures to be loaded.
   * @see {@link TextureQuality}
   */
  textureQuality: TextureQuality = TextureQuality.HIGH;
  /**
   * Format of textures to be loaded.
   * @see {@link TextureFormat}
   */
  textureFormat: TextureFormat = TextureFormat.TGA;
  /**
   * Quality of models to be loaded. This is currently unused.
   * @see {@link ModelQuality}
   */
  modelQuality: ModelQuality = ModelQuality.HIGH;
  /**
   * Whether draco compressed models should be loaded.
   */
  useCompressedModels = false;

  public constructor(init?: Partial<RocketConfig>) {
    Object.assign(this, init);
  }
}

/**
 * Quality of textures, when downloading them.
 */
export enum TextureQuality {
  /**
   * Load textures in half the size (half width and height).
   */
  LOW,

  /**
   * Load textures in original sizes.
   */
  HIGH
}

/**
 * Format of textures, when downloading them.
 */
export enum TextureFormat {
  /**
   * Load textures in PNG format with lossy compression.
   */
  PNG,

  /**
   * Load textures in TGA format with lossless LRE compression.
   */
  TGA
}

/**
 * Quality of models, when downloading them. Not currently used by the library.
 */
export enum ModelQuality {
  /**
   * Download models with less faces/vertices. These models have the decimate modifier applied to them with blender.
   */
  LOW,

  /**
   * Download models with original quality.
   */
  HIGH
}
