import { Wheel } from '../../model/wheel';
import { RocketConfig } from '../../model/rocket-config';
import { PaintConfig } from '../../model/paint-config';
import { WHEEL_SPINNER_ID } from '../../utils/ids';
import { SpinnerModel } from './spinner-model';
import { WheelsModel } from './wheels-model';

export function createWheelsModel(wheel: Wheel, paints: PaintConfig, config: RocketConfig): WheelsModel {
  switch (wheel.id) {
    case WHEEL_SPINNER_ID:
      return new SpinnerModel(wheel, paints, config);
    default:
      return new WheelsModel(wheel, paints, config);
  }
}
