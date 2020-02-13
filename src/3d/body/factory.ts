import { BodyModel } from './body-model';
import { Decal } from '../../model/decal';
import { Body } from '../../model/body';
import { ProductID } from '../../utils/ids';
import { PaintConfig } from '../../model/paint-config';
import { MapleModel } from './maple-model';
import { DarkCarModel } from './dark-car-model';
import { EggplantModel } from './eggplant-model';
import { SlimeModel } from './slime-model';
import { FelineModel } from './feline-model';
import { GreyCarModel } from './grey-car-model';
import { BerryModel } from './berry-model';
import { RyeTier2Model } from './rye-tier2-model';
import { RyeTier1Model } from './rye-tier1-model';
import { RonModel } from './ron-model';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { BodyAssets } from '../../loader/body/body-assets';
import { MapleAssets } from '../../loader/body/maple-loader';
import { SlimeAssets } from '../../loader/body/slime-loader';
import { RyeTier1Assets, RyeTier2Assets } from '../../loader/body/rye-loader';
import { RonAssets } from '../../loader/body/ron-loader';

/**
 * Create a body model object. This handles unique models that need a custom class to handle it.
 * @param body car body
 * @param decal car decal
 * @param bodyAssets body assets
 * @param decalAssets decal assets
 * @param paints paints to be applied to the body
 * @return body model
 */
export function createBodyModel(body: Body, decal: Decal, bodyAssets: BodyAssets, decalAssets: DecalAssets,
                                paints: PaintConfig): BodyModel {
  switch (body.id) {
    case ProductID.BODY_MAPLE:
      return new MapleModel(body, decal, bodyAssets as MapleAssets, decalAssets, paints);
    case ProductID.BODY_DARK_CAR:
      return new DarkCarModel(body, decal, bodyAssets, decalAssets, paints);
    case ProductID.BODY_EGGPLANT:
      return new EggplantModel(body, decal, bodyAssets, decalAssets, paints);
    case ProductID.BODY_SLIME:
      return new SlimeModel(body, decal, bodyAssets as SlimeAssets, decalAssets, paints);
    case ProductID.BODY_BERRY:
      return new BerryModel(body, decal, bodyAssets, decalAssets, paints);
    case ProductID.BODY_FELINE:
      return new FelineModel(body, decal, bodyAssets, decalAssets, paints);
    case ProductID.BODY_GREY_CAR:
      return new GreyCarModel(body, decal, bodyAssets, decalAssets, paints);
    case ProductID.BODY_RYE_TIER1:
      return new RyeTier1Model(body, decal, bodyAssets as RyeTier1Assets, decalAssets, paints);
    case ProductID.BODY_RYE_TIER2:
      return new RyeTier2Model(body, decal, bodyAssets as RyeTier2Assets, decalAssets, paints);
    case ProductID.BODY_RON:
      return new RonModel(body, decal, bodyAssets as RonAssets, decalAssets, paints);
    default:
      return new BodyModel(body, decal, bodyAssets, decalAssets, paints);
  }
}
