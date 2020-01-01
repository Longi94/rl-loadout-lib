import { Hitbox } from './hitbox';

/**
 * Hitbox preset for a particular body.
 */
export class HitboxConfig {
  /**
   * Hitbox type.
   */
  preset = Hitbox.OCTANE;
  /**
   * X offset of the hitbox.
   */
  translationX = 0;
  /**
   * Z offset of the hitbox.
   */
  translationZ = 0;
}
