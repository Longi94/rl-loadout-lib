import { WheelsModel } from './wheels-model';

const ANIM_INTERVAL = 1000;

/**
 * Animated model for the Spinner wheels.
 */
export class SpinnerModel extends WheelsModel {

  animate(t: number) {
    const dt = t % ANIM_INTERVAL;
    const angle = 2 * Math.PI * (dt / ANIM_INTERVAL);

    for (const wheel of this.wheels) {
      if (wheel.config.right) {
        wheel.spinnerJoint.rotation.y = this.roll - angle;
      } else {
        wheel.spinnerJoint.rotation.y = -this.roll + angle;
      }
    }
  }
}
