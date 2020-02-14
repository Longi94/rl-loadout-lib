import { BodyModel } from './body-model';
import { Color, Texture } from 'three';
import { Decal } from '../../model/decal';
import { COLOR_MAPLE_ORANGE } from '../../utils/color';
import { BodyTexture } from './body-texture';
import { PaintConfig } from '../../model/paint-config';
import { Body } from '../../model/body';
import { disposeIfExists, htmlImageToTexture } from '../../utils/util';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { MapleAssets } from '../../loader/body/maple-loader';

/**
 * Class for the 3D model of Jurassic Jeep® Wrangler. Needed because paints cannot be applied to this body.
 */
export class MapleModel extends BodyModel {

  private bodyDataOrange: Texture;
  private bodyDataBlue: Texture;
  private chassisDataOrange: Texture;
  private chassisDataBlue: Texture;

  constructor(body?: Body, decal?: Decal, bodyAssets?: MapleAssets, decalAssets?: DecalAssets, paints?: PaintConfig,
              keepContextAlive = false) {
    super(body, decal, bodyAssets, decalAssets, paints, keepContextAlive);
    this.bodyDataOrange = htmlImageToTexture(bodyAssets.bodyOrange);
    this.bodyDataBlue = htmlImageToTexture(bodyAssets.bodyBlue);
    this.chassisDataOrange = htmlImageToTexture(bodyAssets.chassisOrange);
    this.chassisDataBlue = htmlImageToTexture(bodyAssets.chassisBlue);

    this.bodyMaterial.map = this.bodyDataBlue;
    this.chassisMaterial.map = this.chassisDataBlue;
    this.applyTextures();
  }

  protected applyAssets() {
    this.chassisMaterial.normalMap = htmlImageToTexture(this.bodyAssets.chassisN);
    this.chassisMaterial.normalMap.needsUpdate = true;
  }

  protected initBodySkin(bodyAssets: MapleAssets, decalAssets: DecalAssets, paints: PaintConfig): BodyTexture {
    return undefined;
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.bodyDataOrange);
    disposeIfExists(this.bodyDataBlue);
    disposeIfExists(this.chassisDataOrange);
    disposeIfExists(this.chassisDataBlue);
  }

  private applyTextures() {
    this.bodyMaterial.needsUpdate = true;
    this.chassisMaterial.needsUpdate = true;
  }

  setPaintColor(color: Color) {
  }

  changeDecal(decal: Decal, decalAssets: DecalAssets, paints: PaintConfig) {
  }

  setPrimaryColor(color: Color) {
    if (`#${color.getHexString()}` === COLOR_MAPLE_ORANGE) {
      this.bodyMaterial.map = this.bodyDataOrange;
      this.chassisMaterial.map = this.chassisDataOrange;
    } else {
      this.bodyMaterial.map = this.bodyDataBlue;
      this.chassisMaterial.map = this.chassisDataBlue;
    }
    this.applyTextures();
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }

  protected copy(other: MapleModel) {
    super.copy(other);
    this.bodyDataBlue = other.bodyDataBlue.clone();
    this.bodyDataOrange = other.bodyDataOrange.clone();
    this.chassisDataOrange = other.chassisDataOrange.clone();
    this.chassisDataBlue = other.chassisDataBlue.clone();
  }

  clone(): MapleModel {
    const m = new MapleModel();
    m.copy(this);
    return m;
  }
}
