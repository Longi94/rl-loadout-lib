import { Quality } from './quality';

/**
 * Base class for a Rocket League item.
 */
export class Item {
  /**
   * In-game item product ID.
   */
  id: number;
  /**
   * Path to the image icon of the item.
   */
  icon: string;
  /**
   * Name of the item.
   */
  name: string;
  /**
   * Quality of the item.
   */
  quality: Quality;
  /**
   * Whether is item normally can have painted attribute or not in the game.
   */
  paintable: boolean;

  constructor(id: number, icon: string, name: string, quality: Quality, paintable: boolean) {
    this.id = id;
    this.icon = icon;
    this.name = name;
    this.quality = quality;
    this.paintable = paintable;
  }
}
