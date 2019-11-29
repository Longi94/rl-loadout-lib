import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene, SkinnedMesh } from 'three';
import { AbstractObject } from '../object';
import { Body } from '../../model/body';
import { ImageDataLoader, ImageTextureLoader, PromiseLoader } from '../../utils/loader';
import { getAssetUrl } from '../../utils/network';
import { disposeIfExists } from '../../utils/util';
import { Paintable } from '../paintable';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { PaintConfig } from '../../model/paint-config';
import { AxleSettings, WheelSettings } from '../../model/axle-settings';
import { HitboxConfig } from '../../model/hitbox-config';
import { ChassisSkin } from '../chassis-skin';
import { WheelConfig } from '../../model/wheel';
import { RocketConfig } from '../../model/rocket-config';
import { WheelsModel } from '../wheels-model';
import { TopperModel } from '../topper-model';
import { AntennaModel } from '../antenna-model';
import { MAX_WHEEL_YAW } from '../constants';
import { StaticDecalTextureWebGL } from '../../webgl/static-decal-texture-webgl';


export class BodyModel extends AbstractObject implements Paintable {

  private readonly body: Body;

  textureLoader: PromiseLoader;
  imageTextureLoader: PromiseLoader;

  skeleton: Bone;
  bodyMaterial: MeshStandardMaterial;
  chassisMaterial: MeshStandardMaterial;

  bodySkin: BodyTexture;
  chassisSkin: ChassisSkin;

  chassisNUrl: string;
  chassisBaseUrl: string;

  hitboxConfig: HitboxConfig;
  wheelSettings: WheelSettings;
  wheelConfig: WheelConfig[];
  frontPivots: Bone[] = [];

  hatSocket: Object3D;
  antennaSocket: Object3D;

  wheelsModel: WheelsModel;
  topperModel: TopperModel;
  antennaModel: AntennaModel;

  constructor(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(body.model, rocketConfig), rocketConfig.gltfLoader);
    this.textureLoader = new PromiseLoader(new ImageDataLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.imageTextureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.chassisNUrl = getAssetUrl(body.chassis_n, rocketConfig);
    this.chassisBaseUrl = getAssetUrl(body.chassis_base, rocketConfig);

    this.body = body;

    this.bodySkin = this.initBodySkin(body, decal, paints, rocketConfig);

    if (body.chassis_paintable) {
      this.chassisSkin = new ChassisSkin(
        getAssetUrl(body.chassis_base, rocketConfig),
        getAssetUrl(body.chassis_n, rocketConfig),
        paints,
        rocketConfig
      );
    }
  }

  initBodySkin(body: Body, decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig): BodyTexture {
    return new StaticDecalTextureWebGL(body, decal, paints, rocketConfig);
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.bodyMaterial);
    disposeIfExists(this.chassisMaterial);
    disposeIfExists(this.chassisSkin);
    disposeIfExists(this.bodySkin);
    this.wheelsModel = undefined;
  }

  async load() {
    const superTask = super.load();
    const bodySkinTask = this.bodySkin.load();
    const chassisNTask = this.imageTextureLoader.load(this.chassisNUrl);
    const chassisBaseTask = this.imageTextureLoader.load(this.chassisBaseUrl);

    if (this.chassisSkin != undefined) {
      await this.chassisSkin.load();
    }

    await superTask;
    await bodySkinTask;

    this.applyDecal();

    if (this.chassisSkin) {
      this.chassisMaterial.map = this.chassisSkin.texture.texture;
      this.chassisMaterial.needsUpdate = true;
    } else {
      this.chassisMaterial.normalMap = await chassisNTask;
      this.chassisMaterial.map = await chassisBaseTask;
      this.chassisMaterial.needsUpdate = true;
    }
  }

  handleModel(scene: Scene) {
    if ('hitbox' in scene.userData) {
      this.hitboxConfig = scene.userData.hitbox;
    }
    if ('wheelSettings' in scene.userData) {
      this.wheelSettings = {
        frontAxle: AxleSettings.fromObject(scene.userData.wheelSettings.frontAxle),
        backAxle: AxleSettings.fromObject(scene.userData.wheelSettings.backAxle),
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

  addWheelsModel(wheelsModel: WheelsModel) {
    this.wheelsModel = wheelsModel;
    this.wheelsModel.applyWheelConfig(this.wheelConfig);
    this.wheelsModel.addToJoints();
  }

  clearWheelsModel() {
    if (this.wheelsModel != undefined) {
      this.wheelsModel.removeFromJoints();
      this.wheelsModel = undefined;
    }
  }

  addTopperModel(topperModel: TopperModel) {
    this.topperModel = topperModel;
    this.topperModel.applyAnchor(this.hatSocket);
    this.topperModel.addToScene(this.scene);
  }

  clearTopperModel() {
    if (this.topperModel != undefined) {
      this.topperModel.removeFromScene(this.scene);
      this.topperModel = undefined;
    }
  }

  addAntennaModel(antennaModel: AntennaModel) {
    this.antennaModel = antennaModel;
    this.antennaModel.applyAnchor(this.antennaSocket);
    this.antennaModel.addToScene(this.scene);
  }

  clearAntennaModel() {
    if (this.antennaModel != undefined) {
      this.antennaModel.removeFromScene(this.scene);
      this.antennaModel = undefined;
    }
  }

  /**
   * Set the paint color of this body. This only applies to the chassis, the paint of the body is set by the skin.
   *
   * @param color paint color
   */
  setPaintColor(color: Color) {
    if (this.chassisSkin != undefined) {
      this.chassisSkin.setPaint(color);
    }
    this.bodySkin.setBodyPaint(color);
  }

  private applyDecal() {
    if (this.bodySkin != undefined) {
      this.bodyMaterial.map = this.bodySkin.getTexture();
    }
  }

  async changeDecal(decal: Decal, paints: PaintConfig, rocketConfig: RocketConfig) {
    this.bodySkin.dispose();
    this.bodySkin = new StaticDecalTextureWebGL(this.body, decal, paints, rocketConfig);
    await this.bodySkin.load();
    this.applyDecal();
  }

  setPrimaryColor(color: Color) {
    this.bodySkin.setPrimary(color);
  }

  setAccentColor(color: Color) {
    this.bodySkin.setAccent(color);
    if (this.chassisSkin != undefined) {
      this.chassisSkin.setAccent(color);
    }
  }

  setDecalPaintColor(color: Color) {
    this.bodySkin.setPaint(color);
  }

  setFrontWheelYaw(angle: number, clamped: boolean = true) {
    if (clamped) {
      angle = Math.max(Math.min(angle, MAX_WHEEL_YAW), -MAX_WHEEL_YAW);
    }

    for (const pivot of this.frontPivots) {
      pivot.rotation.z = angle;
    }
  }
}
