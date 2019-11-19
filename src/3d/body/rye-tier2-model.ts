import { Body } from '../../model/body';
import { Decal } from '../../model/decal';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { getAssetUrl } from '../../utils/network';
import { MeshStandardMaterial, Scene } from 'three';
import { traverseMaterials } from '../object';
import { ImageTextureLoader, PromiseLoader } from '../../utils/loader';
import { RyeTier1Model } from './rye-tier1-model';

const KIT_DIFFUSE = 'body/Body_Rye_Tier2/Body_Rye_BodyKit_D.tga';
const KIT_NORMAL = 'body/Body_Rye_Tier2/Body_Rye_BodyKit_N.tga';

export class RyeTier2Model extends RyeTier1Model {

  kitDiffuseUrl: string;
  kitNormalUrl: string;

  kitMaterial: MeshStandardMaterial;

  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(body, decal, paints, rocketConfig);

    this.imageLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));

    this.kitDiffuseUrl = getAssetUrl(KIT_DIFFUSE, rocketConfig);
    this.kitNormalUrl = getAssetUrl(KIT_NORMAL, rocketConfig);
  }

  handleModel(scene: Scene) {
    super.handleModel(scene);
    traverseMaterials(scene, mat => {
      if (mat.name === 'MIC_Parts_Tier02') {
        this.kitMaterial = mat;
      }
    });
  }

  async load(): Promise<void> {
    const kitDTask = this.imageLoader.load(this.kitDiffuseUrl);
    const kitNTask = this.imageLoader.load(this.kitNormalUrl);

    await super.load();

    this.kitMaterial.map = await kitDTask;
    this.kitMaterial.normalMap = await kitNTask;
  }
}
