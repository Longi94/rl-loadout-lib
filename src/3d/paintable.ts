import { Color } from 'three';

/**
 * Interface for paintable objects.
 */
export interface Paintable {
  /**
   * Set paint color.
   * @param color THREE color object
   */
  setPaintColor(color: Color);
}

