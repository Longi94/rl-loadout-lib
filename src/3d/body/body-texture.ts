import { Color, Texture } from 'three';

/**
 * Car body texture.
 */
export interface BodyTexture {

  /**
   * Set the primary color.
   * @param color
   */
  setPrimary(color: Color);

  /**
   * Set the accent color.
   * @param color
   */
  setAccent(color: Color);

  /**
   * Set the paint color of the decal.
   * @param color
   */
  setPaint(color: Color);

  /**
   * Set the paint color of the body.
   * @param color
   */
  setBodyPaint(color: Color);

  /**
   * Dispose of texture resources.
   */
  dispose();

  /**
   * Load files needed for the texture.
   */
  load(): Promise<any>;

  /**
   * Get the texture object that can be applied to THREE materials.
   */
  getTexture(): Texture;
}
