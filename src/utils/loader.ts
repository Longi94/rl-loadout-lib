import { TextureFormat } from '../model/rocket-config';
import { ImageLoader, LinearEncoding, LoadingManager, RepeatWrapping, TextureLoader } from 'three';
import { TGALoader } from '../utils/three/tga-loader';

/**
 * Wrapper around THREE.js loaders to work with Promises.
 */
export class PromiseLoader {

  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  load(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (url) {
        this.loader.load(url, resolve, undefined, reject);
      } else {
        resolve(undefined);
      }
    });
  }
}

/**
 * Image loader that handles multiple texture formats using ImageLoader and TGALoader.
 */
export class MultiImageLoader {
  loader: any;

  constructor(private readonly format: TextureFormat, loadingManager?: LoadingManager) {
    if (this.format === TextureFormat.TGA) {
      this.loader = new TGALoader(loadingManager);
    } else {
      this.loader = new ImageLoader(loadingManager);
    }
  }

  load(url: string, onLoad: (buffer: any) => void, onProgress?: (event: ProgressEvent) => void,
       onError?: (event: ErrorEvent) => void) {
    this.loader.load(url, onLoad, onProgress, onError);
  }
}

/**
 * Texture loader that handles multiple texture formats using ImageLoader and TGALoader.
 */
export class ImageTextureLoader {

  loader: any;

  constructor(private readonly format: TextureFormat, loadingManager?: LoadingManager) {
    if (this.format === TextureFormat.TGA) {
      this.loader = new TGALoader(loadingManager);
    } else {
      this.loader = new TextureLoader(loadingManager);
    }
  }

  load(url: string, onLoad: (buffer: any) => void, onProgress?: (event: ProgressEvent) => void,
       onError?: (event: ErrorEvent) => void) {
    this.loader.load(url, texture => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.encoding = LinearEncoding;
      texture.flipY = false;
      onLoad(texture);
    }, onProgress, onError);
  }
}
