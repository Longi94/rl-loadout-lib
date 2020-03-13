import { BodyModel } from './body-model';
import { Color, MeshStandardMaterial, Scene, Texture } from 'three';
import { Decal } from '../../model/decal';
import { COLOR_MAPLE_ORANGE } from '../../utils/color';
import { BodyTexture } from './body-texture';
import { traverseMaterials } from '../object';
import { PaintConfig } from '../../model/paint-config';
import { Body } from '../../model/body';
import { disposeIfExists, htmlImageToTexture } from '../../utils/util';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { SlimeAssets } from '../../loader/body/slime-loader';


/**
 * Class for the 3D model of Ecto-1. Needed because paints cannot be applied to this body.
 */
export class SlimeModel extends BodyModel {

  private bodyDataOrange: Texture;
  private bodyDataBlue: Texture;
  private chassisDataOrange: Texture;
  private chassisDataBlue: Texture;

  private lensMaterial: MeshStandardMaterial;

  constructor(body?: Body, decal?: Decal, bodyAssets?: SlimeAssets, decalAssets?: DecalAssets, paints?: PaintConfig,
              keepContextAlive = false) {
    super(body, decal, bodyAssets, decalAssets, paints, keepContextAlive);
    this.bodyDataOrange = htmlImageToTexture(bodyAssets.bodyOrange);
    this.bodyDataBlue = htmlImageToTexture(bodyAssets.bodyBlue);
    this.chassisDataOrange = htmlImageToTexture(bodyAssets.chassisOrange);
    this.chassisDataBlue = htmlImageToTexture(bodyAssets.chassisBlue);

    this.bodyMaterial.map = this.bodyDataBlue;
    this.chassisMaterial.baseMap = this.chassisDataBlue;
    this.lensMaterial.color.setRGB(0, 0, 0.8);
    this.applyTextures();
  }

  protected applyAssets() {
    this.chassisMaterial.normalMap = htmlImageToTexture(this.bodyAssets.chassisN);
    this.chassisMaterial.normalMap.needsUpdate = true;
  }

  protected initBodySkin(bodyAssets: SlimeAssets, decalAssets: DecalAssets, paints: PaintConfig): BodyTexture {
    return undefined;
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.bodyDataOrange);
    disposeIfExists(this.bodyDataBlue);
    disposeIfExists(this.chassisDataOrange);
    disposeIfExists(this.chassisDataBlue);
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

  changeDecal(decal: Decal, decalAssets: DecalAssets, paints: PaintConfig) {
  }

  setPrimaryColor(color: Color) {
    if (`#${color.getHexString()}` === COLOR_MAPLE_ORANGE) {
      this.bodyMaterial.map = this.bodyDataOrange;
      this.chassisMaterial.baseMap = this.chassisDataOrange;
      this.lensMaterial.color.setRGB(0.8, 0, 0);
    } else {
      this.bodyMaterial.map = this.bodyDataBlue;
      this.chassisMaterial.baseMap = this.chassisDataBlue;
      this.lensMaterial.color.setRGB(0, 0, 0.8);
    }
    this.applyTextures();
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }

  protected copy(other: SlimeModel) {
    super.copy(other);
    this.bodyDataBlue = other.bodyDataBlue.clone();
    this.bodyDataOrange = other.bodyDataOrange.clone();
    this.chassisDataOrange = other.chassisDataOrange.clone();
    this.chassisDataBlue = other.chassisDataBlue.clone();
  }

  clone(): SlimeModel {
    const m = new SlimeModel();
    m.copy(this);
    return m;
  }
}
