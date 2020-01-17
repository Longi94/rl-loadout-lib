/**
 * Convenience function to call dispose() on an object if it's not undefined or null.
 * @param object nullable object that must have a dispose method
 */
export function disposeIfExists(object: any) {
  if (object != undefined && object.dispose != undefined) {
    object.dispose();
  }
}

export const StringUtil = {
  nullOrEmpty: (s: string) => s == undefined || s === ''
};
