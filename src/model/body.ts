/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

export class Body extends Item {

  static readonly DEFAULT: Body = {
    base_skin: 'textures/Pepe_Body_D.tga',
    blank_skin: 'textures/Pepe_Body_BlankSkin_RGB.tga',
    chassis_base: null,
    chassis_n: null,
    icon: 'icons/Body_Octane_Thumbnail.jpg',
    id: 23,
    model: 'models/Body_Octane_SF.glb',
    name: 'Octane',
    paintable: true,
    quality: Quality.COMMON
  };

  blank_skin: string;
  base_skin: string;
  model: string;
  chassis_base?: string;
  chassis_n?: string;
}
