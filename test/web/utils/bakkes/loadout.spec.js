describe('Bakkes loadout', () => {

  it('should decode default loadout code', () => {
    const loadout = RL.decodeLoadout('ggL/AlwAAlwAAA==');

    expect(loadout.header.version).to.equal(2);
    expect(loadout.header.codeSize).to.equal(10);

    expect(loadout.body.blueIsOrange).to.be.false;

    expect(loadout.body.blueLoadout.size).to.equal(1);
    expect(loadout.body.blueLoadout.get(RL.SLOT_BODY).slotIndex).to.equal(RL.SLOT_BODY);
    expect(loadout.body.blueLoadout.get(RL.SLOT_BODY).productId).to.equal(23);
    expect(loadout.body.blueLoadout.get(RL.SLOT_BODY).paintIndex).to.be.undefined;

    expect(loadout.body.orangeLoadout.size).to.equal(1);
    expect(loadout.body.orangeLoadout.get(RL.SLOT_BODY).slotIndex).to.equal(RL.SLOT_BODY);
    expect(loadout.body.orangeLoadout.get(RL.SLOT_BODY).productId).to.equal(23);
    expect(loadout.body.orangeLoadout.get(RL.SLOT_BODY).paintIndex).to.be.undefined;

    expect(loadout.body.blueColor.shouldOverride).to.be.false;
    expect(loadout.body.blueColor.primaryColors).to.be.undefined;
    expect(loadout.body.blueColor.secondaryColors).to.be.undefined;

    expect(loadout.body.orangeColor.shouldOverride).to.be.false;
    expect(loadout.body.orangeColor.primaryColors).to.be.undefined;
    expect(loadout.body.orangeColor.secondaryColors).to.be.undefined;
  });

  it('should encode default loadout', () => {
    const loadout = new RL.BMLoadout();

    const defaultItem = {
      slotIndex: RL.SLOT_BODY,
      productId: 23
    };

    loadout.body.blueIsOrange = false;
    loadout.body.blueLoadout.set(RL.SLOT_BODY, defaultItem);
    loadout.body.orangeLoadout.set(RL.SLOT_BODY, defaultItem);

    const result = RL.encodeLoadout(loadout);

    expect(result).to.equal('ggL/AlwAAlwAAA==');
  });

  it('should decode complex loadout code', () => {
    const loadout = RL.decodeLoadout('ggpXF0yGRThlByH5HsPTRMj9iZTzODmrBjuJGl/jMFniFbfNfwAAAAAA');

    expect(loadout.header.version).to.equal(2);
    expect(loadout.header.codeSize).to.equal(42);

    expect(loadout.body.blueIsOrange).to.be.true;

    const blueLoadout = loadout.body.blueLoadout;
    expect(blueLoadout.get(RL.SLOT_BODY).slotIndex).to.equal(RL.SLOT_BODY);
    expect(blueLoadout.get(RL.SLOT_BODY).productId).to.equal(403);
    expect(blueLoadout.get(RL.SLOT_BODY).paintIndex).to.equal(RL.PAINT_COBALT);

    expect(blueLoadout.get(RL.SLOT_SKIN).slotIndex).to.equal(RL.SLOT_SKIN);
    expect(blueLoadout.get(RL.SLOT_SKIN).productId).to.equal(3239);
    expect(blueLoadout.get(RL.SLOT_SKIN).paintIndex).to.equal(RL.PAINT_BLACK);

    expect(blueLoadout.get(RL.SLOT_WHEELS).slotIndex).to.equal(RL.SLOT_WHEELS);
    expect(blueLoadout.get(RL.SLOT_WHEELS).productId).to.equal(3986);
    expect(blueLoadout.get(RL.SLOT_WHEELS).paintIndex).to.equal(RL.PAINT_FOREST_GREEN);

    expect(blueLoadout.get(RL.SLOT_BOOST).slotIndex).to.equal(RL.SLOT_BOOST);
    expect(blueLoadout.get(RL.SLOT_BOOST).productId).to.equal(1694);
    expect(blueLoadout.get(RL.SLOT_BOOST).paintIndex).to.equal(RL.PAINT_PURPLE);

    expect(blueLoadout.get(RL.SLOT_HAT).slotIndex).to.equal(RL.SLOT_HAT);
    expect(blueLoadout.get(RL.SLOT_HAT).productId).to.equal(4583);
    expect(blueLoadout.get(RL.SLOT_HAT).paintIndex).to.equal(RL.PAINT_PINK);

    expect(blueLoadout.get(RL.SLOT_ANTENNA).slotIndex).to.equal(RL.SLOT_ANTENNA);
    expect(blueLoadout.get(RL.SLOT_ANTENNA).productId).to.equal(2039);
    expect(blueLoadout.get(RL.SLOT_ANTENNA).paintIndex).to.equal(RL.PAINT_PURPLE);

    expect(blueLoadout.get(RL.SLOT_SUPERSONIC_TRAIL).slotIndex).to.equal(RL.SLOT_SUPERSONIC_TRAIL);
    expect(blueLoadout.get(RL.SLOT_SUPERSONIC_TRAIL).productId).to.equal(3224);
    expect(blueLoadout.get(RL.SLOT_SUPERSONIC_TRAIL).paintIndex).to.equal(RL.PAINT_SKY_BLUE);

    expect(blueLoadout.get(RL.SLOT_PAINTFINISH).slotIndex).to.equal(RL.SLOT_PAINTFINISH);
    expect(blueLoadout.get(RL.SLOT_PAINTFINISH).productId).to.equal(1707);

    expect(blueLoadout.get(RL.SLOT_PAINTFINISH_SECONDARY).slotIndex).to.equal(RL.SLOT_PAINTFINISH_SECONDARY);
    expect(blueLoadout.get(RL.SLOT_PAINTFINISH_SECONDARY).productId).to.equal(4391);

    expect(blueLoadout.get(RL.SLOT_ENGINE_AUDIO).slotIndex).to.equal(RL.SLOT_ENGINE_AUDIO);
    expect(blueLoadout.get(RL.SLOT_ENGINE_AUDIO).productId).to.equal(3452);

    expect(blueLoadout.get(RL.SLOT_GOALEXPLOSION).slotIndex).to.equal(RL.SLOT_GOALEXPLOSION);
    expect(blueLoadout.get(RL.SLOT_GOALEXPLOSION).productId).to.equal(3525);
    expect(blueLoadout.get(RL.SLOT_GOALEXPLOSION).paintIndex).to.equal(RL.PAINT_SAFFRON);

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
    const loadout = new RL.BMLoadout();

    loadout.body.blueIsOrange = true;

    const blueLoadout = loadout.body.blueLoadout;

    blueLoadout.set(RL.SLOT_BODY, {slotIndex: RL.SLOT_BODY, productId: 3157, paintIndex: RL.PAINT_LIME});
    blueLoadout.set(RL.SLOT_SKIN, {slotIndex: RL.SLOT_SKIN, productId: 3050, paintIndex: RL.PAINT_NONE});
    blueLoadout.set(RL.SLOT_WHEELS, {slotIndex: RL.SLOT_WHEELS, productId: 3438, paintIndex: RL.PAINT_CRIMSON});
    blueLoadout.set(RL.SLOT_BOOST, {slotIndex: RL.SLOT_BOOST, productId: 45, paintIndex: RL.PAINT_BURNT_SIENNA});
    blueLoadout.set(RL.SLOT_HAT, {slotIndex: RL.SLOT_HAT, productId: 745, paintIndex: RL.PAINT_TITANIUM_WHITE});
    blueLoadout.set(RL.SLOT_ANTENNA, {slotIndex: RL.SLOT_ANTENNA, productId: 2039, paintIndex: RL.PAINT_PURPLE});
    blueLoadout.set(RL.SLOT_SUPERSONIC_TRAIL, {slotIndex: RL.SLOT_SUPERSONIC_TRAIL, productId: 3577, paintIndex: RL.PAINT_PINK});
    blueLoadout.set(RL.SLOT_PAINTFINISH, {slotIndex: RL.SLOT_PAINTFINISH, productId: 274});
    blueLoadout.set(RL.SLOT_PAINTFINISH_SECONDARY, {slotIndex: RL.SLOT_PAINTFINISH_SECONDARY, productId: 277});
    blueLoadout.set(RL.SLOT_ENGINE_AUDIO, {slotIndex: RL.SLOT_ENGINE_AUDIO, productId: 4565});
    blueLoadout.set(RL.SLOT_GOALEXPLOSION, {slotIndex: RL.SLOT_GOALEXPLOSION, productId: 3131, paintIndex: RL.PAINT_ORANGE});

    const blueColor = loadout.body.blueColor;
    blueColor.shouldOverride = true;
    blueColor.primaryColors = {r: 255, g: 255, b: 0};
    blueColor.secondaryColors = {r: 255, g: 255, b: 255};

    const result = RL.encodeLoadout(loadout);

    expect(result).to.equal('ggptF1SxQlBfhFsbjBbQKOkiQ+5PxOW3yZEIWEXQqqO3wyr//wH+//8B');
  });
});
