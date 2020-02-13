import { Body } from '../../model/body';
import { Decal } from '../../model/decal';
import { PaintConfig } from '../../model/paint-config';
import { MeshStandardMaterial, Scene, Texture } from 'three';
import { traverseMaterials } from '../object';
import { RyeTier1Model } from './rye-tier1-model';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { RyeTier1Assets, RyeTier2Assets } from '../../loader/body/rye-loader';
import { htmlImageToTexture } from '../../utils/util';

/**
 * Class for the 3D model of Maverick GXT. Needed because of custom textures.
 */
export class RyeTier2Model extends RyeTier1Model {

  kitMaterial: MeshStandardMaterial;

  constructor(body?: Body, decal?: Decal, bodyAssets?: RyeTier2Assets, decalAssets?: DecalAssets, paints?: PaintConfig) {
    super(body, decal, bodyAssets, decalAssets, paints);
    this.init();
  }

  init() {
    super.init();
    const bodyAssets = this.bodyAssets as RyeTier2Assets;
    this.kitMaterial.map = htmlImageToTexture(bodyAssets.kitD);
    this.kitMaterial.normalMap = htmlImageToTexture(bodyAssets.kitN);
  }


  handleModel(scene: Scene) {
    super.handleModel(scene);
    traverseMaterials(scene, mat => {
      if (mat.name === 'MIC_Parts_Tier02') {
        this.kitMaterial = mat;
      }
    });
  }

  protected copy(other: RyeTier2Model) {
    super.copy(other);
    this.init();
  }

  clone(): RyeTier2Model {
    const m = new RyeTier2Model();
    m.copy(this);
    return m;
  }
}
