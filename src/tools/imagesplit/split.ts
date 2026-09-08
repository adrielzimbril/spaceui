export type Ratio = number | 'original'

export interface SplitConfig {
  cols: number
  colFlex?: number[]
  ratio: Ratio
  fit: 'cover' | 'contain'
  zoom: number
  panX: number
  panY: number
  gap: number
  bg: string
  padding: number
  radius: number
  scale: number
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number
  prefix: string
  reverse: boolean
}

export const MAX_STAGE = 8000

export type Source = HTMLImageElement | HTMLCanvasElement

export function getColFlex(cfg: SplitConfig): number[] {
  if (cfg.colFlex && cfg.colFlex.length === cfg.cols) {
    return cfg.colFlex
  }
  return Array(cfg.cols).fill(1)
}

export function prepareSource(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas
}

export function frameAspect(src: Source, cfg: SplitConfig): number {
  const w = src.width
  const h = src.height
  if (cfg.ratio === 'original') return w / h
  return cfg.ratio
}

export function renderStage(src: Source, cfg: SplitConfig): HTMLCanvasElement {
  const w = src.width
  const h = src.height
  const aspect = frameAspect(src, cfg)
  const baseW = Math.min(w, h * aspect)
  const baseH = baseW / aspect

  let stageW = Math.max(cfg.cols * 8, Math.round(baseW * cfg.scale))
  let stageH = Math.max(8, Math.round(stageW / aspect))
  const over = Math.max(stageW, stageH) / MAX_STAGE
  if (over > 1) {
    stageW = Math.round(stageW / over)
    stageH = Math.round(stageH / over)
  }

  const canvas = document.createElement('canvas')
  canvas.width = stageW
  canvas.height = stageH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, stageW, stageH)
  if (cfg.bg && cfg.bg !== 'transparent' && cfg.bg !== '#09090b') {
    ctx.fillStyle = cfg.bg
    ctx.fillRect(0, 0, stageW, stageH)
  }

  if (cfg.fit === 'cover') {
    const cropW = baseW / cfg.zoom
    const cropH = baseH / cfg.zoom
    const cropX = cfg.panX * (w - cropW)
    const cropY = cfg.panY * (h - cropH)
    ctx.drawImage(src, cropX, cropY, cropW, cropH, 0, 0, stageW, stageH)
  } else {
    const s = Math.min(stageW / w, stageH / h) * cfg.zoom
    const dw = w * s
    const dh = h * s
    ctx.drawImage(src, (stageW - dw) * cfg.panX, (stageH - dh) * cfg.panY, dw, dh)
  }
  return canvas
}

export interface Tile {
  index: number
  col: number
  canvas: HTMLCanvasElement
  width: number
  height: number
  flex: number
}

function roundedPath(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(rr, 0)
  ctx.arcTo(w, 0, w, h, rr)
  ctx.arcTo(w, h, 0, h, rr)
  ctx.arcTo(0, h, 0, 0, rr)
  ctx.arcTo(0, 0, w, 0, rr)
  ctx.closePath()
}

export function sliceStage(stage: HTMLCanvasElement, cfg: SplitConfig): Tile[] {
  const gap = cfg.gap || 0
  const flexes = getColFlex(cfg)
  const totalFlex = flexes.reduce((acc, val) => acc + val, 0)
  const availWidth = Math.max(1, stage.width - gap * (cfg.cols - 1))
  const th = stage.height
  const pad = cfg.padding || 0
  const tiles: Tile[] = []

  let currentX = 0
  for (let c = 0; c < cfg.cols; c++) {
    const flex = flexes[c] ?? 1
    const tw =
      c === cfg.cols - 1
        ? Math.max(1, stage.width - currentX)
        : Math.max(1, Math.round((availWidth * flex) / totalFlex))

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, tw + pad * 2)
    canvas.height = Math.max(1, Math.round(th) + pad * 2)
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (cfg.bg && cfg.bg !== 'transparent' && cfg.bg !== '#09090b') {
      ctx.fillStyle = cfg.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.save()
    if (cfg.radius > 0) {
      roundedPath(ctx, canvas.width, canvas.height, cfg.radius)
      ctx.clip()
    }
    ctx.drawImage(stage, currentX, 0, tw, th, pad, pad, tw, Math.round(th))
    ctx.restore()
    tiles.push({ index: c, col: c, canvas, width: tw, height: Math.round(th), flex })
    currentX += tw + gap
  }
  return cfg.reverse ? tiles.slice().reverse() : tiles
}

export async function toBlob(canvas: HTMLCanvasElement, cfg: SplitConfig): Promise<Blob> {
  const rawBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), cfg.format, cfg.format === 'image/png' ? undefined : cfg.quality)
  })

  if (cfg.format === 'image/png') {
    return injectPngMetadata(rawBlob)
  }
  if (cfg.format === 'image/jpeg') {
    return injectJpegMetadata(rawBlob)
  }
  return rawBlob
}

export function extFor(format: SplitConfig['format']) {
  return format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// -----------------------------------------------------------------------------
// Pure JavaScript ZIP creation (zero dependencies, 100% browser native)
// -----------------------------------------------------------------------------

const CRC32_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC32_TABLE[i] = c >>> 0
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

function encodeUtf16Le(str: string): Uint8Array {
  const buf = new Uint8Array((str.length + 1) * 2)
  const view = new DataView(buf.buffer)
  for (let i = 0; i < str.length; i++) {
    view.setUint16(i * 2, str.charCodeAt(i), true)
  }
  view.setUint16(str.length * 2, 0, true)
  return buf
}

function buildTiffExif(): Uint8Array {
  const encoder = new TextEncoder()
  const entries: { tag: number; type: number; count: number; data: Uint8Array }[] = []

  const addAscii = (tag: number, str: string) => {
    const raw = encoder.encode(str + '\0')
    entries.push({ tag, type: 2, count: raw.length, data: raw })
  }
  const addUtf16 = (tag: number, str: string) => {
    const raw = encodeUtf16Le(str)
    entries.push({ tag, type: 1, count: raw.length, data: raw })
  }

  // Standard TIFF / EXIF tags (read by Windows Explorer, macOS, ExifTool, Photoshop)
  addAscii(0x010e, 'Space UI Image Splitter')
  addAscii(0x0131, 'Space UI Image Splitter')
  addAscii(0x013b, 'Built by Space UI')
  addAscii(0x8298, 'Space UI')
  // Windows XP metadata tags (specifically displayed in Windows Explorer Details tab)
  addUtf16(0x9c9b, 'Space UI Image Splitter') // Title
  addUtf16(0x9c9c, 'Built by Space UI · High-precision image slicing & design engineering') // Comments
  addUtf16(0x9c9d, 'Built by Space UI') // Authors
  addUtf16(0x9c9e, 'Space UI, Image Splitter') // Tags
  addUtf16(0x9c9f, 'Built by Space UI') // Subject

  entries.sort((a, b) => a.tag - b.tag)

  const ifd0Offset = 8
  const ifdLength = 2 + entries.length * 12 + 4
  const dataOffset = ifd0Offset + ifdLength

  let extraSize = 0
  for (const e of entries) {
    if (e.data.length > 4) {
      extraSize += (e.data.length + 1) & ~1
    }
  }

  const buf = new Uint8Array(dataOffset + extraSize)
  const view = new DataView(buf.buffer)
  buf[0] = 0x49 // 'I'
  buf[1] = 0x49 // 'I'
  view.setUint16(2, 42, true)
  view.setUint32(4, ifd0Offset, true)

  view.setUint16(ifd0Offset, entries.length, true)
  let entryPos = ifd0Offset + 2
  let currDataOffset = dataOffset

  for (const e of entries) {
    view.setUint16(entryPos, e.tag, true)
    view.setUint16(entryPos + 2, e.type, true)
    view.setUint32(entryPos + 4, e.count, true)
    if (e.data.length <= 4) {
      buf.set(e.data, entryPos + 8)
    } else {
      view.setUint32(entryPos + 8, currDataOffset, true)
      buf.set(e.data, currDataOffset)
      currDataOffset += (e.data.length + 1) & ~1
    }
    entryPos += 12
  }
  view.setUint32(entryPos, 0, true)
  return buf
}

function makePngChunk(typeStr: string, data: Uint8Array): Uint8Array {
  const encoder = new TextEncoder()
  const typeBytes = encoder.encode(typeStr)
  const len = data.length
  const chunk = new Uint8Array(4 + 4 + len + 4)
  const view = new DataView(chunk.buffer)

  view.setUint32(0, len, false)
  chunk.set(typeBytes, 4)
  chunk.set(data, 8)

  const typeAndData = chunk.subarray(4, 8 + len)
  const crc = crc32(typeAndData)
  view.setUint32(8 + len, crc, false)
  return chunk
}

function buildXmpChunk(): Uint8Array {
  const encoder = new TextEncoder()
  const xmp = `<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">
   <dc:creator><rdf:Seq><rdf:li>Built by Space UI</rdf:li></rdf:Seq></dc:creator>
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">Space UI Image Splitter</rdf:li></rdf:Alt></dc:title>
   <dc:description><rdf:Alt><rdf:li xml:lang="x-default">Built by Space UI</rdf:li></rdf:Alt></dc:description>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">Space UI</rdf:li></rdf:Alt></dc:rights>
   <xmp:CreatorTool>Space UI Image Split</xmp:CreatorTool>
   <photoshop:Credit>Built by Space UI</photoshop:Credit>
   <photoshop:Source>https://www.spaceui.one/tools/imagesplit</photoshop:Source>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`

  const keyword = encoder.encode('XML:com.adobe.xmp')
  const xmpBytes = encoder.encode(xmp)
  const data = new Uint8Array(keyword.length + 5 + xmpBytes.length)
  data.set(keyword, 0)
  data[keyword.length] = 0
  data[keyword.length + 1] = 0
  data[keyword.length + 2] = 0
  data[keyword.length + 3] = 0
  data[keyword.length + 4] = 0
  data.set(xmpBytes, keyword.length + 5)
  return makePngChunk('iTXt', data)
}

function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const encoder = new TextEncoder()
  const keyBytes = encoder.encode(keyword)
  const valBytes = encoder.encode(text)
  const dataLen = keyBytes.length + 1 + valBytes.length
  const chunk = new Uint8Array(4 + 4 + dataLen + 4)
  const view = new DataView(chunk.buffer)

  view.setUint32(0, dataLen, false)
  chunk[4] = 0x74 // 't'
  chunk[5] = 0x45 // 'E'
  chunk[6] = 0x58 // 'X'
  chunk[7] = 0x74 // 't'
  chunk.set(keyBytes, 8)
  chunk[8 + keyBytes.length] = 0
  chunk.set(valBytes, 8 + keyBytes.length + 1)

  const typeAndData = chunk.subarray(4, 4 + 4 + dataLen)
  const crc = crc32(typeAndData)
  view.setUint32(4 + 4 + dataLen, crc, false)

  return chunk
}

async function injectPngMetadata(blob: Blob): Promise<Blob> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (
    bytes.length < 33 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return blob
  }

  const tiffExif = buildTiffExif()
  const exifChunk = makePngChunk('eXIf', tiffExif)
  const xmpChunk = buildXmpChunk()

  const textChunks: Uint8Array[] = [
    createPngTextChunk('Title', 'Space UI*'),
    createPngTextChunk('Author', 'Built by Space UI'),
    createPngTextChunk(
      'Description',
      'Created with Space UI Image Splitter · https://www.spaceui.one/tools/imagesplit',
    ),
    createPngTextChunk('Software', 'Space UI (https://www.spaceui.one/tools/imagesplit)'),
    createPngTextChunk('Copyright', 'Space UI'),
    createPngTextChunk('Source', 'Space UI Image Splitter'),
    createPngTextChunk('Comment', 'Built by Space UI · High-precision image splitter & design engineering'),
    createPngTextChunk('Creation Time', new Date().toISOString()),
  ]

  const metadataChunks = [exifChunk, xmpChunk, ...textChunks]
  const totalMetaLen = metadataChunks.reduce((acc, c) => acc + c.length, 0)
  const result = new Uint8Array(bytes.length + totalMetaLen)

  result.set(bytes.subarray(0, 33), 0)
  let offset = 33
  for (const chunk of metadataChunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  result.set(bytes.subarray(33), offset)

  return new Blob([result], { type: 'image/png' })
}

function createJpegCommentChunk(comment: string): Uint8Array {
  const encoder = new TextEncoder()
  const commentBytes = encoder.encode(comment)
  const length = 2 + commentBytes.length
  const chunk = new Uint8Array(2 + length)
  chunk[0] = 0xff
  chunk[1] = 0xfe
  chunk[2] = (length >> 8) & 0xff
  chunk[3] = length & 0xff
  chunk.set(commentBytes, 4)
  return chunk
}

async function injectJpegMetadata(blob: Blob): Promise<Blob> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return blob
  }

  const tiff = buildTiffExif()
  const app1Len = 2 + 6 + tiff.length
  const app1 = new Uint8Array(2 + app1Len)
  const view = new DataView(app1.buffer)
  app1[0] = 0xff
  app1[1] = 0xe1
  view.setUint16(2, app1Len, false)
  const exifHeader = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]) // "Exif\0\0"
  app1.set(exifHeader, 4)
  app1.set(tiff, 10)

  const commentChunk = createJpegCommentChunk(
    'Built by Space UI · Space UI Image Splitter (https://www.spaceui.one/tools/imagesplit) · Author: Space UI',
  )
  const totalExtra = app1.length + commentChunk.length
  const result = new Uint8Array(bytes.length + totalExtra)
  result.set(bytes.subarray(0, 2), 0)
  result.set(app1, 2)
  result.set(commentChunk, 2 + app1.length)
  result.set(bytes.subarray(2), 2 + totalExtra)
  return new Blob([result], { type: 'image/jpeg' })
}

function getDosDateTime(date: Date = new Date()) {
  const year = Math.max(1980, date.getFullYear())
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  return { dosDate, dosTime }
}

export async function createZipArchive(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const { dosDate, dosTime } = getDosDateTime()
  const fileEntries: {
    nameBytes: Uint8Array
    dataBytes: Uint8Array
    crc: number
    offset: number
  }[] = []

  const encoder = new TextEncoder()
  const localChunks: Uint8Array[] = []
  let currentOffset = 0

  for (const f of files) {
    const nameBytes = encoder.encode(f.name)
    const arrayBuffer = await f.blob.arrayBuffer()
    const dataBytes = new Uint8Array(arrayBuffer)
    const crc = crc32(dataBytes)

    const header = new Uint8Array(30 + nameBytes.length)
    const view = new DataView(header.buffer)

    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0x0800, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, dosTime, true)
    view.setUint16(12, dosDate, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, dataBytes.length, true)
    view.setUint32(22, dataBytes.length, true)
    view.setUint16(26, nameBytes.length, true)
    view.setUint16(28, 0, true)
    header.set(nameBytes, 30)

    fileEntries.push({
      nameBytes,
      dataBytes,
      crc,
      offset: currentOffset,
    })

    localChunks.push(header, dataBytes)
    currentOffset += header.length + dataBytes.length
  }

  const centralDirStartOffset = currentOffset
  const centralChunks: Uint8Array[] = []
  let centralDirSize = 0

  for (const entry of fileEntries) {
    const cHeader = new Uint8Array(46 + entry.nameBytes.length)
    const view = new DataView(cHeader.buffer)

    view.setUint32(0, 0x02014b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 20, true)
    view.setUint16(8, 0x0800, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, dosTime, true)
    view.setUint16(14, dosDate, true)
    view.setUint32(16, entry.crc, true)
    view.setUint32(20, entry.dataBytes.length, true)
    view.setUint32(24, entry.dataBytes.length, true)
    view.setUint16(28, entry.nameBytes.length, true)
    view.setUint16(30, 0, true)
    view.setUint16(32, 0, true)
    view.setUint16(34, 0, true)
    view.setUint16(36, 0, true)
    view.setUint32(38, 0, true)
    view.setUint32(42, entry.offset, true)
    cHeader.set(entry.nameBytes, 46)

    centralChunks.push(cHeader)
    centralDirSize += cHeader.length
  }

  const endRecord = new Uint8Array(22)
  const endView = new DataView(endRecord.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, fileEntries.length, true)
  endView.setUint16(10, fileEntries.length, true)
  endView.setUint32(12, centralDirSize, true)
  endView.setUint32(16, centralDirStartOffset, true)
  endView.setUint16(20, 0, true)

  return new Blob([...localChunks, ...centralChunks, endRecord] as unknown as BlobPart[], { type: 'application/zip' })
}
