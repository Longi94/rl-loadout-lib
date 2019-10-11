/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

export class Antenna extends Item {

  static readonly NONE: Antenna = {
    icon: '', id: -1, name: 'None', paintable: false, quality: Quality.COMMON

  }

  model?: string;
  base_texture?: string;
  rgba_map?: string;
  stick?: string;
  stick_id?: number;
}

export class AntennaStick {
  id: number;
  model: string;
}
