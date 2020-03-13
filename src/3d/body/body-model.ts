import { Bone, Color, Mesh, MeshStandardMaterial, Object3D, Scene, SkinnedMesh, Vector3 } from 'three';
import { AbstractObject } from '../object';
import { Body } from '../../model/body';
import { disposeIfExists, htmlImageToTexture } from '../../utils/util';
import { Paintable } from '../paintable';
import { Decal } from '../../model/decal';
import { BodyTexture } from './body-texture';
import { PaintConfig } from '../../model/paint-config';
import { AxleSettings, WheelSettings } from '../../model/axle-settings';
import { HitboxConfig } from '../../model/hitbox-config';
import { WheelConfig } from '../../model/wheel';
import { WheelModelInternal, WheelsModel } from '../wheel/wheels-model';
import { TopperModel } from '../topper-model';
import { AntennaModel } from '../antenna-model';
import { BASE_WHEEL_MESH_RADIUS, BASE_WHEEL_MESH_WIDTH, MAX_WHEEL_YAW } from '../constants';
import { StaticDecalTexture } from '../../webgl/static-decal-texture';
import { BodyAssets } from '../../loader/body/body-assets';
import { DecalAssets } from '../../loader/decal/decal-assets';
import { SkeletonUtils } from '../../utils/three/skeleton';
import { ChassisMaterial } from '../../webgl/chassis-material';
import { StaticDecalMaterial } from '../../webgl/static-decal-material';

/**
 * Class that handles loading the 3D model of the car body.
 */
export class BodyModel extends AbstractObject implements Paintable {

  skeleton: Bone;
  bodyMaterial: StaticDecalMaterial;
  chassisMaterial: ChassisMaterial;

  hitboxConfig: HitboxConfig;
  wheelSettings: WheelSettings;
  wheelConfig: WheelConfig[];
  wheels: WheelModelInternal[];
  frontPivots: Bone[];

  hatSocket: Object3D;
  antennaSocket: Object3D;

  wheelsModel: WheelsModel;
  topperModel: TopperModel;
  antennaModel: AntennaModel;

  wheelRoll = 0;

  /**
   * Create a body model object. You should **not** use this unless you know what you are doing. Use {@link createBodyModel} instead.
   * @param body car body to load the model of
   * @param decal car decal to load the textures of
   * @param bodyAssets body assets
   * @param decalAssets decal assets
   * @param paints paints to be applied to the body
   * @param keepContextAlive if true, the webgl contexts for textures are kept alive for fast color updates
   */
  constructor(private readonly body?: Body, decal?: Decal, protected bodyAssets?: BodyAssets, decalAssets?: DecalAssets,
              paints?: PaintConfig, protected keepContextAlive = false) {
    super(bodyAssets);
    this.applyAssets(paints, decalAssets);
  }

  protected applyAssets(paints: PaintConfig, decalAssets: DecalAssets) {
    this.chassisMaterial.baseMap = htmlImageToTexture(this.bodyAssets.chassisD);
    this.chassisMaterial.normalMap = htmlImageToTexture(this.bodyAssets.chassisN);
    this.chassisMaterial.accentColor = paints.accent;
    this.chassisMaterial.paintColor = paints.body;
    this.chassisMaterial.needsUpdate = true;
    //this.applyDecalAssets(paints, decalAssets);
  }

  protected applyDecalAssets(paints: PaintConfig, decalAssets: DecalAssets) {
    if (decalAssets.baseTexture) {
      this.bodyMaterial.baseMap = htmlImageToTexture(decalAssets.baseTexture);
    } else {
      this.bodyMaterial.baseMap = htmlImageToTexture(this.bodyAssets.baseSkin);
    }
    this.bodyMaterial.rgbaMap = htmlImageToTexture(this.bodyAssets.blankSkin);
    this.bodyMaterial.decalMap = htmlImageToTexture(decalAssets.rgbaMap);
    this.bodyMaterial.needsUpdate = true;
  }

  protected initBodySkin(bodyAssets: BodyAssets, decalAssets: DecalAssets, paints: PaintConfig): BodyTexture {
    if (decalAssets.baseTexture != undefined) {
      return new StaticDecalTexture(decalAssets.baseTexture, decalAssets.rgbaMap, bodyAssets.blankSkin, paints, this.keepContextAlive);
    } else {
      return new StaticDecalTexture(bodyAssets.baseSkin, decalAssets.rgbaMap, bodyAssets.blankSkin, paints, this.keepContextAlive);
    }
  }

  dispose() {
    super.dispose();
    disposeIfExists(this.bodyMaterial);
    disposeIfExists(this.chassisMaterial);
    this.wheelsModel = undefined;
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

    if (this.frontPivots == undefined) {
      this.frontPivots = [];
    }

    scene.traverse(object => {
      if (object['isBone'] && this.skeleton == undefined) {
        this.skeleton = object as Bone;
      } else if (object['isMesh']) {
        const mat = (object as Mesh).material as MeshStandardMaterial;
        const matName = mat.name.toLowerCase();
        if (matName.includes('body')) {
          this.bodyMaterial = new StaticDecalMaterial();
          //(object as SkinnedMesh).material = this.bodyMaterial;
        } else if (matName.includes('chassis')) {
          const mesh = object as SkinnedMesh;
          this.chassisMaterial = new ChassisMaterial();
          mesh.material = this.chassisMaterial;
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
    this.applyWheelConfig();

    for (const wheel of this.wheels) {
      wheel.config.joint.add(wheel.model);
    }
  }

  private applyWheelConfig() {
    if (this.wheelConfig == undefined) {
      return;
    }
    const config = this.wheelConfig;
    this.wheels = [];
    for (const conf of config) {
      const widthScale = conf.width / BASE_WHEEL_MESH_WIDTH;
      const radiusScale = conf.radius / BASE_WHEEL_MESH_RADIUS;
      const offset = conf.offset;

      const wheel = SkeletonUtils.clone(this.wheelsModel.scene) as Object3D;
      const position = new Vector3();
      position.copy(conf.position);

      if (!conf.right) {
        wheel.rotation.set(-Math.PI / 2, 0, Math.PI);
        position.add(new Vector3(0, offset, 0));
      } else {
        wheel.rotation.set(Math.PI / 2, 0, 0);
        position.add(new Vector3(0, -offset, 0));
      }

      wheel.scale.set(radiusScale, radiusScale, widthScale);
      wheel.position.copy(position);

      let spinnerJoint: Bone;
      wheel.traverse(object => {
        if (object['isBone']) {
          if (object.name === 'spinner_jnt') {
            spinnerJoint = object as Bone;
          }
        }
      });

      this.wheels.push({
        model: wheel,
        config: conf,
        spinnerJoint
      });
    }
  }

  /**
   * Remove the wheels from the body.
   */
  clearWheelsModel() {
    for (const conf of this.wheelConfig) {
      for (let i = conf.joint.children.length - 1; i >= 0; i--) {
        conf.joint.remove(conf.joint.children[i]);
      }
    }
    this.wheels = [];
    this.wheelsModel = undefined;
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
    this.bodyMaterial.bodyPaintColor = color;
    this.bodyMaterial.needsUpdate = true;
    this.chassisMaterial.paintColor = color;
    this.chassisMaterial.needsUpdate = true;
  }

  /**
   * Replace the current decal with a new one.
   * @param decalAssets decal assets
   * @param paints paint config needed for decal colors
   */
  changeDecal(decalAssets: DecalAssets, paints: PaintConfig) {
    this.applyDecalAssets(paints, decalAssets);
  }

  /**
   * Set the primary color.
   * @param color THREE Color object
   */
  setPrimaryColor(color: Color) {
    this.bodyMaterial.primaryColor = color;
    this.bodyMaterial.needsUpdate = true;
  }

  /**
   * Set the accent color.
   * @param color THREE Color object
   */
  setAccentColor(color: Color) {
    this.bodyMaterial.accentColor = color;
    this.bodyMaterial.needsUpdate = true;
  }

  /**
   * Set the paint color of the decal.
   * @param color THREE Color object
   */
  setDecalPaintColor(color: Color) {
    this.bodyMaterial.paintColor = color;
    this.bodyMaterial.needsUpdate = true;
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

  /**
   * Set roll rotation of the wheels.
   * @param angle roll angle in radians
   */
  setWheelRoll(angle: number) {
    this.wheelRoll = angle;
    for (const wheel of this.wheels) {
      if (wheel.config.right) {
        wheel.model.rotation.z = -angle;
      } else {
        wheel.model.rotation.z = Math.PI + angle;
      }

      if (wheel.spinnerJoint != undefined) {
        if (wheel.config.right) {
          wheel.spinnerJoint.rotation.y = angle;
        } else {
          wheel.spinnerJoint.rotation.y = -angle;
        }
      }
    }
  }

  animate(time: number) {
    if (this.wheels != undefined) {
      for (const wheel of this.wheels) {
        this.wheelsModel?.animate(time, wheel, this.wheelRoll);
      }
    }
  }

  protected copy(other: BodyModel) {
    super.copy(other);
    this.clearWheelsModel();
    this.bodyAssets = other.bodyAssets;
    if (other.wheelsModel != undefined) {
      this.addWheelsModel(other.wheelsModel.clone());
    }
  }

  clone(): BodyModel {
    const m = new BodyModel();
    m.keepContextAlive = false;
    m.copy(this);
    return m;
  }
}
