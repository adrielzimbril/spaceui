export interface PlaneGeometry {
  positions: Float32Array
  indices: Uint16Array | Uint32Array
  segments: number
  useUint32: boolean
}

export function createPlane(useUint32: boolean): PlaneGeometry {
  const segments = useUint32 ? 512 : 255
  const positions = new Float32Array((segments + 1) * (segments + 1) * 2)
  let pi = 0
  for (let y = 0; y <= segments; y++) {
    for (let x = 0; x <= segments; x++) {
      positions[pi++] = x / segments
      positions[pi++] = y / segments
    }
  }
  const indices = useUint32
    ? new Uint32Array(segments * segments * 6)
    : new Uint16Array(segments * segments * 6)
  let ii = 0
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      const i = x + y * (segments + 1)
      indices[ii++] = i
      indices[ii++] = i + 1
      indices[ii++] = i + segments + 1
      indices[ii++] = i + 1
      indices[ii++] = i + segments + 2
      indices[ii++] = i + segments + 1
    }
  }
  return { positions, indices, segments, useUint32 }
}
