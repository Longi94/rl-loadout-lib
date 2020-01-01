import { BodyModel } from './body-model';
import { Color, MeshStandardMaterial, Scene, Texture } from 'three';
import { Decal } from '../../model/decal';
import { COLOR_MAPLE_ORANGE } from '../../utils/color';
import { BodyTexture } from './body-texture';
import { traverseMaterials } from '../object';
import { PaintConfig } from '../../model/paint-config';
import { Body } from '../../model/body';
import { RocketConfig } from '../../model/rocket-config';
import { getAssetUrl } from '../../utils/network';
import { disposeIfExists } from '../../utils/util';

const BODY_ORANGE = 'body/body_slime/Body_Slime1_D.tga';
const BODY_BLUE = 'body/body_slime/Body_Slime2_D.tga';
const CHASSIS_ORANGE = 'body/body_slime/Chassis_Slime_D.tga';
const CHASSIS_BLUE = 'body/body_slime/Chassis_Slime2_D.tga';

/**
 * Class for the 3D model of Ecto-1. Needed because paints cannot be applied to this body.
 */
export class SlimeModel extends BodyModel {

  private bodyDataOrange: Texture;
  private bodyDataBlue: Texture;
  private chassisDataOrange: Texture;
  private chassisDataBlue: Texture;

  private lensMaterial: MeshStandardMaterial;

  private readonly bodyOrangeUrl: string;
  private readonly bodyBlueUrl: string;
  private readonly chassisOrangeUrl: string;
  private readonly chassisBlueUrl: string;

  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(body, decal, paints, rocketConfig);

    this.bodyOrangeUrl = getAssetUrl(BODY_ORANGE, rocketConfig);
    this.bodyBlueUrl = getAssetUrl(BODY_BLUE, rocketConfig);
    this.chassisOrangeUrl = getAssetUrl(CHASSIS_ORANGE, rocketConfig);
    this.chassisBlueUrl = getAssetUrl(CHASSIS_BLUE, rocketConfig);
  }

  initBodySkin(body: Body, decal: Decal, paints: PaintConfig): BodyTexture {
    return undefined;
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.bodyDataOrange);
    disposeIfExists(this.bodyDataBlue);
    disposeIfExists(this.chassisDataOrange);
    disposeIfExists(this.chassisDataBlue);
  }

  async load() {
    const modelTask = this.loader.load(this.url);
    const bodyOrangeTask = this.imageTextureLoader.load(this.bodyOrangeUrl);
    const bodyBlueTask = this.imageTextureLoader.load(this.bodyBlueUrl);
    const chassisOrangeTask = this.imageTextureLoader.load(this.chassisOrangeUrl);
    const chassisBlueTask = this.imageTextureLoader.load(this.chassisBlueUrl);

    const gltf = await modelTask;
    this.handleGltf(gltf);

    this.bodyDataOrange = await bodyOrangeTask;
    this.bodyDataBlue = await bodyBlueTask;
    this.chassisDataOrange = await chassisOrangeTask;
    this.chassisDataBlue = await chassisBlueTask;

    this.bodyMaterial.map = this.bodyDataBlue;
    this.chassisMaterial.map = this.chassisDataBlue;

    this.lensMaterial.color.setRGB(0, 0, 0.8);

    this.applyTextures();
  }

  handleModel(scene: Scene) {
    super.handleModel(scene);

    traverseMaterials(scene, material => {
      if (material.name === 'MAT_Slime_HeadlightLens_VertColor') {
        this.lensMaterial = material;
      }
    });
  }

  private applyTextures() {
    this.bodyMaterial.needsUpdate = true;
    this.chassisMaterial.needsUpdate = true;
    this.lensMaterial.needsUpdate = true;
  }

  setPaintColor(color: Color) {
  }

  async changeDecal(decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
  }

  setPrimaryColor(color: Color) {
    if (`#${color.getHexString()}` === COLOR_MAPLE_ORANGE) {
      this.bodyMaterial.map = this.bodyDataOrange;
      this.chassisMaterial.map = this.chassisDataOrange;
      this.lensMaterial.color.setRGB(0.8, 0, 0);
    } else {
      this.bodyMaterial.map = this.bodyDataBlue;
      this.chassisMaterial.map = this.chassisDataBlue;
      this.lensMaterial.color.setRGB(0, 0, 0.8);
    }
    this.applyTextures();
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }
}
