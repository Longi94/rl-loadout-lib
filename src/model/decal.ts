/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

export class Decal extends Item {

  static readonly NONE: Decal = {
    icon: '', id: -1, name: 'None', paintable: false, quality: Quality.COMMON
  };

  base_texture?: string;
  rgba_map?: string;
  body_id?: string;
  body_name?: string;
}
