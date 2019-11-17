import { BodyModel } from './body-model';
import { Body } from '../../model/body';
import { Decal } from '../../model/decal';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { getAssetUrl } from '../../utils/network';
import { MeshStandardMaterial, Scene } from 'three';
import { traverseMaterials } from '../object';
import { ImageTextureLoader, PromiseLoader } from '../../utils/loader';

const LIGHTS_DIFFUSE = 'body/Body_Rye_Tier1/Chassis_Rye_Lights_D.tga';
const LIGHTS_NORMAL = 'body/Body_Rye_Tier1/Chassis_Rye_Lights_N.tga';
const GRILL_NORMAL = 'body/Body_Rye_Tier1/Car_Grille_Hexy_N.tga';

export class RyeTier1Model extends BodyModel {

  protected imageLoader: PromiseLoader;

  lightsDiffuseUrl: string;
  lightsNormalUrl: string;
  grillNormalUrl: string;

  lightsMaterial: MeshStandardMaterial;
  grillMaterial: MeshStandardMaterial;

  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(body, decal, paints, rocketConfig);

    this.imageLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));

    this.lightsDiffuseUrl = getAssetUrl(LIGHTS_DIFFUSE, rocketConfig);
    this.lightsNormalUrl = getAssetUrl(LIGHTS_NORMAL, rocketConfig);
    this.grillNormalUrl = getAssetUrl(GRILL_NORMAL, rocketConfig);
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

  async load(): Promise<void> {
    const lightsDTask = this.imageLoader.load(this.lightsDiffuseUrl);
    const lightsNTask = this.imageLoader.load(this.lightsNormalUrl);
    const grillNTask = this.imageLoader.load(this.grillNormalUrl);

    await super.load();

    this.lightsMaterial.map = await lightsDTask;
    this.lightsMaterial.normalMap = await lightsNTask;
    this.grillMaterial.normalMap = await grillNTask;
  }
}
