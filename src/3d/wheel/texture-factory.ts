import { RimTexture } from '../../webgl/rim-texture';
import { getAssetUrl } from '../../utils/network';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { Wheel } from '../../model/wheel';
import { StringUtil } from '../../utils/util';
import { LightWheelRimTexture } from './light-wheel-model';
import { TireTexture } from '../../webgl/tire-texture';
import { Color } from 'three';
import {
  WHEEL_LIGHT_WHEEL_ID,
  WHEEL_LONE_WOLF_ID,
  WHEEL_EXOTIC_ID,
  WHEEL_SEASTAR_ID
} from '../../utils/ids';

export function getRimTexture(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig): RimTexture {
  const rimBase = getAssetUrl(wheel.rim_base, rocketConfig);
  const rimRgbMap = getAssetUrl(wheel.rim_rgb_map, rocketConfig);
  switch (wheel.id) {
    case WHEEL_LIGHT_WHEEL_ID:
      return new LightWheelRimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig);
    case WHEEL_LONE_WOLF_ID:
    case WHEEL_EXOTIC_ID:
      return new RimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig, 'r');
    default:
      if (!StringUtil.nullOrEmpty(wheel.rim_rgb_map)) {
        return new RimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig, 'r', true);
      }
      return undefined;
  }
}

export function getTireTexture(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig): TireTexture | Color {
  const tireBase = getAssetUrl(wheel.tire_base, rocketConfig);
  const tireNormal = getAssetUrl(wheel.tire_n, rocketConfig);
  switch (wheel.id) {
    case WHEEL_EXOTIC_ID:
      return new TireTexture(tireBase, tireNormal, paints.wheel, rocketConfig, 'r', true, true);
    case WHEEL_SEASTAR_ID:
      return new Color('#141414');
    default:
      if (!StringUtil.nullOrEmpty(wheel.tire_base)) {
        return new TireTexture(tireBase, tireNormal, paints.wheel, rocketConfig, 'a', false, true);
      }
      return undefined;
  }
}
