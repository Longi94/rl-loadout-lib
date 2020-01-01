/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

/**
 * Rocket League car topper.
 */
export class Topper extends Item {

  /**
   * Object representing the empty topper slot.
   */
  static readonly NONE: Topper = {
    icon: '', id: -1, name: 'None', paintable: false, quality: Quality.COMMON
  };

  /**
   * Path to the GLTF model file of the topper.
   */
  model?: string;
  /**
   * Path to the base texture of the topper. Null if the texture is in the gltf file.
   */
  base_texture?: string;
  /**
   * Path to the RGBA map of the topper if paintable.
   */
  rgba_map?: string;
  /**
   * Path to the normal map of the topper.
   */
  normal_map?: string;

  constructor(id: number, icon: string, name: string, quality: Quality, paintable: boolean, model?: string,
              base_texture?: string, rgba_map?: string, normal_map?: string) {
    super(id, icon, name, quality, paintable);
    this.model = model;
    this.base_texture = base_texture;
    this.rgba_map = rgba_map;
    this.normal_map = normal_map;
  }
}
