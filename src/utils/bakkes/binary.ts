export class BitBinaryWriter {
  private readonly buffer: Uint8Array;
  currentBit = 0;

  constructor(bufferSize: number) {
    this.buffer = new Uint8Array(bufferSize);
  }

  writeNumber(n: number, bits: number) {
    const a = new Uint16Array([n]);
    for (let i = 0; i < bits; i++) {
      if ((a[0] & 1) === 1) {
        this.buffer[Math.floor(this.currentBit / 8)] |= (1 << (this.currentBit % 8));
      } else {
        this.buffer[Math.floor(this.currentBit / 8)] &= ~(1 << (this.currentBit % 8));
      }
      this.currentBit++;
      a[0] >>= 1;
    }
  }

  writeBool(b: boolean) {
    this.writeNumber(b ? 1 : 0, 1);
  }

  calculateCrc(startByte: number, endByte: number) {
    const a = new Uint8Array([255]);
    for (let i = startByte; i < endByte; i++) {
      a[0] = a[0] ^ this.buffer[i];
    }
    return a[0];
  }

  toHex(): string {
    const sizeInBytes: number = Math.floor(this.currentBit / 8) + (this.currentBit % 8 === 0 ? 0 : 1);
    // @ts-ignore
    return btoa(String.fromCharCode.apply(null, this.buffer.slice(0, sizeInBytes)));
  }
}

export class BitBinaryReader {
  private readonly buffer: Uint8Array;
  private currentBit = 0;

  constructor(hexString: string) {
    const str = atob(hexString);
    this.buffer = new Uint8Array(new ArrayBuffer(str.length));
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      this.buffer[i] = str.charCodeAt(i);
    }
  }

  readNumber(bits: number): number {
    const a = new Uint16Array([0]);
    for (let i = 0; i < bits; i++) {
      a[0] |= ((this.buffer[Math.floor(this.currentBit / 8)] >> (this.currentBit % 8)) & 1) << i;
      this.currentBit++;
    }
    return a[0];
  }

  readBool(): boolean {
    return this.readNumber(1) === 1;
  }

  calculateCrc(startByte: number, endByte: number) {
    const a = new Uint8Array([255]);
    for (let i = startByte; i < endByte; i++) {
      a[0] = a[0] ^ this.buffer[i];
    }
    return a[0];
  }

  verifyCrc(crc: number, startByte: number, endByte: number): boolean {
    return (crc ^ this.calculateCrc(startByte, endByte)) === 0;
  }
}
