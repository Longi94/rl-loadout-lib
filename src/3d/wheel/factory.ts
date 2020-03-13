import { Wheel } from '../../model/wheel';
import { PaintConfig } from '../../model/paint-config';
import { ProductID } from '../../utils/ids';
import { SpinnerModel } from './spinner-model';
import { WheelsModel } from './wheels-model';
import { WheelAssets } from '../../loader/wheel/wheel-assets';

/**
 * Create a body model object. This handles unique models that need a custom class to handle it.
 * @param wheel the wheel
 * @param wheelAssets downloaded models and textures
 * @param paints the paint config to apply the wheel paint
 * @return wheel model
 */
export function createWheelsModel(wheel: Wheel, wheelAssets: WheelAssets, paints: PaintConfig): WheelsModel {
  switch (wheel.id) {
    case ProductID.WHEEL_SPINNER:
      return new SpinnerModel(wheelAssets, wheel, paints);
    default:
      return new WheelsModel(wheelAssets, wheel, paints);
  }
}
