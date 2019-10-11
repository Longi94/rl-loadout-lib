import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DefaultLoadingManager, LoadingManager } from 'three';

const DEFAULT_BUCKET = 'https://storage.googleapis.com/rl-loadout';
const DEFAULT_HOST = 'https://rocket-loadout.com';

export class RocketConfig {
  backendHost: string = DEFAULT_HOST;
  assetHost: string = DEFAULT_BUCKET;
  loadingManager: LoadingManager = new LoadingManager();

  constructor(public readonly gltfLoader: GLTFLoader, loadingManager?: LoadingManager, backendHost?: string,
              assetHost?: string) {
    this.loadingManager = loadingManager == undefined ? DefaultLoadingManager : loadingManager;
    this.backendHost = backendHost == undefined ? DEFAULT_HOST : backendHost;
    this.assetHost = assetHost == undefined ? DEFAULT_BUCKET : assetHost;
  }
}
