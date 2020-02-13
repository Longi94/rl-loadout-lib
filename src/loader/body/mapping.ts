import { BodyLoader, DefaultBodyLoader } from './body-loader';
import { ProductID } from '../../utils/ids';
import { MapleLoader } from './maple-loader';
import { SlimeLoader } from './slime-loader';
import { RyeTier1Loader, RyeTier2Loader } from './rye-loader';
import { RonLoader } from './ron-loader';

const BODY_LOADER_MAPPING = {
  [ProductID.BODY_MAPLE]: MapleLoader,
  [ProductID.BODY_SLIME]: SlimeLoader,
  [ProductID.BODY_RYE_TIER1]: RyeTier1Loader,
  [ProductID.BODY_RYE_TIER2]: RyeTier2Loader,
  [ProductID.BODY_RON]: RonLoader,
};

export function getBodyLoader(id: number): BodyLoader {
  const loader = BODY_LOADER_MAPPING[id];
  if (loader != undefined) {
    return loader;
  }
  return DefaultBodyLoader;
}
