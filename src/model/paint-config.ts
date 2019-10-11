import { Color } from 'three';
import {
  ACCENT_COLORS,
  BLUE_PRIMARY_COLORS,
  DEFAULT_ACCENT,
  DEFAULT_BLUE_TEAM,
  DEFAULT_ORANGE_TEAM,
  ORANGE_PRIMARY_COLORS, PAINT_COLORS
} from '../utils/color';

export class PaintConfig {
  primary: Color = new Color(DEFAULT_BLUE_TEAM);
  accent: Color = new Color(DEFAULT_ACCENT);
  body?: Color;
  decal?: Color;
  wheel?: Color;
  topper?: Color;
  antenna?: Color;
}

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

  if (bodyPaintId != undefined) {
    config.body = PAINT_COLORS[bodyPaintId];
  }

  if (decalPaintId != undefined) {
    config.decal = PAINT_COLORS[bodyPaintId];
  }

  if (wheelPaintId != undefined) {
    config.wheel = PAINT_COLORS[bodyPaintId];
  }

  if (topperPaintId != undefined) {
    config.topper = PAINT_COLORS[bodyPaintId];
  }

  if (antennaPaintId != undefined) {
    config.antenna = PAINT_COLORS[bodyPaintId];
  }

  return config;
}
