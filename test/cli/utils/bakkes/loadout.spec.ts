import { expect } from 'chai';
import 'mocha';
import {
  decodeLoadout,
  encodeLoadout,
  SLOT_ANTENNA,
  SLOT_BODY,
  SLOT_BOOST,
  SLOT_ENGINE_AUDIO,
  SLOT_GOALEXPLOSION,
  SLOT_HAT,
  SLOT_PAINTFINISH,
  SLOT_PAINTFINISH_SECONDARY,
  SLOT_SKIN,
  SLOT_SUPERSONIC_TRAIL,
  SLOT_WHEELS
} from '../../../../src/utils/bakkes';
import * as btoa from 'btoa';
import * as atob from 'atob';
import { BMItem, BMLoadout } from '../../../../src/utils/bakkes/model';
import {
  PAINT_BLACK,
  PAINT_BURNT_SIENNA,
  PAINT_COBALT,
  PAINT_CRIMSON,
  PAINT_FOREST_GREEN,
  PAINT_LIME,
  PAINT_NONE,
  PAINT_ORANGE,
  PAINT_PINK,
  PAINT_PURPLE,
  PAINT_SAFFRON,
  PAINT_SKY_BLUE,
  PAINT_TITANIUM_WHITE
} from '../../../../src/utils/color';

describe('Bakkes loadout', () => {
  before(() => {
    // @ts-ignore
    global.btoa = btoa;
    // @ts-ignore
    global.atob = atob;
  });

  it('should decode default loadout code', () => {
    const loadout = decodeLoadout('ggL/AlwAAlwAAA==');

    expect(loadout.header.version).to.equal(2);
    expect(loadout.header.codeSize).to.equal(10);

    expect(loadout.body.blueIsOrange).to.be.false;

    expect(loadout.body.blueLoadout.size).to.equal(1);
    expect(loadout.body.blueLoadout.get(SLOT_BODY).slotIndex).to.equal(SLOT_BODY);
    expect(loadout.body.blueLoadout.get(SLOT_BODY).productId).to.equal(23);
    expect(loadout.body.blueLoadout.get(SLOT_BODY).paintIndex).to.be.undefined;

    expect(loadout.body.orangeLoadout.size).to.equal(1);
    expect(loadout.body.orangeLoadout.get(SLOT_BODY).slotIndex).to.equal(SLOT_BODY);
    expect(loadout.body.orangeLoadout.get(SLOT_BODY).productId).to.equal(23);
    expect(loadout.body.orangeLoadout.get(SLOT_BODY).paintIndex).to.be.undefined;

    expect(loadout.body.blueColor.shouldOverride).to.be.false;
    expect(loadout.body.blueColor.primaryColors).to.be.undefined;
    expect(loadout.body.blueColor.secondaryColors).to.be.undefined;

    expect(loadout.body.orangeColor.shouldOverride).to.be.false;
    expect(loadout.body.orangeColor.primaryColors).to.be.undefined;
    expect(loadout.body.orangeColor.secondaryColors).to.be.undefined;
  });

  it('should encode default loadout', () => {
    const loadout = new BMLoadout();

    const defaultItem: BMItem = {
      slotIndex: SLOT_BODY,
      productId: 23
    };

    loadout.body.blueIsOrange = false;
    loadout.body.blueLoadout.set(SLOT_BODY, defaultItem);
    loadout.body.orangeLoadout.set(SLOT_BODY, defaultItem);

    const result = encodeLoadout(loadout);

    expect(result).to.equal('ggL/AlwAAlwAAA==');
  });

  it('should decode complex loadout code', () => {
    const loadout = decodeLoadout('ggpXF0yGRThlByH5HsPTRMj9iZTzODmrBjuJGl/jMFniFbfNfwAAAAAA');

    expect(loadout.header.version).to.equal(2);
    expect(loadout.header.codeSize).to.equal(42);

    expect(loadout.body.blueIsOrange).to.be.true;

    const blueLoadout = loadout.body.blueLoadout;
    expect(blueLoadout.get(SLOT_BODY).slotIndex).to.equal(SLOT_BODY);
    expect(blueLoadout.get(SLOT_BODY).productId).to.equal(403);
    expect(blueLoadout.get(SLOT_BODY).paintIndex).to.equal(PAINT_COBALT);

    expect(blueLoadout.get(SLOT_SKIN).slotIndex).to.equal(SLOT_SKIN);
    expect(blueLoadout.get(SLOT_SKIN).productId).to.equal(3239);
    expect(blueLoadout.get(SLOT_SKIN).paintIndex).to.equal(PAINT_BLACK);

    expect(blueLoadout.get(SLOT_WHEELS).slotIndex).to.equal(SLOT_WHEELS);
    expect(blueLoadout.get(SLOT_WHEELS).productId).to.equal(3986);
    expect(blueLoadout.get(SLOT_WHEELS).paintIndex).to.equal(PAINT_FOREST_GREEN);

    expect(blueLoadout.get(SLOT_BOOST).slotIndex).to.equal(SLOT_BOOST);
    expect(blueLoadout.get(SLOT_BOOST).productId).to.equal(1694);
    expect(blueLoadout.get(SLOT_BOOST).paintIndex).to.equal(PAINT_PURPLE);

    expect(blueLoadout.get(SLOT_HAT).slotIndex).to.equal(SLOT_HAT);
    expect(blueLoadout.get(SLOT_HAT).productId).to.equal(4583);
    expect(blueLoadout.get(SLOT_HAT).paintIndex).to.equal(PAINT_PINK);

    expect(blueLoadout.get(SLOT_ANTENNA).slotIndex).to.equal(SLOT_ANTENNA);
    expect(blueLoadout.get(SLOT_ANTENNA).productId).to.equal(2039);
    expect(blueLoadout.get(SLOT_ANTENNA).paintIndex).to.equal(PAINT_PURPLE);

    expect(blueLoadout.get(SLOT_SUPERSONIC_TRAIL).slotIndex).to.equal(SLOT_SUPERSONIC_TRAIL);
    expect(blueLoadout.get(SLOT_SUPERSONIC_TRAIL).productId).to.equal(3224);
    expect(blueLoadout.get(SLOT_SUPERSONIC_TRAIL).paintIndex).to.equal(PAINT_SKY_BLUE);

    expect(blueLoadout.get(SLOT_PAINTFINISH).slotIndex).to.equal(SLOT_PAINTFINISH);
    expect(blueLoadout.get(SLOT_PAINTFINISH).productId).to.equal(1707);

    expect(blueLoadout.get(SLOT_PAINTFINISH_SECONDARY).slotIndex).to.equal(SLOT_PAINTFINISH_SECONDARY);
    expect(blueLoadout.get(SLOT_PAINTFINISH_SECONDARY).productId).to.equal(4391);

    expect(blueLoadout.get(SLOT_ENGINE_AUDIO).slotIndex).to.equal(SLOT_ENGINE_AUDIO);
    expect(blueLoadout.get(SLOT_ENGINE_AUDIO).productId).to.equal(3452);

    expect(blueLoadout.get(SLOT_GOALEXPLOSION).slotIndex).to.equal(SLOT_GOALEXPLOSION);
    expect(blueLoadout.get(SLOT_GOALEXPLOSION).productId).to.equal(3525);
    expect(blueLoadout.get(SLOT_GOALEXPLOSION).paintIndex).to.equal(PAINT_SAFFRON);

    const blueColor = loadout.body.blueColor;
    expect(blueColor.shouldOverride).to.be.true;
    expect(blueColor.primaryColors.r).to.equal(255);
    expect(blueColor.primaryColors.g).to.equal(0);
    expect(blueColor.primaryColors.b).to.equal(0);
    expect(blueColor.secondaryColors.r).to.equal(0);
    expect(blueColor.secondaryColors.g).to.equal(0);
    expect(blueColor.secondaryColors.b).to.equal(0);
  });

  it('should encode complex loadout', () => {
    const loadout = new BMLoadout();

    loadout.body.blueIsOrange = true;

    const blueLoadout = loadout.body.blueLoadout;

    blueLoadout.set(SLOT_BODY, {slotIndex: SLOT_BODY, productId: 3157, paintIndex: PAINT_LIME});
    blueLoadout.set(SLOT_SKIN, {slotIndex: SLOT_SKIN, productId: 3050, paintIndex: PAINT_NONE});
    blueLoadout.set(SLOT_WHEELS, {slotIndex: SLOT_WHEELS, productId: 3438, paintIndex: PAINT_CRIMSON});
    blueLoadout.set(SLOT_BOOST, {slotIndex: SLOT_BOOST, productId: 45, paintIndex: PAINT_BURNT_SIENNA});
    blueLoadout.set(SLOT_HAT, {slotIndex: SLOT_HAT, productId: 745, paintIndex: PAINT_TITANIUM_WHITE});
    blueLoadout.set(SLOT_ANTENNA, {slotIndex: SLOT_ANTENNA, productId: 2039, paintIndex: PAINT_PURPLE});
    blueLoadout.set(SLOT_SUPERSONIC_TRAIL, {slotIndex: SLOT_SUPERSONIC_TRAIL, productId: 3577, paintIndex: PAINT_PINK});
    blueLoadout.set(SLOT_PAINTFINISH, {slotIndex: SLOT_PAINTFINISH, productId: 274});
    blueLoadout.set(SLOT_PAINTFINISH_SECONDARY, {slotIndex: SLOT_PAINTFINISH_SECONDARY, productId: 277});
    blueLoadout.set(SLOT_ENGINE_AUDIO, {slotIndex: SLOT_ENGINE_AUDIO, productId: 4565});
    blueLoadout.set(SLOT_GOALEXPLOSION, {slotIndex: SLOT_GOALEXPLOSION, productId: 3131, paintIndex: PAINT_ORANGE});

    const blueColor = loadout.body.blueColor;
    blueColor.shouldOverride = true;
    blueColor.primaryColors = {r: 255, g: 255, b: 0};
    blueColor.secondaryColors = {r: 255, g: 255, b: 255};

    const result = encodeLoadout(loadout);

    expect(result).to.equal('ggptF1SxQlBfhFsbjBbQKOkiQ+5PxOW3yZEIWEXQqqO3wyr//wH+//8B');
  });
});
