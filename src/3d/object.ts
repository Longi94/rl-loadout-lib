import { LinearEncoding, Mesh, MeshStandardMaterial, Object3D, Scene, Texture } from 'three';
import { ObjectAssets } from '../loader/object-assets';
import { SkeletonUtils } from '../utils/three/skeleton';

/**
 * Abstract 3D model object, that loads gltf models.
 */
export abstract class AbstractObject {

  /**
   * THREE scene that contains this object.
   */
  scene: Scene;

  protected constructor(assets?: ObjectAssets) {
    if (assets != undefined) {
      this.validate(assets.gltf);
      this.handleScene(assets.gltf.scene);
    }
  }

  protected handleScene(scene: Scene) {
    this.scene = scene;
    traverseMaterials(this.scene, material => {
      if (material.map) {
        material.map.encoding = LinearEncoding;
      }
      if (material.emissiveMap) {
        material.emissiveMap.encoding = LinearEncoding;
      }
      if (material.map || material.emissiveMap) {
        material.needsUpdate = true;
      }
    });
    scene.updateMatrixWorld(true);
    this.handleModel(scene);
  }

  private validate(gltf) {
    if (!('KHR_draco_mesh_compression' in gltf.parser.extensions)) {
      console.warn(`Model not DRACO compressed.`);
    }
  }

  protected abstract handleModel(scene: Scene);

  /**
   * Add the model to a scene.
   * @param scene THREE scene
   */
  addToScene(scene: Scene) {
    scene.add(this.scene);
  }

  /**
   * Remove the model from a scene.
   * @param scene THREE scene
   */
  removeFromScene(scene: Scene) {
    scene.remove(this.scene);
  }

  /**
   * Set the environment map to all objects in this scene
   * @param envMap environment map texture
   */
  setEnvMap(envMap: Texture) {
    this.scene.traverse(object => {
      if (object['isMesh']) {
        const mat = (object as Mesh).material as MeshStandardMaterial;
        mat.envMap = envMap;
        mat.needsUpdate = true;
      }
    });
  }

  /**
   * Set the position and rotation of the anchor to this object.
   * @param anchor the anchor object
   */
  applyAnchor(anchor: Object3D) {
    if (anchor == undefined) {
      return;
    }

    this.scene.position.copy(anchor.position);
    this.scene.rotation.copy(anchor.rotation);
  }

  /**
   * Dispose of the object.
   */
  dispose() {
    this.scene.dispose();
  }

  /**
   * Set the visibility of the object.
   * @param visible visibility of the object
   */
  visible(visible: boolean) {
    this.scene.visible = visible;
  }

  protected copy(other: AbstractObject) {
    const scene = SkeletonUtils.clone(other.scene);
    this.handleScene(scene);
  }

  /**
   * Make a deep copy of the object;
   */
  abstract clone();
}

/**
 * Executes the callback on this object's material and all descendants' materials.
 * @param object Object3D object to traverse through
 * @param callback this will be called on all the materials
 */
export function traverseMaterials(object, callback: (mat) => void) {
  object.traverse((node) => {
    if (!node.isMesh) {
      return;
    }
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(callback);
  });
}
