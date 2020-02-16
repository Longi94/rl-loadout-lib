import { WheelModelInternal, WheelsModel } from './wheels-model';

const ANIM_INTERVAL = 1000;

/**
 * Animated model for the Spinner wheels.
 */
export class SpinnerModel extends WheelsModel {

  animate(t: number, wheel: WheelModelInternal, roll: number) {
    const dt = t % ANIM_INTERVAL;
    const angle = 2 * Math.PI * (dt / ANIM_INTERVAL);

    if (wheel.config.right) {
      wheel.spinnerJoint.rotation.y = roll - angle;
    } else {
      wheel.spinnerJoint.rotation.y = -roll + angle;
    }
  }
}
