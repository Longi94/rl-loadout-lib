/**
 * Convenience function to call dispose() on an object if it's not undefined or null.
 * @param object nullable object that must have a dispose method
 */
import { LinearEncoding, RepeatWrapping, Texture } from 'three';

export function disposeIfExists(object: any) {
  if (object != undefined && object.dispose != undefined) {
    object.dispose();
  }
}

export const StringUtil = {
  nullOrEmpty: (s: string) => s == undefined || s === ''
};

export function htmlImageToTexture(image: HTMLImageElement) {
  if (image == undefined) {
    return undefined;
  }
  const t = new Texture(image);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.encoding = LinearEncoding;
  t.flipY = false;
  t.needsUpdate = true;
  return t;
}
