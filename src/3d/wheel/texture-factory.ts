import { RimTexture } from '../../webgl/rim-texture';
import { getAssetUrl, PaintConfig, RocketConfig, Wheel, WHEEL_LIGHT_WHEEL_ID } from '../..';
import { StringUtil } from '../../utils/util';
import { LightWheelRimTexture } from './light-wheel-model';

export function getRimTexture(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig): RimTexture {
  switch (wheel.id) {
    case WHEEL_LIGHT_WHEEL_ID:
      return new LightWheelRimTexture(
        getAssetUrl(wheel.rim_base, rocketConfig),
        getAssetUrl(wheel.rim_rgb_map, rocketConfig),
        paints.wheel,
        rocketConfig
      );
    default:
      if (!StringUtil.nullOrEmpty(wheel.rim_rgb_map)) {
        return new RimTexture(
          getAssetUrl(wheel.rim_base, rocketConfig),
          getAssetUrl(wheel.rim_rgb_map, rocketConfig),
          paints.wheel,
          rocketConfig
        );
      }
      return undefined;
  }
}
