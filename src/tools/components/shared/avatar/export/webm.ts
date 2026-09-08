function vint(value: number) {
  if (value < 0x80) return Uint8Array.of(0x80 | value)
  if (value < 0x4000) return Uint8Array.of(0x40 | (value >> 8), value & 0xff)
  if (value < 0x200000) return Uint8Array.of(0x20 | (value >> 16), (value >> 8) & 0xff, value & 0xff)
  return Uint8Array.of(0x10 | (value >> 24), (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff)
}

function u8(...bytes: number[]) {
  return Uint8Array.of(...bytes)
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

function element(id: Uint8Array, data: Uint8Array) {
  return concat([id, vint(data.length), data])
}

function u32(value: number) {
  return u8((value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff)
}

function float64(value: number) {
  const view = new DataView(new ArrayBuffer(8))
  view.setFloat64(0, value)
  return new Uint8Array(view.buffer)
}

export class WebmMuxer {
  private readonly width: number
  private readonly height: number
  private readonly codecId: string
  private readonly chunks: { timestampMs: number; key: boolean; data: Uint8Array }[] = []

  constructor(width: number, height: number, codecId = 'V_VP8') {
    this.width = width
    this.height = height
    this.codecId = codecId
  }

  setCodec(codecId: string) {
    this.codecId = codecId
  }

  add(chunk: EncodedVideoChunk) {
    const data = new Uint8Array(chunk.byteLength)
    chunk.copyTo(data)
    this.chunks.push({
      timestampMs: Math.max(0, Math.round(chunk.timestamp / 1000)),
      key: chunk.type === 'key',
      data,
    })
  }

  build() {
    const duration = this.chunks.at(-1)?.timestampMs ?? 0
    const header = concat([
      element(
        u8(0x1a, 0x45, 0xdf, 0xa3),
        concat([
          element(u8(0x42, 0x86), u8(1)),
          element(u8(0x42, 0xf7), u8(1)),
          element(u8(0x42, 0xf2), u8(4)),
          element(u8(0x42, 0xf3), u8(8)),
          element(u8(0x42, 0x82), Uint8Array.from([...[...'webm'].map((c) => c.charCodeAt(0))])),
        ]),
      ),
    ])
    const info = element(
      u8(0x15, 0x49, 0xa9, 0x66),
      concat([
        element(u8(0x2a, 0xd7, 0xb1), u32(1_000_000)),
        element(u8(0x44, 0x89), float64(duration)),
        element(u8(0x4d, 0x80), Uint8Array.from([...[...'spaceui'].map((c) => c.charCodeAt(0))])),
      ]),
    )
    const video = element(u8(0xe0), concat([element(u8(0xb0), u32(this.width)), element(u8(0xba), u32(this.height))]))
    const track = element(
      u8(0xae),
      concat([
        element(u8(0xd7), u8(1)),
        element(u8(0x83), u8(1)),
        element(u8(0x86), Uint8Array.from([...[...this.codecId].map((c) => c.charCodeAt(0))])),
        video,
      ]),
    )
    const tracks = element(u8(0x16, 0x54, 0xae, 0x6b), track)
    const clusters: Uint8Array[] = []
    let clusterStart = 0
    let block = 0
    while (block < this.chunks.length) {
      const start = this.chunks[block]!.timestampMs
      clusterStart = start
      const payload: Uint8Array[] = [element(u8(0xe7), u32(clusterStart))]
      while (block < this.chunks.length && this.chunks[block]!.timestampMs - clusterStart < 32_767) {
        const item = this.chunks[block]!
        const rel = item.timestampMs - clusterStart
        const size = 4 + item.data.length
        payload.push(
          concat([u8(0xa3), vint(size), u8(0x81, (rel >> 8) & 0xff, rel & 0xff, item.key ? 0x80 : 0), item.data]),
        )
        block += 1
        if (item.timestampMs - start > 1000 && item.key) break
      }
      clusters.push(element(u8(0x1f, 0x43, 0xb6, 0x75), concat(payload)))
    }
    const unknown = u8(0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)
    const segment = concat([u8(0x18, 0x53, 0x80, 0x67), unknown, info, tracks, ...clusters])
    return new Blob([concat([header, segment])], { type: 'video/webm' })
  }
}
