/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

/**
 * Rocket League decal.
 */
export class Decal extends Item {

  /**
   * Object representing the empty decal slot.
   */
  static readonly NONE: Decal = {
    icon: '', id: -1, name: 'None', paintable: false, quality: Quality.COMMON
  };

  /**
   * Path to the base texture.
   */
  base_texture?: string;
  /**
   * Path to the RGBA map.
   */
  rgba_map?: string;
  /**
   * ID of the body this decal can be applied to. Null if universal.
   */
  body_id?: number;
  body_name?: string;
}
