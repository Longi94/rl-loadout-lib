import { BodyModel } from './body-model';
import { Body } from '../../model/body';
import { Decal } from '../../model/decal';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { getAssetUrl } from '../../utils/network';
import { MeshStandardMaterial, Scene } from 'three';
import { traverseMaterials } from '../object';
import { ImageTextureLoader, PromiseLoader } from '../../utils/loader';

const CARBON_FIBRE = 'body/body_ron/CarbonFiber_Flipped_N.tga';
const DECALS_DIFFUSE = 'body/body_ron/Body_Ron_Decals_D.tga';
const DECALS_NORMAL = 'body/body_ron/Body_Ron_Decals_N.tga';
const HEX_DIFFUSE = 'body/body_ron/hex.tga';
const HEX_NORMAL = 'body/body_ron/Detail_HexPattern9000_N.tga';

/**
 * Class for the 3D model of McLaren 570S. Needed because of custom textures.
 */
export class RonModel extends BodyModel {

  protected imageLoader: PromiseLoader;

  carbonFibreUrl: string;
  decalsDiffuseUrl: string;
  decalsNormalUrl: string;
  hexDiffuseUrl: string;
  hexNormalUrl: string;

  carbonFibreMaterial: MeshStandardMaterial;
  decalsMaterial: MeshStandardMaterial;
  tilingMaterial: MeshStandardMaterial;

  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(body, decal, paints, rocketConfig);

    this.imageLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));

    this.carbonFibreUrl = getAssetUrl(CARBON_FIBRE, rocketConfig);
    this.decalsDiffuseUrl = getAssetUrl(DECALS_DIFFUSE, rocketConfig);
    this.decalsNormalUrl = getAssetUrl(DECALS_NORMAL, rocketConfig);
    this.hexDiffuseUrl = getAssetUrl(HEX_DIFFUSE, rocketConfig);
    this.hexNormalUrl = getAssetUrl(HEX_NORMAL, rocketConfig);
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

  async load(): Promise<void> {
    const carbonFibreTask = this.imageLoader.load(this.carbonFibreUrl);
    const decalsDTask = this.imageLoader.load(this.decalsDiffuseUrl);
    const decalsNTask = this.imageLoader.load(this.decalsNormalUrl);
    const hexDTask = this.imageLoader.load(this.hexDiffuseUrl);
    const hexNTask = this.imageLoader.load(this.hexNormalUrl);

    await super.load();

    this.carbonFibreMaterial.normalMap = await carbonFibreTask;
    this.decalsMaterial.map = await decalsDTask;
    this.decalsMaterial.normalMap = await decalsNTask;
    this.tilingMaterial.map = await hexDTask;
    this.tilingMaterial.normalMap = await hexNTask;

    this.carbonFibreMaterial.normalMap.offset.y = -20;
    this.carbonFibreMaterial.normalMap.repeat.x = 20;
    this.carbonFibreMaterial.normalMap.repeat.y = 20;
  }
}
