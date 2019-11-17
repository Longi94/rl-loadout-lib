import { TextureFormat } from '../model/rocket-config';
import { FileLoader, LinearEncoding, LoadingManager, RepeatWrapping, TextureLoader } from 'three';
import { TgaRgbaLoader } from './tga-rgba-loader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { PNG } from 'pngjs/browser';

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

export class ImageDataLoader {
  loader: any;

  constructor(private readonly format: TextureFormat, loadingManager?: LoadingManager) {
    if (this.format === TextureFormat.TGA) {
      this.loader = new TgaRgbaLoader(loadingManager);
    } else {
      this.loader = new FileLoader(loadingManager);
      this.loader.setResponseType('arraybuffer');
    }
  }

  load(url: string, onLoad: (buffer: any) => void, onProgress?: (event: ProgressEvent) => void,
       onError?: (event: ErrorEvent) => void) {
    this.loader.load(url, img => {
      if (this.format === TextureFormat.TGA) {
        onLoad(img);
      }

      new PNG({filterType: -1}).parse(img, function(error, data) {
        if (error) {
          console.error(error);
        }
        onLoad(data);
      });
    }, onProgress, onError);
  }
}

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
