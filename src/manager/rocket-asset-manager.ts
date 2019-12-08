import { RocketLoadoutService } from '../service/rl-service';
import { BodyModel } from '../3d/body/body-model';
import { Decal } from '../model/decal';
import { PaintConfig } from '../model/paint-config';
import { WheelsModel } from '../3d/wheels-model';
import { RocketConfig } from '../model/rocket-config';
import { Body } from '../model/body';
import { Wheel } from '../model/wheel';

export class RocketAssetManager {
  private readonly rlService: RocketLoadoutService;

  constructor(public readonly config: RocketConfig) {
    this.rlService = new RocketLoadoutService(config.backendHost);
  }

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

    const bodyModel = new BodyModel(body, decal, paintConfig, this.config);
    await bodyModel.load();

    return bodyModel;
  }

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

    const wheelsModel = new WheelsModel(wheel, paintConfig, this.config);
    await wheelsModel.load();

    return wheelsModel;
  }
}
