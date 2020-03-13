import { AbstractObject } from './object';
import { Color, Mesh, Scene } from 'three';
import { Topper } from '../model/topper';
import { disposeIfExists, htmlImageToTexture } from '../utils/util';
import { Paintable } from './paintable';
import { PaintConfig } from '../model/paint-config';
import { TopperAssets } from '../loader/topper/topper-assets';
import { TopperMaterial } from '../webgl/topper-material';

/**
 * Class that handles loading the 3D model of the car topper.
 */
export class TopperModel extends AbstractObject implements Paintable {

  mesh: Mesh;
  material: TopperMaterial;

  /**
   * Create an topper object.
   * @param topper the topper
   * @param topperAssets topper assets
   * @param paints the paint config to apply the topper paint
   */
  constructor(topper?: Topper, topperAssets?: TopperAssets, paints?: PaintConfig) {
    super(topperAssets);
    if (topperAssets != undefined) {
      this.material = new TopperMaterial();
      this.material.normalMap = htmlImageToTexture(topperAssets.normalMap);
      this.material.map = htmlImageToTexture(topperAssets.diffuse);
      this.material.rgbaMap = htmlImageToTexture(topperAssets.rgbaMap);
      this.material.needsUpdate = true;
      this.mesh.material = this.material;
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.material);
  }

  handleModel(scene: Scene) {
    scene.traverse(object => {
      if (object['isMesh']) {
        this.mesh = object as Mesh;
      }
    });
  }

  setPaintColor(color: Color) {
    if (this.material != undefined) {
      this.material.paintColor = color;
    }
  }

  protected copy(other: TopperModel) {
    super.copy(other);
  }

  clone(): TopperModel {
    const m = new TopperModel();
    m.copy(this);
    return m;
  }
}
