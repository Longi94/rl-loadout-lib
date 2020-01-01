import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene, SkinnedMesh } from 'three';
import { AbstractObject } from '../object';
import { Body } from '../../model/body';
import { ImageTextureLoader, PromiseLoader } from '../../utils/loader';
import { getAssetUrl } from '../../utils/network';
import { disposeIfExists } from '../../utils/util';
import { Paintable } from '../paintable';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { PaintConfig } from '../../model/paint-config';
import { AxleSettings, WheelSettings } from '../../model/axle-settings';
import { HitboxConfig } from '../../model/hitbox-config';
import { WheelConfig } from '../../model/wheel';
import { RocketConfig } from '../../model/rocket-config';
import { WheelsModel } from '../wheel/wheels-model';
import { TopperModel } from '../topper-model';
import { AntennaModel } from '../antenna-model';
import { MAX_WHEEL_YAW } from '../constants';
import { StaticDecalTexture } from '../../webgl/static-decal-texture';
import { ChassisTexture } from '../../webgl/chassis-texture';


/**
 * Class that handles loading the 3D model of the car body.
 */
export class BodyModel extends AbstractObject implements Paintable {

  private readonly body: Body;

  protected readonly imageTextureLoader: PromiseLoader;

  skeleton: Bone;
  bodyMaterial: MeshStandardMaterial;
  chassisMaterial: MeshStandardMaterial;

  bodySkin: BodyTexture;
  chassisSkin: ChassisTexture;

  private readonly chassisNUrl: string;

  hitboxConfig: HitboxConfig;
  wheelSettings: WheelSettings;
  wheelConfig: WheelConfig[];
  frontPivots: Bone[] = [];

  hatSocket: Object3D;
  antennaSocket: Object3D;

  wheelsModel: WheelsModel;
  topperModel: TopperModel;
  antennaModel: AntennaModel;

  /**
   * Create a body model object. You should **not** use this unless you know what you are doing. Use {@link createBodyModel} instead.
   * @param body car body to load the model of
   * @param decal car decal to load the textures of
   * @param paints paints to be applied to the body
   * @param rocketConfig configuration used for loading assets
   */
  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(body.model, rocketConfig), rocketConfig.gltfLoader);
    this.imageTextureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.chassisNUrl = getAssetUrl(body.chassis_n, rocketConfig);

    this.body = body;

    this.bodySkin = this.initBodySkin(body, decal, paints, rocketConfig);

    this.chassisSkin = new ChassisTexture(
      getAssetUrl(body.chassis_base, rocketConfig),
      getAssetUrl(body.chassis_n, rocketConfig),
      body.chassis_paintable,
      paints,
      rocketConfig
    );
  }

  protected initBodySkin(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig): BodyTexture {
    return new StaticDecalTexture(body, decal, paints, rocketConfig);
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.bodyMaterial);
    disposeIfExists(this.chassisMaterial);
    disposeIfExists(this.chassisSkin);
    disposeIfExists(this.bodySkin);
    this.wheelsModel = undefined;
  }

  /**
   * Load the body model and all textures needed for it.
   */
  async load() {
    const superTask = super.load();
    const bodySkinTask = this.bodySkin.load();
    const chassisNTask = this.imageTextureLoader.load(this.chassisNUrl);

    await this.chassisSkin.load();

    await superTask;
    await bodySkinTask;

    this.applyDecal();

    this.chassisMaterial.normalMap = await chassisNTask;
    this.chassisMaterial.map = this.chassisSkin.getTexture();
    this.chassisMaterial.needsUpdate = true;
  }

  protected handleModel(scene: Scene) {
    if ('hitbox' in scene.userData) {
      this.hitboxConfig = scene.userData.hitbox;
    }
    if ('wheelSettings' in scene.userData) {
      this.wheelSettings = {
        frontAxle: AxleSettings.fromObject(scene.userData.wheelSettings.frontAxle),
        backAxle: AxleSettings.fromObject(scene.userData.wheelSettings.backAxle)
      };
    }

    this.hatSocket = scene.getObjectByName('HatSocket');
    this.antennaSocket = scene.getObjectByName('AntennaSocket');

    scene.traverse(object => {
      if (object['isBone'] && this.skeleton == undefined) {
        this.skeleton = object as Bone;
      } else if (object['isMesh']) {
        const mat = (object as Mesh).material as MeshStandardMaterial;
        const matName = mat.name.toLowerCase();
        if (matName.includes('body')) {
          this.bodyMaterial = mat;
        } else if (matName.includes('chassis')) {
          this.chassisMaterial = mat;

          const mesh = object as SkinnedMesh;
          // @ts-ignore
          this.frontPivots.push(mesh.skeleton.getBoneByName('FL_Pivot_jnt'));
          // @ts-ignore
          this.frontPivots.push(mesh.skeleton.getBoneByName('FR_Pivot_jnt'));
        } else if (matName === 'window_material') {
          mat.envMapIntensity = 3.0;
          mat.needsUpdate = true;
        }
      }
    });

    this.getWheelPositions();
  }

  protected getWheelPositions() {
    this.wheelConfig = [];

    this.skeleton.traverse(object => {
      if (object.name.endsWith('Disc_jnt')) {
        const config = new WheelConfig();

        const wheelType = object.name.substr(0, 2).toLowerCase();

        config.front = wheelType[0] === 'f';
        config.right = wheelType[1] === 'r';
        config.joint = object as Bone;

        if (this.wheelSettings != undefined) {
          if (config.front) {
            config.offset = this.wheelSettings.frontAxle.wheelMeshOffsetSide;
            config.width = this.wheelSettings.frontAxle.wheelWidth;
            config.radius = this.wheelSettings.frontAxle.wheelMeshRadius;
          } else {
            config.offset = this.wheelSettings.backAxle.wheelMeshOffsetSide;
            config.width = this.wheelSettings.backAxle.wheelWidth;
            config.radius = this.wheelSettings.backAxle.wheelMeshRadius;
          }
        }

        this.wheelConfig.push(config);
      }
    });
  }

  /**
   * Add wheels to the body. This creates 4 copies of the wheel model and attaches them to the wheel joints. Replaces existing wheels.
   * @param wheelsModel the wheels
   */
  addWheelsModel(wheelsModel: WheelsModel) {
    this.clearWheelsModel();
    this.wheelsModel = wheelsModel;
    this.wheelsModel.applyWheelConfig(this.wheelConfig);
    this.wheelsModel.addToJoints();
  }

  /**
   * Remove the wheels from the body.
   */
  clearWheelsModel() {
    if (this.wheelsModel != undefined) {
      this.wheelsModel.removeFromJoints();
      this.wheelsModel = undefined;
    }
  }

  /**
   * Add a topper to the body and attach it to the topper socket. It replaces existing toppers.
   * @param topperModel the topper
   */
  addTopperModel(topperModel: TopperModel) {
    this.clearTopperModel();
    this.topperModel = topperModel;
    this.topperModel.applyAnchor(this.hatSocket);
    this.topperModel.addToScene(this.scene);
  }

  /**
   * Remove the topper from the body.
   */
  clearTopperModel() {
    if (this.topperModel != undefined) {
      this.topperModel.removeFromScene(this.scene);
      this.topperModel = undefined;
    }
  }

  /**
   * Add an antenna to the body and attach it to the antenna anchor. It replaces existing antennas.
   * @param antennaModel the antenna
   */
  addAntennaModel(antennaModel: AntennaModel) {
    this.clearAntennaModel();
    this.antennaModel = antennaModel;
    this.antennaModel.applyAnchor(this.antennaSocket);
    this.antennaModel.addToScene(this.scene);
  }

  /**
   * Remove the antenna from the body.
   */
  clearAntennaModel() {
    if (this.antennaModel != undefined) {
      this.antennaModel.removeFromScene(this.scene);
      this.antennaModel = undefined;
    }
  }

  /**
   * Set the paint color of this body.
   * @param color paint color
   */
  setPaintColor(color: Color) {
    this.chassisSkin.setPaint(color);
    this.bodySkin.setBodyPaint(color);
  }

  private applyDecal() {
    if (this.bodySkin != undefined) {
      this.bodyMaterial.map = this.bodySkin.getTexture();
    }
  }

  /**
   * Replace the current decal with a new one.
   * @param decal new decal
   * @param paints paint config needed for decal colors
   * @param rocketConfig rocket config needed for loading assets
   */
  async changeDecal(decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    this.bodySkin.dispose();
    this.bodySkin = new StaticDecalTexture(this.body, decal, paints, rocketConfig);
    await this.bodySkin.load();
    this.applyDecal();
  }

  /**
   * Set the primary color.
   * @param color THREE Color object
   */
  setPrimaryColor(color: Color) {
    this.bodySkin.setPrimary(color);
  }

  /**
   * Set the accent color.
   * @param color THREE Color object
   */
  setAccentColor(color: Color) {
    this.bodySkin.setAccent(color);
    this.chassisSkin.setAccent(color);
  }

  /**
   * Set the paint color of the decal.
   * @param color THREE Color object
   */
  setDecalPaintColor(color: Color) {
    this.bodySkin.setPaint(color);
  }

  /**
   * Set the yaw rotation (turn) of the front wheels.
   * @param angle yaw in radians
   * @param clamped if true, the angle will be clamped and the absolute value will not be higher than {@link MAX_WHEEL_YAW}
   */
  setFrontWheelYaw(angle: number, clamped: boolean = true) {
    if (clamped) {
      angle = Math.max(Math.min(angle, MAX_WHEEL_YAW), -MAX_WHEEL_YAW);
    }

    for (const pivot of this.frontPivots) {
      pivot.rotation.z = angle;
    }
  }
}
