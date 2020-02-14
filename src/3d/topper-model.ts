import { AbstractObject } from './object';
import { Color, Mesh, MeshStandardMaterial, Scene, Texture } from 'three';
import { Topper } from '../model/topper';
import { disposeIfExists, htmlImageToTexture } from '../utils/util';
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
   * @param topperAssets topper assets
   * @param paints the paint config to apply the topper paint
   * @param keepContextAlive of true, the webgl contexts for textures are kept alive for fast color updates
   */
  constructor(topper?: Topper, topperAssets?: TopperAssets, paints?: PaintConfig, protected keepContextAlive = false) {
    super(topperAssets);
    if (topperAssets != undefined) {
      if (topperAssets.rgbaMap) {
        this.skin = new TopperTexture(
          topperAssets.diffuse,
          topperAssets.rgbaMap,
          paints.topper,
          keepContextAlive
        );
        this.material.map = this.skin.getTexture();
        this.material.needsUpdate = true;
        if (!keepContextAlive) {
          this.skin = undefined;
        }
      } else {
        this.material.map = htmlImageToTexture(topperAssets.diffuse);
      }
      this.material.normalMap = htmlImageToTexture(topperAssets.normalMap);
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
    if (!this.keepContextAlive) {
      throw new Error('Topper color not updatable');
    }
    if (this.skin) {
      this.skin.setPaint(color);
    }
  }

  protected copy(other: TopperModel) {
    super.copy(other);
  }

  clone(): TopperModel {
    const m = new TopperModel();
    m.keepContextAlive = this.keepContextAlive;
    m.copy(this);
    return m;
  }
}
