import { DefaultWheelLoader, WheelLoader } from './wheel-loader';

const WHEEL_LOADER_MAPPING: { [id: number]: WheelLoader } = {};

export function getWheelLoader(id: number): WheelLoader {
  const loader = WHEEL_LOADER_MAPPING[id];
  if (loader != undefined) {
    return loader;
  }
  return DefaultWheelLoader;
}
