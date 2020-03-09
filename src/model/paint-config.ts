import { Color } from 'three';
import {
  ACCENT_COLORS,
  BLUE_PRIMARY_COLORS,
  DEFAULT_ACCENT,
  DEFAULT_BLUE_TEAM,
  DEFAULT_ORANGE_TEAM,
  ORANGE_PRIMARY_COLORS, PAINT_COLORS
} from '../utils/color';

/**
 * Color configuration of a loadout.
 */
export class PaintConfig {
  /**
   * Primary color.
   */
  primary: Color = new Color(DEFAULT_BLUE_TEAM);
  /**
   * Accent color.
   */
  accent: Color = new Color(DEFAULT_ACCENT);
  /**
   * Paint color of the car body. Undefined if unpainted.
   */
  body?: Color;
  /**
   * Paint color of the car decal. Undefined if unpainted.
   */
  decal?: Color;
  /**
   * Paint color of the car wheels. Undefined if unpainted.
   */
  wheel?: Color;
  /**
   * Paint color of the car topper. Undefined if unpainted.
   */
  topper?: Color;
  /**
   * Paint color of the car antenna. Undefined if unpainted.
   */
  antenna?: Color;
}

/**
 * Create a color configuration object based on in-game color IDs, converting the IDs to THREE Color objects with RGB values.
 * @param isOrange Whether the loadout is orange or not
 * @param primaryColorId in-game ID of the primary color
 * @param accentColorId in-game ID of the accent color
 * @param bodyPaintId in-game ID of the body paint
 * @param decalPaintId in-game ID of the decal paint
 * @param wheelPaintId in-game ID of the wheel paint
 * @param topperPaintId in-game ID of the topper paint
 * @param antennaPaintId in-game ID of the antenna paint
 * @return color configuration with RGB values
 */
export function createPaintConfig(
  isOrange?: boolean,
  primaryColorId?: number,
  accentColorId?: number,
  bodyPaintId?: number,
  decalPaintId?: number,
  wheelPaintId?: number,
  topperPaintId?: number,
  antennaPaintId?: number
): PaintConfig {
  if (isOrange == undefined) {
    isOrange = false;
  }

  const config = new PaintConfig();

  if (isOrange) {
    config.primary = new Color(primaryColorId == undefined ? DEFAULT_ORANGE_TEAM : ORANGE_PRIMARY_COLORS[primaryColorId]);
  } else {
    config.primary = new Color(primaryColorId == undefined ? DEFAULT_BLUE_TEAM : BLUE_PRIMARY_COLORS[primaryColorId]);
  }

  config.accent = new Color(accentColorId != undefined ? ACCENT_COLORS[accentColorId] : ACCENT_COLORS[0]);

  if (bodyPaintId != undefined && bodyPaintId > 0) {
    config.body = new Color(PAINT_COLORS[bodyPaintId]);
  }

  if (decalPaintId != undefined && decalPaintId > 0) {
    config.decal = new Color(PAINT_COLORS[decalPaintId]);
  }

  if (wheelPaintId != undefined && wheelPaintId > 0) {
    config.wheel = new Color(PAINT_COLORS[wheelPaintId]);
  }

  if (topperPaintId != undefined && topperPaintId > 0) {
    config.topper = new Color(PAINT_COLORS[topperPaintId]);
  }

  if (antennaPaintId != undefined && antennaPaintId > 0) {
    config.antenna = new Color(PAINT_COLORS[antennaPaintId]);
  }

  return config;
}
