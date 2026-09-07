const SIGNATURE = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10)

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let value = i
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    table[i] = value
  }
  return table
})()

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function u32(value: number) {
  return Uint8Array.of((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff)
}

function u16(value: number) {
  return Uint8Array.of((value >>> 8) & 0xff, value & 0xff)
}

function concat(parts: Uint8Array[]) {
  const size = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function chunk(type: string, data: Uint8Array) {
  const name = Uint8Array.from([...type].map((char) => char.charCodeAt(0)))
  const body = concat([name, data])
  return concat([u32(data.length), body, u32(crc32(body))])
}

function readChunks(png: Uint8Array) {
  const ihdr: Uint8Array[] = []
  const idat: Uint8Array[] = []
  let offset = 8
  while (offset + 8 <= png.length) {
    const length = (png[offset]! << 24) | (png[offset + 1]! << 16) | (png[offset + 2]! << 8) | png[offset + 3]!
    const type = String.fromCharCode(png[offset + 4]!, png[offset + 5]!, png[offset + 6]!, png[offset + 7]!)
    const data = png.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') ihdr.push(data.slice())
    if (type === 'IDAT') idat.push(data.slice())
    if (type === 'IEND') break
    offset += 12 + length
  }
  return { ihdr: ihdr[0] ?? new Uint8Array(), idat: concat(idat) }
}

export async function pngsToApng(pngs: Uint8Array[], fps: number) {
  if (!pngs.length) throw new Error('No APNG frames')
  const delayNum = 1
  const delayDen = fps
  const parts: Uint8Array[] = [SIGNATURE]
  let sequence = 0
  for (let index = 0; index < pngs.length; index++) {
    const { ihdr, idat } = readChunks(pngs[index]!)
    if (index === 0) {
      parts.push(chunk('IHDR', ihdr))
      parts.push(chunk('acTL', concat([u32(pngs.length), u32(0)])))
    }
    const fcTL = concat([
      u32(sequence++),
      u32((ihdr[0]! << 24) | (ihdr[1]! << 16) | (ihdr[2]! << 8) | ihdr[3]!),
      u32((ihdr[4]! << 24) | (ihdr[5]! << 16) | (ihdr[6]! << 8) | ihdr[7]!),
      u32(0),
      u32(0),
      u16(delayNum),
      u16(delayDen),
      Uint8Array.of(0),
      Uint8Array.of(0),
    ])
    parts.push(chunk('fcTL', fcTL))
    if (index === 0) parts.push(chunk('IDAT', idat))
    else parts.push(chunk('fdAT', concat([u32(sequence++), idat])))
  }
  parts.push(chunk('IEND', new Uint8Array()))
  return new Blob([concat(parts)], { type: 'image/apng' })
}
