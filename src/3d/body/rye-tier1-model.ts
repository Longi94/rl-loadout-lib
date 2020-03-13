import { BodyModel } from './body-model';
import { Body } from '../../model/body';
import { Decal } from '../../model/decal';
import { PaintConfig } from '../../model/paint-config';
import { MeshStandardMaterial, Scene } from 'three';
import { traverseMaterials } from '../object';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { RyeTier1Assets } from '../../loader/body/rye-loader';
import { htmlImageToTexture } from '../../utils/util';

/**
 * Class for the 3D model of Maverick G1. Needed because of custom textures.
 */
export class RyeTier1Model extends BodyModel {

  lightsMaterial: MeshStandardMaterial;
  grillMaterial: MeshStandardMaterial;

  constructor(body?: Body, decal?: Decal, bodyAssets?: RyeTier1Assets, decalAssets?: DecalAssets, paints?: PaintConfig) {
    super(body, decal, bodyAssets, decalAssets, paints);
    this.init();
  }

  init() {
    const bodyAssets = this.bodyAssets as RyeTier1Assets;
    this.lightsMaterial.map = htmlImageToTexture(bodyAssets.lightsD);
    this.lightsMaterial.normalMap = htmlImageToTexture(bodyAssets.lightsN);
    this.grillMaterial.normalMap = htmlImageToTexture(bodyAssets.grillN);
  }

  handleModel(scene: Scene) {
    super.handleModel(scene);
    traverseMaterials(scene, mat => {
      if (mat.name === 'MIC_Lights') {
        this.lightsMaterial = mat;
      } else if (mat.name === 'Grill') {
        this.grillMaterial = mat;
      }
    });
  }

  protected copy(other: RyeTier1Model) {
    super.copy(other);
    this.init();
  }

  clone(): RyeTier1Model {
    const m = new RyeTier1Model();
    m.copy(this);
    return m;
  }
}
