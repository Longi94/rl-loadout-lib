/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

export class Body extends Item {

  static readonly DEFAULT: Body = {
    base_skin: 'body/Body_Octane/Pepe_Body_D.tga',
    blank_skin: 'body/Body_Octane/Pepe_Body_BlankSkin.tga',
    chassis_base: 'body/Body_Octane/Chasis_Pepe_D.tga',
    chassis_n: 'body/Body_Octane/Chasis_Pepe_N.tga',
    icon: 'body/Body_Octane/Body_Octane_Thumbnail.jpg',
    id: 23,
    model: 'body/Body_Octane/Body_Octane_SF.glb',
    name: 'Octane',
    paintable: true,
    quality: Quality.COMMON,
    chassis_paintable: false
  };

  blank_skin: string;
  base_skin: string;
  model: string;
  chassis_base?: string;
  chassis_n?: string;
  chassis_paintable: boolean;
}
