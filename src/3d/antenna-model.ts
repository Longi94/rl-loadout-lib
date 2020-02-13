import { Antenna } from '../model/antenna';
import { AbstractObject } from './object';
import { Mesh, MeshStandardMaterial, Object3D, Scene, Texture } from 'three';
import { PaintConfig } from '../model/paint-config';
import { AntennaAssets } from '../loader/antenna/antenna-assets';
import { htmlImageToTexture } from '../utils/util';

/**
 * Class that handles loading the 3D model of the car antenna.
 */
export class AntennaModel extends AbstractObject {

  socket: Object3D;

  /**
   * Create an antenna object.
   * @param antenna the antenna
   * @param antennaAssets antenna assets
   * @param paints the paint config to apply the antenna paint
   */
  constructor(antenna?: Antenna, protected antennaAssets?: AntennaAssets, paints?: PaintConfig) {
    super(antennaAssets);

  }

  init() {
    const antennaScene: Scene = this.antennaAssets.gltf.scene;
    const antennaModel: Mesh = antennaScene.children[0] as Mesh;
    const material: MeshStandardMaterial = antennaModel.material as MeshStandardMaterial;

    material.map = htmlImageToTexture(this.antennaAssets.baseTexture);
    material.normalMap = htmlImageToTexture(this.antennaAssets.normalMap);

    if (this.socket) {
      antennaModel.position.copy(this.socket.position);
      antennaModel.rotation.copy(this.socket.rotation);
    }

    this.scene.add(antennaModel);
    antennaScene.dispose();
  }

  handleModel(scene: Scene) {
    this.socket = scene.getObjectByName('TopperSocket');
  }

  protected copy(other: AntennaModel) {
    super.copy(other);
    this.antennaAssets = other.antennaAssets;
    this.init();
  }

  clone(): AntennaModel {
    const m = new AntennaModel();
    m.copy(this);
    return m;
  }
}
