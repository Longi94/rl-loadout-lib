import { Color } from "three";

class BMHeader {
  version: number;
  codeSize: number;
  crc: number;
}

export class BMItem {
  slotIndex: number;
  productId: number;
  paintIndex?: number;
}

class BMOverrideColor {
  shouldOverride = false;
  primaryColors?: Color;
  secondaryColors?: Color;
}

export declare type BMItems = Map<number, BMItem>;

class BMBody {
  blueIsOrange = true;
  blueLoadout: BMItems = new Map<number, BMItem>();
  blueColor = new BMOverrideColor();
  orangeLoadout?: BMItems = new Map<number, BMItem>();
  orangeColor? = new BMOverrideColor();
}

export class BMLoadout {
  header? = new BMHeader();
  body = new BMBody();
}
