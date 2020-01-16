import { Wheel } from '../../model/wheel';
import { RocketConfig } from '../../model/rocket-config';
import { PaintConfig } from '../../model/paint-config';
import { WHEEL_SPINNER_ID, WHEEL_LIGHT_WHEEL_ID } from '../../utils/ids';
import { SpinnerModel } from './spinner-model';
import { WheelsModel } from './wheels-model';
import { LightWheelModel } from './light-wheel-model';

/**
 * Create a body model object. This handles unique models that need a custom class to handle it.
 * @param wheel the wheel
 * @param paints the paint config to apply the wheel paint
 * @param config configuration used for loading assets
 * @return wheel model
 */
export function createWheelsModel(wheel: Wheel, paints: PaintConfig, config: RocketConfig): WheelsModel {
  switch (wheel.id) {
    case WHEEL_SPINNER_ID:
      return new SpinnerModel(wheel, paints, config);
    case WHEEL_LIGHT_WHEEL_ID:
      return new LightWheelModel(wheel, paints, config);
    default:
      return new WheelsModel(wheel, paints, config);
  }
}
