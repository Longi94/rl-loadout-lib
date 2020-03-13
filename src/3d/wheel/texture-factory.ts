import { PaintConfig } from '../../model/paint-config';
import { Wheel } from '../../model/wheel';
import { htmlImageToTexture, StringUtil } from '../../utils/util';
import { Color } from 'three';
import { ProductID } from '../../utils/ids';
import { WheelAssets } from '../../loader/wheel/wheel-assets';
import { RimMaterial } from '../../webgl/rim-material';
import { TireMaterial } from '../../webgl/tire-material';
import { LightWheelRimMaterial } from './light-wheel-model';

export function getRimMaterial(wheel: Wheel, wheelAssets: WheelAssets, paints: PaintConfig): RimMaterial {
  let material: RimMaterial;
  switch (wheel.id) {
    case ProductID.WHEEL_LIGHT_WHEEL:
      material = new LightWheelRimMaterial();
      break;
    case ProductID.WHEEL_LONE_WOLF:
    case ProductID.WHEEL_EXOTIC:
    case ProductID.WHEEL_7SPOKE:
    case ProductID.WHEEL_GLASSY:
    case ProductID.WHEEL_PUMPERNICKEL:
    case ProductID.WHEEL_DAISUKE:
      material = new RimMaterial('r');
      break;
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
      material = new RimMaterial('a', true);
      break;
    case ProductID.WHEEL_DONUT:
    //return new ShadedPaintableTexture(wheelAssets.rimD, wheelAssets.rimRgba, paints.wheel, keepContextAlive);
    case ProductID.WHEEL_STORMDRAIN:
    case ProductID.WHEEL_ALLSPARK:
      material = new RimMaterial('a', false);
      break;
    default:
      if (!StringUtil.nullOrEmpty(wheel.rim_rgb_map)) {
        material = new RimMaterial('r', true);
      }
      break;
  }

  if (material != undefined) {
    material.map = htmlImageToTexture(wheelAssets.rimD);
    material.rgbaMap = htmlImageToTexture(wheelAssets.rimRgba);
    material.normalMap = htmlImageToTexture(wheelAssets.rimN);
    material.paintColor = paints.wheel;
    material.needsUpdate = true;
  }

  return material;
}

export function getTireMaterial(wheel: Wheel, wheelAssets: WheelAssets, paints: PaintConfig): TireMaterial {
  let material: TireMaterial;
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
      material = new TireMaterial('r', true, true);
      break;
    case ProductID.WHEEL_SEASTAR:
    case ProductID.WHEEL_OBSCURE:
      material = new TireMaterial('a');
      material.colorOnly = true;
      material.color = new Color('#141414');
      break;
    case ProductID.WHEEL_PEPPERMINT:
    case ProductID.WHEEL_LEAN:
    case ProductID.WHEEL_TREBLE_MEGA:
    case ProductID.WHEEL_SPECTRAL:
    case ProductID.WHEEL_BLENDER:
    case ProductID.WHEEL_GS:
    case ProductID.WHEEL_FR01:
      material = new TireMaterial('r', true, false);
      break;
    case ProductID.WHEEL_CHEWY:
    //return new ChewyTireTexture(wheelAssets.tireN, paints.wheel, true, keepContextAlive);
    case ProductID.WHEEL_ENSPIER:
    //return new ChewyTireTexture(wheelAssets.tireN, paints.wheel, false, keepContextAlive);
    case ProductID.WHEEL_SHURIKEN:
    //return new WebGLUnpaintableTireTexture(wheelAssets.tireD, wheelAssets.tireN, keepContextAlive);
    default:
      if (!StringUtil.nullOrEmpty(wheel.tire_base)) {
        material = new TireMaterial('a', false, true);
      }
      break;
  }

  if (material != undefined) {
    material.normalMap = htmlImageToTexture(wheelAssets.tireN);
    material.map = htmlImageToTexture(wheelAssets.tireD);
    material.paintColor = paints.wheel;
    material.needsUpdate = true;
  }

  return material;
}
