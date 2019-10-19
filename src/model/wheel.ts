/* tslint:disable:variable-name */

import { Item } from './item';
import { Bone, Vector3 } from 'three';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH } from '../3d/constants';
import { Quality } from './quality';

export class Wheel extends Item {

  static readonly DEFAULT: Wheel = {
    icon: 'icons/Wheel_Star_Thumbnail.jpg',
    id: 376,
    model: 'models/WHEEL_Star_SM.glb',
    name: 'OEM',
    paintable: true,
    quality: Quality.COMMON,
    rim_base: 'textures/OEM_D.tga',
    rim_rgb_map: 'textures/OEM_RGB.tga'
  };

  model: string;
  rim_base: string;
  rim_rgb_map: string;
}

export class WheelConfig {
  right: boolean;
  front: boolean;
  position: Vector3;
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
