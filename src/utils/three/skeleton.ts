/**
 * Utility functions for Skeleton, SkinnedMesh, and Bone manipulation.
 * @see https://github.com/mrdoob/three.js/blob/dev/examples/jsm/utils/SkeletonUtils.js
 */
export const SkeletonUtils = {

  /**
   * Clones the given object and its descendants, ensuring that any SkinnedMesh instances are correctly associated with their bones. Bones
   * are also cloned, and must be descendants of the object passed to this method. Other data, like geometries and materials, are reused by
   * reference.
   * @param source the object that will be cloned
   */
  clone: source => {

    const sourceLookup = new Map();
    const cloneLookup = new Map();

    const clone = source.clone();

    parallelTraverse(source, clone, (sourceNode, clonedNode) => {

      sourceLookup.set(clonedNode, sourceNode);
      cloneLookup.set(sourceNode, clonedNode);

    });

    clone.traverse(node => {

      if (!node.isSkinnedMesh) {
        return;
      }

      const clonedMesh = node;
      const sourceMesh = sourceLookup.get(node);
      const sourceBones = sourceMesh.skeleton.bones;

      clonedMesh.skeleton = sourceMesh.skeleton.clone();
      clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

      clonedMesh.skeleton.bones = sourceBones.map(bone => cloneLookup.get(bone));

      clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);

    });

    return clone;

  }

};


function parallelTraverse(a, b, callback) {

  callback(a, b);

  for (let i = 0; i < a.children.length; i++) {

    parallelTraverse(a.children[i], b.children[i], callback);

  }

}
