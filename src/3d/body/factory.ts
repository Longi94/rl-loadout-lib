import { BodyModel } from './body-model';
import { Decal } from '../../model/decal';
import { Body } from '../../model/body';
import { ProductID } from '../../utils/ids';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
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

/**
 * Create a body model object. This handles unique models that need a custom class to handle it.
 * @param body car body
 * @param decal car decal
 * @param paints paints to be applied to the body
 * @param rocketConfig configuration used for loading assets
 * @return body model
 */
export function createBodyModel(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig): BodyModel {
  switch (body.id) {
    case ProductID.BODY_MAPLE:
      return new MapleModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_DARK_CAR:
      return new DarkCarModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_EGGPLANT:
      return new EggplantModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_SLIME:
      return new SlimeModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_BERRY:
      return new BerryModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_FELINE:
      return new FelineModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_GREY_CAR:
      return new GreyCarModel(body, decal, paints, rocketConfig);
    case ProductID.BODY_RYE_TIER1:
      return new RyeTier1Model(body, decal, paints, rocketConfig);
    case ProductID.BODY_RYE_TIER2:
      return new RyeTier2Model(body, decal, paints, rocketConfig);
    case ProductID.BODY_RON:
      return new RonModel(body, decal, paints, rocketConfig);
    default:
      return new BodyModel(body, decal, paints, rocketConfig);
  }
}
