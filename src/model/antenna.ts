/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

/**
 * Rocket League antenna.
 */
export class Antenna extends Item {

  /**
   * Object representing the empty antenna slot.
   */
  static readonly NONE: Antenna = {
    icon: '', id: -1, name: 'None', paintable: false, quality: Quality.COMMON
  };

  /**
   * Path to the GLTF model file of the antenna head.
   */
  model?: string;
  /**
   * Path to the base texture of the antenna head. Null if the texture is in the gltf file.
   */
  base_texture?: string;
  /**
   * Path to the RGBA map of the antenna head if paintable.
   */
  rgba_map?: string;
  /**
   * Path to the normal map of the antenna.
   */
  normal_map?: string;
  /**
   * Path to the GLTF model file of the antenna stick
   */
  stick?: string;
  /**
   * ID of the antenna stick.
   */
  stick_id?: number;
}

/**
 * Antenna stick.
 */
export class AntennaStick {
  /**
   * ID of the antenna stick.
   */
  id: number;
  /**
   * Path to the GLTF model file of the antenna stick.
   */
  model: string;
}
