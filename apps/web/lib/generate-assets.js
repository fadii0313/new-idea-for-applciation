const fs = require('fs');
const path = require('path');

function createSimpleGlb(modelName) {
  const gltfJson = {
    asset: {
      version: '2.0',
      generator: 'AURA 3D Model Synthesizer',
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: modelName, mesh: 0 }],
    meshes: [
      {
        name: `${modelName}_Mesh`,
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1,
            },
            indices: 2,
            mode: 4, // TRIANGLES
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: 8,
        type: 'VEC3',
        max: [0.06, 0.05, 0.14],
        min: [-0.06, -0.02, -0.14],
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: 8,
        type: 'VEC3',
        max: [1, 1, 1],
        min: [-1, -1, -1],
      },
      {
        bufferView: 2,
        byteOffset: 0,
        componentType: 5123, // UNSIGNED_SHORT
        count: 36,
        type: 'SCALAR',
        max: [7],
        min: [0],
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 8 * 3 * 4,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: 96,
        byteLength: 8 * 3 * 4,
        target: 34962,
      },
      {
        buffer: 0,
        byteOffset: 192,
        byteLength: 36 * 2,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
    ],
    buffers: [
      {
        byteLength: 264,
      },
    ],
  };

  // Binary data: 8 vertices for a 3D box shoe base
  const binBuffer = Buffer.alloc(264);

  // Positions (8 vertices)
  const positions = [
    -0.06, -0.02, -0.14,
     0.06, -0.02, -0.14,
     0.06,  0.05, -0.14,
    -0.06,  0.05, -0.14,
    -0.06, -0.02,  0.14,
     0.06, -0.02,  0.14,
     0.06,  0.05,  0.14,
    -0.06,  0.05,  0.14,
  ];
  let offset = 0;
  for (const p of positions) {
    binBuffer.writeFloatLE(p, offset);
    offset += 4;
  }

  // Normals (8 vertices)
  for (let i = 0; i < 8; i++) {
    binBuffer.writeFloatLE(0, offset);
    binBuffer.writeFloatLE(1, offset + 4);
    binBuffer.writeFloatLE(0, offset + 8);
    offset += 12;
  }

  // Indices (12 triangles = 36 indices)
  const indices = [
    0, 2, 1, 0, 3, 2, // back
    4, 5, 6, 4, 6, 7, // front
    0, 1, 5, 0, 5, 4, // bottom
    3, 6, 2, 3, 7, 6, // top
    0, 4, 7, 0, 7, 3, // left
    1, 2, 6, 1, 6, 5, // right
  ];
  for (const idx of indices) {
    binBuffer.writeUInt16LE(idx, offset);
    offset += 2;
  }

  // JSON string
  let jsonStr = JSON.stringify(gltfJson);
  while (Buffer.byteLength(jsonStr) % 4 !== 0) {
    jsonStr += ' ';
  }
  const jsonBuf = Buffer.from(jsonStr, 'utf8');

  // Binary chunk padding
  let binPadded = binBuffer;
  while (binPadded.length % 4 !== 0) {
    binPadded = Buffer.concat([binPadded, Buffer.from([0])]);
  }

  const totalLength = 12 + 8 + jsonBuf.length + 8 + binPadded.length;
  const glb = Buffer.alloc(totalLength);

  // GLB Header
  glb.writeUInt32LE(0x46546c67, 0); // 'glTF'
  glb.writeUInt32LE(2, 4); // version 2
  glb.writeUInt32LE(totalLength, 8); // total length

  // Chunk 0: JSON
  glb.writeUInt32LE(jsonBuf.length, 12);
  glb.writeUInt32LE(0x4e4f534a, 16); // 'JSON'
  jsonBuf.copy(glb, 20);

  // Chunk 1: BIN
  const binOffset = 20 + jsonBuf.length;
  glb.writeUInt32LE(binPadded.length, binOffset);
  glb.writeUInt32LE(0x004e4942, binOffset + 4); // 'BIN\0'
  binPadded.copy(glb, binOffset + 8);

  return glb;
}

const shoeDirs = [
  path.join(__dirname, '..', 'public', 'models', 'shoes'),
  path.join(__dirname, '..', '..', '..', 'models', 'assets', 'shoes'),
];

for (const d of shoeDirs) {
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'runner_v1.glb'), createSimpleGlb('Aura_Runner_V1'));
  fs.writeFileSync(path.join(d, 'street_sneaker.glb'), createSimpleGlb('Aura_Street_Sneaker'));
}

console.log('Valid GLB files generated successfully in public and models/assets directories.');

