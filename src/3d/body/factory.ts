import { BodyModel } from './body-model';
import { Decal } from '../../model/decal';
import { Body } from '../../model/body';
import {
  BODY_BERRY_ID,
  BODY_DARK_CAR_ID,
  BODY_EGGPLANT_ID,
  BODY_FELINE_ID,
  BODY_GREY_CAR_ID,
  BODY_MAPLE_ID,
  BODY_SLIME_ID,
  BODY_RYE_TIER2_ID,
  BODY_RYE_TIER1_ID, BODY_RON_ID
} from '../../utils/ids';
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
    case BODY_MAPLE_ID:
      return new MapleModel(body, decal, paints, rocketConfig);
    case BODY_DARK_CAR_ID:
      return new DarkCarModel(body, decal, paints, rocketConfig);
    case BODY_EGGPLANT_ID:
      return new EggplantModel(body, decal, paints, rocketConfig);
    case BODY_SLIME_ID:
      return new SlimeModel(body, decal, paints, rocketConfig);
    case BODY_BERRY_ID:
      return new BerryModel(body, decal, paints, rocketConfig);
    case BODY_FELINE_ID:
      return new FelineModel(body, decal, paints, rocketConfig);
    case BODY_GREY_CAR_ID:
      return new GreyCarModel(body, decal, paints, rocketConfig);
    case BODY_RYE_TIER1_ID:
      return new RyeTier1Model(body, decal, paints, rocketConfig);
    case BODY_RYE_TIER2_ID:
      return new RyeTier2Model(body, decal, paints, rocketConfig);
    case BODY_RON_ID:
      return new RonModel(body, decal, paints, rocketConfig);
    default:
      return new BodyModel(body, decal, paints, rocketConfig);
  }
}
