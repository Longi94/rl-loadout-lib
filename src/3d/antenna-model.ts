import { Antenna } from '../model/antenna';
import { AbstractObject } from './object';
import { getAssetUrl } from '../utils/network';
import { Mesh, MeshStandardMaterial, Object3D, Scene } from 'three';
import { ImageTextureLoader, PromiseLoader } from '../utils/loader';
import { PaintConfig } from '../model/paint-config';
import { RocketConfig } from '../model/rocket-config';

/**
 * Class that handles loading the 3D model of the car antenna.
 */
export class AntennaModel extends AbstractObject {

  private readonly antennaLoader: PromiseLoader;
  private readonly textureLoader: PromiseLoader;

  private readonly antennaUrl: string;
  private readonly baseTextureUrl: string;
  private readonly normalMap: string;

  socket: Object3D;

  /**
   * Create an antenna object.
   * @param antenna the antenna
   * @param paints the paint config to apply the antenna paint
   * @param rocketConfig configuration used for loading assets
   */
  constructor(antenna: Antenna, paints: PaintConfig, rocketConfig: RocketConfig) {
    super(getAssetUrl(antenna.stick, rocketConfig), rocketConfig.gltfLoader);
    this.antennaLoader = new PromiseLoader(rocketConfig.gltfLoader);
    this.textureLoader = new PromiseLoader(new ImageTextureLoader(rocketConfig.textureFormat, rocketConfig.loadingManager));
    this.antennaUrl = getAssetUrl(antenna.model, rocketConfig);
    this.baseTextureUrl = getAssetUrl(antenna.base_texture, rocketConfig);
    this.normalMap = getAssetUrl(antenna.normal_map, rocketConfig);
  }

  async load() {
    const antennaTask = this.antennaLoader.load(this.antennaUrl);
    const baseTextureTask = this.textureLoader.load(this.baseTextureUrl);
    const normalMapTask = this.textureLoader.load(this.normalMap);

    await super.load();
    const gltf = await antennaTask;

    const antennaScene: Scene = gltf.scene;
    const antenna: Mesh = antennaScene.children[0] as Mesh;
    const material: MeshStandardMaterial = antenna.material as MeshStandardMaterial;

    material.map = await baseTextureTask;
    material.normalMap = await normalMapTask;

    if (this.socket) {
      antenna.position.copy(this.socket.position);
      antenna.rotation.copy(this.socket.rotation);
    }

    this.scene.add(antenna);
    antennaScene.dispose();
  }

  handleModel(scene: Scene) {
    this.socket = scene.getObjectByName('TopperSocket');
  }
}
