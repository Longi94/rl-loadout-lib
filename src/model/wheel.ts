/* tslint:disable:variable-name */

import { Item } from './item';
import { Bone, Vector3 } from 'three';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from '../3d/constants';
import { Quality } from './quality';

/**
 * Rocket League car wheels.
 */
export class Wheel extends Item {

  /**
   * The default OEM wheels.
   */
  static readonly DEFAULT: Wheel = {
    icon: 'wheel/WHEEL_Star/WHEEL_Star_TThumbnail.jpg',
    id: 376,
    model: 'wheel/WHEEL_Star/WHEEL_Star_SM.glb',
    name: 'OEM',
    paintable: true,
    quality: Quality.COMMON,
    rim_base: 'wheel/WHEEL_Star/OEM_D.tga',
    rim_rgb_map: 'wheel/WHEEL_Star/OEM_RGB.tga',
    rim_n: 'wheel/WHEEL_Star/OEM_N.tga',
    tire_base: 'wheel/WHEEL_Star/Tire_Swarm_Tyr_Diffuse.tga',
    tire_n: 'wheel/WHEEL_Star/Tire_Swarm_Tyr_Normal.tga'
  };

  /**
   * Path to the GLTF model file of the wheel.
   */
  model: string;
  /**
   * Path to the base texture of the rim.
   */
  rim_base: string;
  /**
   * Path to the RGBA map of the rim.
   */
  rim_rgb_map: string;
  /**
   * Path to the normal map of the rim.
   */
  rim_n: string;
  /**
   * Path to the base texture of the tire.
   */
  tire_base: string;
  /**
   * Path to the normal map of the tire.
   */
  tire_n: string;
}

/**
 * Properties for a single wheel (out of 4 usually) on a body.
 */
export class WheelConfig {
  /**
   * Whether the wheel is on the right side.
   */
  right: boolean;
  /**
   * Whether it's a front wheel or not.
   */
  front: boolean;
  /**
   * Position of the wheel, relative to the joint.
   */
  position: Vector3 = new Vector3();
  /**
   * Width of the wheel.
   */
  width: number = BASE_WHEEL_MESH_WIDTH;
  /**
   * Radius of the wheel.
   */
  radius: number = BASE_WHEEL_MESH_RADIUS;
  /**
   * Side offset of the wheel. Positive values move the wheel "outwards".
   */
  offset = 0;
  /**
   * The joint this wheel attaches to.
   */
  joint: Bone;

  /**
   * Create a new config identical to this.
   */
  clone(): WheelConfig {
    const newObj = new WheelConfig();

    newObj.right = this.right;
    newObj.front = this.front;
    newObj.width = this.width;
    newObj.radius = this.radius;
    newObj.offset = this.offset;
    newObj.position = new Vector3();
    newObj.position.copy(this.position);
    newObj.joint = this.joint;

    return newObj;
  }
}
