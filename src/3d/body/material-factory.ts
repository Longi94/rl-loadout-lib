import { Body } from '../../model/body';
import { ProductID } from '../../utils/ids';
import { StaticDecalMaterial } from '../../webgl/static-decal-material';
import { BerryBodyMaterial } from './berry-material';
import { DarkCarMaterial } from './dark-car-material';
import { EggplantMaterial } from './eggplant-material';
import { FelineMaterial } from './feline-material';
import { GreyCarMaterial } from './grey-car-material';

export function getBodyMaterial(body: Body): StaticDecalMaterial {
  switch (body.id) {
    case ProductID.BODY_BERRY:
      return new BerryBodyMaterial();
    case ProductID.BODY_DARK_CAR:
      return new DarkCarMaterial();
    case ProductID.BODY_EGGPLANT:
      return new EggplantMaterial();
    case ProductID.BODY_FELINE:
      return new FelineMaterial();
    case ProductID.BODY_GREY_CAR:
      return new GreyCarMaterial();
    default:
      return new StaticDecalMaterial();
  }
}
