import { RocketLoadoutService } from '../service/rl-service';
import { BodyModel } from '../3d/body/body-model';
import { Decal } from '../model/decal';
import { PaintConfig } from '../model/paint-config';
import { WheelsModel } from '../3d/wheel/wheels-model';
import { RocketConfig } from '../model/rocket-config';
import { Body } from '../model/body';
import { Wheel } from '../model/wheel';
import { createBodyModel } from '../3d/body/factory';
import { createWheelsModel } from '../3d/wheel/factory';

/**
 * Helper class to load items by their in game item ID.
 */
export class RocketAssetManager {
  private readonly rlService: RocketLoadoutService;

  constructor(public readonly config: RocketConfig) {
    this.rlService = new RocketLoadoutService(config.backendHost);
  }

  /**
   * Completely load a car body model. This calls {@link BodyModel.load} on the body model, do **not** call it again.
   * @param id in-game product id of the body
   * @param paintConfig color configuration
   * @param fallback if the body does not exist in the backend, fallback to this body, e.g.: {@link Body.DEFAULT}
   * @param decalId in-game product id of the decal, no decal is applied if undefined
   * @throws Error the body could not be found and there is no fallback
   * @returns the loaded body model
   */
  async loadBody(id: number, paintConfig: PaintConfig, fallback?: Body, decalId?: number): Promise<BodyModel> {
    let body: Body;
    let decal = Decal.NONE;

    if (decalId != undefined && decalId > 1) {
      try {
        decal = await this.rlService.getDecal(decalId);
      } catch (e) {
      }
    }

    try {
      body = await this.rlService.getBody(id);
    } catch (e) {
      body = fallback;
    }

    if (body == undefined) {
      throw new Error('body is undefined');
    }

    const bodyModel = createBodyModel(body, decal, paintConfig, this.config);
    await bodyModel.load();

    return bodyModel;
  }

  /**
   * Completely load a car wheel model. This calls {@link WheelsModel.load} on the wheel model, do **not** call it again.
   * @param id in-game product id of the wheels
   * @param paintConfig color configuration
   * @param fallback if the wheel does not exist in the backend, fallback to this wheel, e.g.: {@link Wheel.DEFAULT}
   * @returns the loaded wheels model
   */
  async loadWheel(id: number, paintConfig: PaintConfig, fallback?: Wheel): Promise<WheelsModel> {
    let wheel: Wheel;

    try {
      wheel = await this.rlService.getWheel(id);
    } catch (e) {
      wheel = fallback;
    }

    if (wheel == undefined) {
      throw new Error('wheel is undefined');
    }

    const wheelsModel = createWheelsModel(wheel, paintConfig, this.config);
    await wheelsModel.load();

    return wheelsModel;
  }
}
