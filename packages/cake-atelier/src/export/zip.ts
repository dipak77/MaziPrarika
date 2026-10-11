/**
 * @mazi/cake-atelier — a small, deterministic ZIP writer
 *
 * Layered packages are ZIPs. Rather than pull in a dependency for one archive
 * shape, the writer here emits stored (uncompressed) entries with correct CRC-32
 * and central-directory records — valid for every unzip utility, and byte-stable
 * for identical input, which makes the package testable.
 */

export interface ZipEntry {
  /** Path inside the archive. Slashes create folders. */
  name: string;
  data: Uint8Array | string;
  /** Modification date; defaults to a fixed epoch so builds are reproducible. */
  date?: Date;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toBytes(data: Uint8Array | string): Uint8Array {
  return typeof data === 'string' ? new TextEncoder().encode(data) : data;
}

/** MS-DOS date/time pair used by the ZIP format. */
function dosDateTime(date: Date): { time: number; date: number } {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() / 2) & 0x1f);
  const day = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
  return { time, date: day };
}

interface PreparedEntry {
  nameBytes: Uint8Array;
  data: Uint8Array;
  crc: number;
  offset: number;
  time: number;
  date: number;
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value & 0xffff, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

/** Build a ZIP archive. Entry order is preserved; no compression is applied. */
export function createZip(entries: ZipEntry[], options: { date?: Date } = {}): Uint8Array {
  const fixedDate = options.date ?? new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
  const prepared: PreparedEntry[] = [];
  let offset = 0;

  const localParts: Uint8Array[] = [];
  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const data = toBytes(entry.data);
    const { time, date } = dosDateTime(entry.date ?? fixedDate);
    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    writeUint32(view, 0, 0x04034b50);
    writeUint16(view, 4, 20); // version needed
    writeUint16(view, 6, 0x0800); // UTF-8 filename
    writeUint16(view, 8, 0); // stored
    writeUint16(view, 10, time);
    writeUint16(view, 12, date);
    writeUint32(view, 14, crc32(data));
    writeUint32(view, 18, data.length);
    writeUint32(view, 22, data.length);
    writeUint16(view, 26, nameBytes.length);
    writeUint16(view, 28, 0);
    header.set(nameBytes, 30);

    prepared.push({ nameBytes, data, crc: crc32(data), offset, time, date });
    localParts.push(header, data);
    offset += header.length + data.length;
  }

  const centralParts: Uint8Array[] = [];
  let centralSize = 0;
  for (const entry of prepared) {
    const record = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(record.buffer);
    writeUint32(view, 0, 0x02014b50);
    writeUint16(view, 4, 20); // version made by
    writeUint16(view, 6, 20); // version needed
    writeUint16(view, 8, 0x0800);
    writeUint16(view, 10, 0); // stored
    writeUint16(view, 12, entry.time);
    writeUint16(view, 14, entry.date);
    writeUint32(view, 16, entry.crc);
    writeUint32(view, 20, entry.data.length);
    writeUint32(view, 24, entry.data.length);
    writeUint16(view, 28, entry.nameBytes.length);
    writeUint16(view, 30, 0); // extra
    writeUint16(view, 32, 0); // comment
    writeUint16(view, 34, 0); // disk
    writeUint16(view, 36, 0); // internal attrs
    writeUint32(view, 38, 0); // external attrs
    writeUint32(view, 42, entry.offset);
    record.set(entry.nameBytes, 46);
    centralParts.push(record);
    centralSize += record.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, prepared.length);
  writeUint16(endView, 10, prepared.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const part of localParts) {
    out.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    out.set(part, cursor);
    cursor += part.length;
  }
  out.set(end, cursor);
  return out;
}

export const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];

export function isZip(data: Uint8Array): boolean {
  return ZIP_MAGIC.every((byte, index) => data[index] === byte);
}

/** Read back the central directory — used by the tests to verify packages. */
export function listZipEntries(data: Uint8Array): { name: string; size: number; crc: number }[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  // Find the end-of-central-directory record.
  let eocd = -1;
  for (let i = data.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('cake-atelier: not a ZIP archive (no end-of-central-directory record).');
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const entries: { name: string; size: number; crc: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const crc = view.getUint32(cursor + 16, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const name = new TextDecoder().decode(data.subarray(cursor + 46, cursor + 46 + nameLength));
    entries.push({ name, size, crc });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/** Extract one entry (stored entries only — which is all this writer makes). */
export function readZipEntry(data: Uint8Array, name: string): Uint8Array | undefined {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  for (let i = 0; i < data.length - 4; i += 1) {
    if (view.getUint32(i, true) !== 0x04034b50) continue;
    const size = view.getUint32(i + 18, true);
    const nameLength = view.getUint16(i + 26, true);
    const extraLength = view.getUint16(i + 28, true);
    const entryName = new TextDecoder().decode(data.subarray(i + 30, i + 30 + nameLength));
    if (entryName === name) {
      const start = i + 30 + nameLength + extraLength;
      return data.subarray(start, start + size);
    }
  }
  return undefined;
}
