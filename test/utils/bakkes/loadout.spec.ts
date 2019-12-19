import { expect } from 'chai';
import 'mocha';
import { decodeLoadout, encodeLoadout, SLOT_BODY } from '../../../src/utils/bakkes';
import * as btoa from 'btoa';
import * as atob from 'atob';
import { BMItem, BMLoadout } from '../../../src/utils/bakkes/model';

describe('Bakkes loadout', () => {
  before(() => {
    // @ts-ignore
    global.btoa = btoa;
    // @ts-ignore
    global.atob = atob;
  });

  it('should parse default loadout code', () => {
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

  it('should encode default loadout', function () {
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
});
