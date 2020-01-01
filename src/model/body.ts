/* tslint:disable:variable-name */

import { Item } from './item';
import { Quality } from './quality';

/**
 * Rocket League car body.
 */
export class Body extends Item {

  /**
   * The default Octane body.
   */
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

  /**
   * Path to the RGBA blank skin map of the body.
   */
  blank_skin: string;
  /**
   * Path to the base texture of the body.
   */
  base_skin: string;
  /**
   * Path to the GLTF model file of the body.
   */
  model: string;
  /**
   * Path to the base texture of the chassis. Null if this is included in the model.
   */
  chassis_base?: string;
  /**
   * Normal map of the chassis. May act as the RGBA map for painting the chassis.
   */
  chassis_n?: string;
  /**
   * True if the chassis part of the model can be painted.
   */
  chassis_paintable: boolean;
}
