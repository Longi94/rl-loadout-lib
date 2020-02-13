import { ObjectAssets } from '../object-assets';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class AntennaAssets extends ObjectAssets {
  antennaModel: GLTF;
  baseTexture: HTMLImageElement;
  normalMap: HTMLImageElement;
}
