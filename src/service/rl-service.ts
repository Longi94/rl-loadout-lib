import { Body } from '../model/body';
import { doRequest } from '../utils/network';
import { Wheel } from '../model/wheel';
import { Decal } from '../model/decal';

const HOST_PROD = 'https://rocket-loadout.com';
const PATH_V1 = '/api/v1';

/**
 * Service for interacting with the rocket loadout backend.
 */
export class RocketLoadoutService {

  private readonly baseUrl: string;

  constructor(host?: string) {
    if (host == undefined) {
      host = HOST_PROD;
    }
    this.baseUrl = `${host}${PATH_V1}`;
  }

  /**
   * GET the body at <host>/bodies/<id>.
   * @param id in-game body id
   */
  getBody(id: number): Promise<Body> {
    return doRequest<Body>(`${this.baseUrl}/bodies/${id}`);
  }

  /**
   * GET the wheel at <host>/wheels/<id>.
   * @param id in-game wheel id
   */
  getWheel(id: number): Promise<Wheel> {
    return doRequest<Wheel>(`${this.baseUrl}/wheels/${id}`);
  }

  /**
   * GET the decal at <host>/decals/<id>.
   * @param id in-game decal id
   */
  getDecal(id: number): Promise<Decal> {
    return doRequest<Wheel>(`${this.baseUrl}/decals/${id}`);
  }
}
