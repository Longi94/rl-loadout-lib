import { RimTexture, WebGLRimTexture } from '../../webgl/rim-texture';
import { getAssetUrl } from '../../utils/network';
import { PaintConfig } from '../../model/paint-config';
import { RocketConfig } from '../../model/rocket-config';
import { Wheel } from '../../model/wheel';
import { StringUtil } from '../../utils/util';
import { LightWheelRimTexture } from './light-wheel-model';
import { TireTexture, WebGLTireTexture, WebGLUnpaintableTireTexture } from '../../webgl/tire-texture';
import { Color } from 'three';
import { ProductID } from '../../utils/ids';
import { ShadedPaintableTexture } from '../../webgl/shaded-paintable-texture';
import { ChewyTireTexture } from './chewy-model';

export function getRimTexture(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig): RimTexture {
  const rimBase = getAssetUrl(wheel.rim_base, rocketConfig);
  const rimRgbMap = getAssetUrl(wheel.rim_rgb_map, rocketConfig);
  switch (wheel.id) {
    case ProductID.WHEEL_LIGHT_WHEEL:
      return new LightWheelRimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig);
    case ProductID.WHEEL_LONE_WOLF:
    case ProductID.WHEEL_EXOTIC:
    case ProductID.WHEEL_7SPOKE:
    case ProductID.WHEEL_GLASSY:
    case ProductID.WHEEL_PUMPERNICKEL:
    case ProductID.WHEEL_DAISUKE:
      return new WebGLRimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig, 'r');
    case ProductID.WHEEL_GETSI:
    case ProductID.WHEEL_RAZZLEMADOO:
    case ProductID.WHEEL_FOLLIN:
    case ProductID.WHEEL_REAPER:
    case ProductID.WHEEL_LEAN:
    case ProductID.WHEEL_TREBLE_MEGA:
    case ProductID.WHEEL_OBSCURE:
    case ProductID.WHEEL_CHEWY:
    case ProductID.WHEEL_INN:
    case ProductID.WHEEL_FORK:
    case ProductID.WHEEL_CHIEF:
    case ProductID.WHEEL_ENSPIER:
    case ProductID.WHEEL_SPECTRAL:
    case ProductID.WHEEL_IGTYJR:
      return new WebGLRimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig, 'a', true);
    case ProductID.WHEEL_DONUT:
      return new ShadedPaintableTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig);
    case ProductID.WHEEL_STORMDRAIN:
    case ProductID.WHEEL_ALLSPARK:
      return new WebGLRimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig, 'a', false);
    default:
      if (!StringUtil.nullOrEmpty(wheel.rim_rgb_map)) {
        return new WebGLRimTexture(rimBase, rimRgbMap, paints.wheel, rocketConfig, 'r', true);
      }
      return undefined;
  }
}

export function getTireTexture(wheel: Wheel, paints: PaintConfig, rocketConfig: RocketConfig): TireTexture | Color {
  const tireBase = getAssetUrl(wheel.tire_base, rocketConfig);
  const tireNormal = getAssetUrl(wheel.tire_n, rocketConfig);
  switch (wheel.id) {
    case ProductID.WHEEL_EXOTIC:
    case ProductID.WHEEL_7SPOKE:
    case ProductID.WHEEL_GLASSY:
    case ProductID.WHEEL_GETSI:
    case ProductID.WHEEL_RAZZLEMADOO:
    case ProductID.WHEEL_FOLLIN:
    case ProductID.WHEEL_REAPER:
    case ProductID.WHEEL_ZTEIGHTEEN:
    case ProductID.WHEEL_INN:
      return new WebGLTireTexture(tireBase, tireNormal, paints.wheel, rocketConfig, 'r', true, true);
    case ProductID.WHEEL_SEASTAR:
    case ProductID.WHEEL_OBSCURE:
      return new Color('#141414');
    case ProductID.WHEEL_PEPPERMINT:
    case ProductID.WHEEL_LEAN:
    case ProductID.WHEEL_TREBLE_MEGA:
    case ProductID.WHEEL_SPECTRAL:
    case ProductID.WHEEL_BLENDER:
    case ProductID.WHEEL_GS:
    case ProductID.WHEEL_FR01:
      return new WebGLTireTexture(tireBase, tireNormal, paints.wheel, rocketConfig, 'r', true, false);
    case ProductID.WHEEL_CHEWY:
      return new ChewyTireTexture(tireNormal, paints.wheel, rocketConfig, true);
    case ProductID.WHEEL_ENSPIER:
      return new ChewyTireTexture(tireNormal, paints.wheel, rocketConfig, false);
    case ProductID.WHEEL_SHURIKEN:
      return new WebGLUnpaintableTireTexture(tireBase, tireNormal, rocketConfig);
    default:
      if (!StringUtil.nullOrEmpty(wheel.tire_base)) {
        return new WebGLTireTexture(tireBase, tireNormal, paints.wheel, rocketConfig, 'a', false, true);
      }
      return undefined;
  }
}
