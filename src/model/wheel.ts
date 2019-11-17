/* tslint:disable:variable-name */

import { Item } from './item';
import { Bone, Vector3 } from 'three';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from '../3d/constants';
import { Quality } from './quality';

export class Wheel extends Item {

  static readonly DEFAULT: Wheel = {
    icon: 'wheel/WHEEL_Star/WHEEL_Star_TThumbnail.jpg',
    id: 376,
    model: 'wheel/WHEEL_Star/WHEEL_Star_SM.glb',
    name: 'OEM',
    paintable: true,
    quality: Quality.COMMON,
    rim_base: 'wheel/WHEEL_Star/OEM_D.tga',
    rim_rgb_map: 'wheel/WHEEL_Star/OEM_RGB.tga'
  };

  model: string;
  rim_base: string;
  rim_rgb_map: string;
}

export class WheelConfig {
  right: boolean;
  front: boolean;
  position: Vector3 = new Vector3();
  width: number = BASE_WHEEL_MESH_WIDTH;
  radius: number = BASE_WHEEL_MESH_RADIUS;
  offset = 0;
  joint: Bone;

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
