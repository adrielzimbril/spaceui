export const aI = `
  uniform vec3 uTouch;
  uniform vec3 uTouchNormal;
  uniform float uStrength;
  uniform float uFurScale;
  uniform float uFurThickness;
  uniform float uTouchRadius;
  uniform vec3 uStroke;
  uniform vec4 uTrail[5];
  uniform float uTime;
  uniform float uArtworkMode;
  uniform float uIconOpacity;
  uniform sampler2D uArtwork;
  uniform vec3 uSideColor;
  uniform float uAutoColor;
  uniform sampler2D uPreviousArtwork;
  uniform float uPreviousArtworkMode;
  uniform vec3 uPreviousSideColor;
  uniform float uArtworkMix;
  uniform sampler2D uDistanceMap;

  float contactAt(vec3 p) {
    vec3 d = p - uTouch;
    return exp(-dot(d, d) / (0.13 * uTouchRadius * uTouchRadius)) * uStrength;
  }

  vec3 deform(vec3 p) {
    float contact = contactAt(p);
    float radius = length(p - uTouch) / uTouchRadius;
    float ripple = sin(radius * 24.0 - uTime * 5.0) * exp(-radius * 6.5)
      * uStrength * 0.006;
    p += uTouchNormal * (-contact * 0.18 + ripple);
    return p;
  }

  float aaveLogo(vec3 p) {
    vec2 q = p.xy / 3.0 + vec2(0.5);
    q.y = 1.0 - q.y;
    float radius = length(q - vec2(0.4975, 0.515));
    float arch = (1.0 - smoothstep(0.384, 0.390, radius))
      * smoothstep(0.285, 0.292, radius)
      * (1.0 - smoothstep(0.513, 0.519, q.y));
    float eyeA = 1.0 - smoothstep(0.077, 0.081, length(q - vec2(0.395, 0.4475)));
    float eyeB = 1.0 - smoothstep(0.077, 0.081, length(q - vec2(0.600, 0.4475)));
    return max(arch, max(eyeA, eyeB)) * smoothstep(0.12, 0.32, p.z);
  }
  
  vec3 sampleArtwork(vec3 p, sampler2D artwork, float mode, vec3 base) {
    vec3 result = base;
    if (mode < 0.5) {
      result = mix(base, vec3(1.0), aaveLogo(p) * uIconOpacity);
    } else {
      vec2 uv = clamp(p.xy / 3.0 + 0.5, 0.001, 0.999);
      vec4 tex = texture2D(artwork, uv);
      if (uAutoColor > 0.5) {
        vec3 edgeBleed = mix(base, tex.rgb, tex.a);
        float front = smoothstep(0.04, 0.22, p.z);
        if (mode < 1.5) {
          float marking = smoothstep(0.65, 0.94, min(edgeBleed.r, min(edgeBleed.g, edgeBleed.b)));
          result = mix(edgeBleed, vec3(1.0), marking * front * uIconOpacity);
        } else {
          result = mix(edgeBleed, tex.rgb, front * uIconOpacity * tex.a + (1.0 - front) * tex.a);
        }
      } else {
        vec3 printColor = mix(base, tex.rgb, tex.a);
        float front = smoothstep(0.08, 0.28, p.z);
        if (mode < 1.5) {
          float marking = smoothstep(0.65, 0.94, min(printColor.r, min(printColor.g, printColor.b)));
          result = mix(base, vec3(1.0), marking * front * uIconOpacity);
        } else {
          result = mix(base, printColor, front * uIconOpacity);
        }
      }
    }
    return result;
  }

  vec3 artworkColor(vec3 p) {
    vec3 before = sampleArtwork(p, uPreviousArtwork, uPreviousArtworkMode, uPreviousSideColor);
    vec3 after = sampleArtwork(p, uArtwork, uArtworkMode, uSideColor);
    return mix(before, after, uArtworkMix);
  }
`;

export const aD = `
  ${aI}
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vView;
  varying float vContact;
  void main() {
    vec3 pos = position;
    vec3 p = deform(pos);
    float c = contactAt(pos);
    vec3 n = normalize(normal - (pos - uTouch - normal * dot(pos - uTouch, normal)) * c * 2.77 / (uTouchRadius * uTouchRadius));
    vNormal = normalize(normalMatrix * n);
    vPosition = pos;
    vContact = c;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const aO = `
  ${aI}
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vView;
  varying float vContact;
  void main() {
    vec3 n = normalize(vNormal);
    float key = max(0.0, dot(n, normalize(vec3(-0.55, 0.85, 1.25))));
    float fill = max(0.0, dot(n, normalize(vec3(0.8, 0.2, 0.5))));
    vec3 color = artworkColor(vPosition);
    color = mix(mix(uPreviousSideColor, uSideColor, uArtworkMix), color, uAutoColor > 0.5 ? 1.0 : 0.85);
    color *= 0.55 + key * 0.45 + fill * 0.15;
    color *= 1.0 - min(vContact * 0.24, 0.5);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const aF = `
  ${aI}
  attribute vec3 aRoot;
  attribute vec3 aNormal;
  attribute vec4 aVariation;
  varying vec2 vRootUv;
  varying float vAlong;
  varying float vRandom;
  varying vec3 vArtworkColor;
  varying float vContact;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vView;
  varying float vSide;
  void main() {
    vec2 rootUv = aRoot.xy / 3.0 + 0.5;
    vRootUv = rootUv;
    vec3 root = aRoot;
    vec3 n = aNormal;
    float t = position.y;
    vec3 tangent = normalize(cross(n, abs(n.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
    vec3 bitangent = normalize(cross(n, tangent));
    float angle = aVariation.x * 6.283185;
    vec3 nap = tangent * (sin(root.y * 3.8 + root.x * 1.7) * 0.4 + cos(angle) * 0.32)
      + bitangent * (-0.48 + sin(root.x * 3.0) * 0.25 + sin(angle) * 0.28);
    float c = contactAt(root);
    vec3 radial = root - uTouch;
    radial -= n * dot(radial, n);
    vec3 brushing = radial / (length(radial) + 0.12 * uTouchRadius) * c * 0.19;
    brushing += (uStroke - n * dot(uStroke, n)) * c * 0.05;
    for (int i = 0; i < 5; i++) {
      vec3 delta = root - uTrail[i].xyz;
      float influence = exp(-dot(delta, delta) / (0.085 * uTouchRadius * uTouchRadius)) * uTrail[i].w;
      delta -= n * dot(delta, n);
      brushing += delta / (length(delta) + 0.12 * uTouchRadius) * influence * 0.025;
    }
    float length_hair = aVariation.y * uFurScale;
    vec3 bend = nap * length_hair * 0.85 + brushing;
    vec3 center = deform(root + bend * t * t)
      + n * length_hair * t * (1.0 - min(c * 0.7, 0.85));
    vec3 direction = normalize(n * length_hair * (1.0 - min(c * 0.7, 0.85)) + 2.0 * bend * t);
    vec3 viewDirection = normalize(cameraPosition - (modelMatrix * vec4(center, 1.0)).xyz);
    vec3 localView = (vec4(viewDirection, 0.0) * modelMatrix).xyz;
    vec3 across = normalize(cross(direction, localView));
    float width = aVariation.z * uFurThickness * pow(1.0 - t * 0.94, 0.7);
    center += across * position.x * width;
    vec4 mv = modelViewMatrix * vec4(center, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlong = t;
    vSide = position.x;
    vRandom = aVariation.w;
    vArtworkColor = mix(artworkColor(root), artworkColor(center), t * 0.45);
    vContact = c;
    vec3 contactNormal = normalize(n - (root - uTouch - n * dot(root - uTouch, n)) * c * 2.77 / (uTouchRadius * uTouchRadius));
    vNormal = normalize(normalMatrix * contactNormal);
    vTangent = normalize(normalMatrix * direction);
    vView = -mv.xyz;
  }
`;

export const aB = `
  uniform float uFurHighlight;
  uniform sampler2D uArtwork;
  uniform sampler2D uDistanceMap;
  varying vec2 vRootUv;
  varying float vAlong;
  varying float vRandom;
  varying vec3 vArtworkColor;
  varying float vContact;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vView;
  varying float vSide;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 light = normalize(vec3(-0.55, 0.85, 1.25));
    float key = max(dot(n, light), 0.0);
    float fill = max(dot(n, normalize(vec3(0.8, 0.2, 0.5))), 0.0);
    
    float wrapDiffuse = pow(max(0.0, dot(n, light) * 0.55 + 0.45), 1.6);
    float fiberDiffuse = sqrt(max(0.0, 1.0 - pow(dot(normalize(vTangent), light), 2.0)));
    float diffuse = mix(wrapDiffuse, fiberDiffuse, 0.35);

    float rim = pow(1.0 - abs(dot(n, normalize(vView))), 2.2);

    vec3 halfVector = normalize(light + normalize(vView));
    float fiberSpecular = pow(sqrt(max(0.0, 1.0 - pow(dot(normalize(vTangent), halfVector), 2.0))), 14.0);

    vec3 dye = vArtworkColor;
    float luma = dot(dye, vec3(0.2126, 0.7152, 0.0722));

    vec3 brightDye = min(vec3(1.0), dye * (1.2 + 0.3 * uFurHighlight));
    vec3 tipGlow = mix(brightDye, mix(brightDye, vec3(1.0), 0.4), luma * 0.7);
    dye = mix(dye, tipGlow, smoothstep(0.2, 1.0, vAlong) * (0.30 + 0.50 * uFurHighlight));

    vec3 color = dye * mix(0.98, 1.02, vRandom);
    float rootOcclusion = mix(0.72, 1.0, pow(vAlong, 0.5));
    color *= rootOcclusion * (0.50 + diffuse * 0.55 + fill * 0.18);

    vec3 rimTint = mix(dye * 1.25, vec3(1.0), 0.12 + luma * 0.6);
    vec3 rimSheen = rimTint * 0.38 * rim * (0.35 + 0.65 * vAlong);
    color += rimSheen;

    vec3 specTint = mix(dye * 1.4, vec3(1.0), 0.10 + luma * 0.7);
    vec3 specColor = specTint * 0.30 * fiberSpecular * key * vAlong * (0.35 + 0.65 * uFurHighlight);
    color += specColor;

    color *= 1.0 - min(vContact * 0.25, 0.5);
    float edge = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
    gl_FragColor = vec4(color, edge);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const blurFrag = `
  uniform sampler2D uImage;
  uniform vec2 uPixel;
  varying vec2 vUv;
  void main() {
    vec4 center = texture2D(uImage, vUv);
    vec3 weightedColor = vec3(0.0);
    float weightedAlpha = 0.0;
    float totalWeight = 0.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec4 sampleColor = texture2D(uImage, vUv + vec2(float(x), float(y)) * uPixel * 1.1);
        float spatial = (x == 0 ? 2.0 : 1.0) * (y == 0 ? 2.0 : 1.0);
        vec3 difference = sampleColor.rgb - center.rgb;
        float edgeWeight = exp(-dot(difference, difference) / 0.075);
        float weight = spatial * edgeWeight;
        weightedColor += sampleColor.rgb * sampleColor.a * weight;
        weightedAlpha += sampleColor.a * weight;
        totalWeight += weight;
      }
    }
    gl_FragColor = vec4(weightedColor / max(weightedAlpha, 0.00001), weightedAlpha / max(totalWeight, 0.00001));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
