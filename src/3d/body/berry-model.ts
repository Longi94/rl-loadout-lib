import { BodyModel } from './body-model';
import { Color } from 'three';
import { PaintConfig } from '../../model/paint-config';
import { WheelConfig } from '../../model/wheel';
import { DecalAssets } from '../../loader/decal/decal-assets';


/**
 * Class for the 3D model of The Dark Knight Rises Tumbler. Needed because of the double back wheels and custom coloring.
 */
export class BerryModel extends BodyModel {

  setPaintColor(color: Color) {
  }

  changeDecal(decalAssets: DecalAssets, paints: PaintConfig) {
  }

  setAccentColor(color: Color) {
  }

  setDecalPaintColor(color: Color) {
  }

  protected getWheelPositions() {
    super.getWheelPositions();

    const confToAdd: WheelConfig[] = [];

    for (const config of this.wheelConfig) {
      if (!config.front) {
        const newConfig = config.clone();

        if (newConfig.right) {
          newConfig.position.setY(newConfig.position.y - newConfig.width);
        } else {
          newConfig.position.setY(newConfig.position.y + newConfig.width);
        }

        confToAdd.push(newConfig);
      }
    }

    this.wheelConfig = this.wheelConfig.concat(confToAdd);
  }
}
