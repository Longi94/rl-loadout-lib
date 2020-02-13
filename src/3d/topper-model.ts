import { AbstractObject } from './object';
import { Color, Mesh, MeshStandardMaterial, Scene, Texture } from 'three';
import { Topper } from '../model/topper';
import { disposeIfExists } from '../utils/util';
import { Paintable } from './paintable';
import { PaintConfig } from '../model/paint-config';
import { TopperTexture } from '../webgl/topper-texture';
import { TopperAssets } from '../loader/topper/topper-assets';

/**
 * Class that handles loading the 3D model of the car topper.
 */
export class TopperModel extends AbstractObject implements Paintable {

  material: MeshStandardMaterial;
  skin: TopperTexture;

  /**
   * Create an topper object.
   * @param topper the topper
   * @param topperAssets
   * @param paints the paint config to apply the topper paint
   */
  constructor(topper?: Topper, topperAssets?: TopperAssets, paints?: PaintConfig) {
    super(topperAssets);
    if (topperAssets != undefined) {
      if (topperAssets.rgbaMap) {
        this.skin = new TopperTexture(
          topperAssets.diffuse,
          topperAssets.rgbaMap,
          paints.topper
        );
        this.material.map = this.skin.getTexture();
        this.material.needsUpdate = true;
      } else {
        this.material.map = new Texture(topperAssets.diffuse);
      }
      this.material.normalMap = new Texture(topperAssets.normalMap);
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.material);
    disposeIfExists(this.skin);
  }

  handleModel(scene: Scene) {
    scene.traverse(object => {
      if (object['isMesh']) {
        this.material = (object as Mesh).material as MeshStandardMaterial;
      }
    });
  }

  setPaintColor(color: Color) {
    if (this.skin) {
      this.skin.setPaint(color);
    }
  }

  protected copy(other: TopperModel) {
    super.copy(other);
    if (this.skin != undefined) {
      this.skin = other.skin.clone();
    }
  }

  clone(): TopperModel {
    const m = new TopperModel();
    m.copy(this);
    return m;
  }
}
