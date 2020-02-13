import { BodyModel } from './body-model';
import { Body } from '../../model/body';
import { Decal } from '../../model/decal';
import { PaintConfig } from '../../model/paint-config';
import { MeshStandardMaterial, Scene, Texture } from 'three';
import { traverseMaterials } from '../object';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { RonAssets } from '../../loader/body/ron-loader';
import { htmlImageToTexture } from '../../utils/util';

/**
 * Class for the 3D model of McLaren 570S. Needed because of custom textures.
 */
export class RonModel extends BodyModel {

  carbonFibreMaterial: MeshStandardMaterial;
  decalsMaterial: MeshStandardMaterial;
  tilingMaterial: MeshStandardMaterial;

  constructor(body?: Body, decal?: Decal, bodyAssets?: RonAssets, decalAssets?: DecalAssets, paints?: PaintConfig) {
    super(body, decal, bodyAssets, decalAssets, paints);
    this.init();
  }

  init() {
    const bodyAssets = this.bodyAssets as RonAssets;
    this.carbonFibreMaterial.normalMap = htmlImageToTexture(bodyAssets.carbonFibre);
    this.decalsMaterial.map = htmlImageToTexture(bodyAssets.decalsD);
    this.decalsMaterial.normalMap = htmlImageToTexture(bodyAssets.decalsN);
    this.tilingMaterial.map = htmlImageToTexture(bodyAssets.hexD);
    this.tilingMaterial.normalMap = htmlImageToTexture(bodyAssets.hexN);

    this.carbonFibreMaterial.normalMap.offset.y = -20;
    this.carbonFibreMaterial.normalMap.repeat.x = 20;
    this.carbonFibreMaterial.normalMap.repeat.y = 20;
  }

  handleModel(scene: Scene) {
    super.handleModel(scene);
    traverseMaterials(scene, mat => {
      if (mat.name === 'CarbonFibre') {
        this.carbonFibreMaterial = mat;
      } else if (mat.name === 'Decals') {
        this.decalsMaterial = mat;
      } else if (mat.name === 'MAT_Ron_Detail_Tiling') {
        this.tilingMaterial = mat;
      }
    });
  }

  protected copy(other: RonModel) {
    super.copy(other);
    this.init();
  }

  clone(): RonModel {
    const m = new RonModel();
    m.copy(this);
    return m;
  }
}
