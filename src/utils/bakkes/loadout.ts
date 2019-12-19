import { BitBinaryReader, BitBinaryWriter } from './binary';
import { BMItem, BMItems, BMLoadout } from './model';
import { Color } from 'three';

export const CURRENT_LOADOUT_VERSION = 2;


export function encodeLoadout(loadout: BMLoadout): string {
  // Allocate buffer that's big enough
  const writer = new BitBinaryWriter(10000);
  writer.writeNumber(CURRENT_LOADOUT_VERSION, 6); // Write current version

  /*
	We write 18 empty bits here, because we determine size and CRC after writing the whole loadout
	but we still need to allocate this space in advance
	*/
  writer.writeNumber(0, 18);

  writer.writeBool(loadout.body.blueIsOrange); // Write blue == orange?
  writeLoadout(writer, loadout.body.blueLoadout);
  writer.writeBool(loadout.body.blueColor.shouldOverride); // Write override blue car colors or not

  if (loadout.body.blueColor.shouldOverride) {
    writeColor(writer, loadout.body.blueColor.primaryColors);
    writeColor(writer, loadout.body.blueColor.secondaryColors);
  }

  if (!loadout.body.blueIsOrange) {
    writeLoadout(writer, loadout.body.orangeLoadout);
    writer.writeBool(loadout.body.orangeColor.shouldOverride); // Write override orange car colors or not

    if (loadout.body.orangeColor.shouldOverride) {
      writeColor(writer, loadout.body.orangeColor.primaryColors);
      writeColor(writer, loadout.body.orangeColor.secondaryColors);
    }
  }

  const currentBit = writer.currentBit; // Save current location of writer

  //Calculate how many bytes are used
  const sizeInBytes: number = Math.floor(currentBit / 8) + (currentBit % 8 == 0 ? 0 : 1);
  writer.currentBit = 6; // Set writer to header (bit 6)
  writer.writeNumber(sizeInBytes, 10); // Write size
  writer.writeNumber(writer.calculateCrc(3, sizeInBytes), 8); // Write calculated CRC
  writer.currentBit = currentBit;

  return writer.toHex();
}

export function decodeLoadout(loadoutString: string, verify: boolean = true): BMLoadout {
  const reader = new BitBinaryReader(loadoutString);
  const loadout = new BMLoadout();

  /*
	Reads header
		VERSION (6 bits)
		SIZE_IN_BYTES (10 bits)
		CRC (8 BITS)
	*/
  loadout.header.version = reader.readNumber(6);
  loadout.header.codeSize = reader.readNumber(10);
  loadout.header.crc = reader.readNumber(8);

  // Verification (can be skipped if you already know the code is correct)
  if (verify) {
    const stringSizeCalc = (Math.ceil((4 * loadout.header.codeSize / 3)) + 3) & ~3;

    // Diff may be at most 4 (?) because of base64 padding, but we check > 6 because IDK
    if (Math.abs(stringSizeCalc - loadoutString.length) > 6) {
      throw Error('Invalid input string size!');
    }

    // Verify CRC, aka check if user didn't mess with the input string to create invalid loadouts
    if (!reader.verifyCrc(loadout.header.crc, 3, loadout.header.codeSize)) {
      throw Error('Invalid input string! CRC check failed');
    }
  }

  // At this point we know the input string is probably correct, time to parse the body

  loadout.body.blueIsOrange = reader.readBool(); // Read single bit indicating whether blue = orange
  loadout.body.blueLoadout = readItemsFromBuffer(reader); // Read loadout
  loadout.body.blueColor.shouldOverride = reader.readBool(); // Read whether custom colors is on

  if (loadout.body.blueColor.shouldOverride) {
    // Read rgb for primary colors (0-255)
    loadout.body.blueColor.primaryColors = readColorsFromBuffer(reader);
    // Read rgb for secondary colors (0-255)
    loadout.body.blueColor.secondaryColors = readColorsFromBuffer(reader);
  }

  if (loadout.body.blueIsOrange) {
    loadout.body.orangeLoadout = loadout.body.blueLoadout;
  } else {
    loadout.body.orangeLoadout = readItemsFromBuffer(reader); // Read loadout
    loadout.body.orangeColor.shouldOverride = reader.readBool(); // Read whether custom colors is on

    if (loadout.body.orangeColor.shouldOverride) {
      // Read rgb for primary colors (0-255)
      loadout.body.orangeColor.primaryColors = readColorsFromBuffer(reader);
      // Read rgb for secondary colors (0-255)
      loadout.body.orangeColor.secondaryColors = readColorsFromBuffer(reader);
    }
  }

  return loadout;
}

function writeLoadout(writer: BitBinaryWriter, loadout: BMItems) {
  // Save current position so we can write the length here later
  const amountStorePos = writer.currentBit;
  // Reserve 4 bits to write size later
  writer.writeNumber(0, 4);

  let loadoutSize = 0;

  for (const entry of loadout) {
    const opt = entry[1];

    //In bakkesmod, when unequipping the productID gets set to 0 but doesn't
    //get removed, so we do this check here.
    if (opt.productId === 0) {
      continue;
    }
    loadoutSize++;
    writer.writeNumber(opt.slotIndex, 5); // Slot index, 5 bits so we get slot upto 31
    writer.writeNumber(opt.productId, 13); // Item id, 13 bits so upto 8191 should be enough
    writer.writeBool(opt.paintIndex > 0); // Bool indicating whether item is paintable or not
    if (opt.paintIndex) { // If paintable
      writer.writeNumber(opt.paintIndex, 6); // 6 bits, allow upto 63 paints
    }
  }

  // Save current position of writer
  const amountStorePos2 = writer.currentBit;
  writer.currentBit = amountStorePos;
  //Write the size of the loadout to the spot we allocated earlier
  writer.writeNumber(loadoutSize, 4); // Gives us a max of 15 customizable slots per team
  writer.currentBit = amountStorePos2; // Set back reader to original position
}

function writeColor(writer: BitBinaryWriter, color: Color) {
  writer.writeNumber(Math.round(color.r * 255), 8);
  writer.writeNumber(Math.round(color.g * 255), 8);
  writer.writeNumber(Math.round(color.b * 255), 8);
}

function readColorsFromBuffer(reader: BitBinaryReader): Color {
  return new Color(
    reader.readNumber(8) / 255,
    reader.readNumber(8) / 255,
    reader.readNumber(8) / 255
  );
}

function readItemsFromBuffer(reader: BitBinaryReader): BMItems {
  const items: BMItems = new Map<number, BMItem>();

  const size = reader.readNumber(4); // Read the length of the item array

  for (let i = 0; i < size; i++) {
    const option = new BMItem();

    option.slotIndex = reader.readNumber(5); // Read slot of item
    option.productId = reader.readNumber(13); // Read product ID

    const isPaintable = reader.readBool(); // Read whether item is paintable or not

    if (isPaintable) {
      option.paintIndex = reader.readNumber(6); // Read paint index
    }

    items.set(option.slotIndex, option); // Add item to loadout at its selected slot
  }

  return items;
}
