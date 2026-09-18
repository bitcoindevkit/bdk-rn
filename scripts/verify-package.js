#!/usr/bin/env node

/**
 * Refuse to publish a tarball that is missing its prebuilt native binaries.
 *
 * bdk-rn ships the Rust library inside the npm package and has no install
 * script, so a tarball without it is not slower to install, it is broken, and
 * it only shows up later as a CMake or linker error in someone else's app.
 *
 * The release workflow runs this before packing. It also hangs off
 * `prepublishOnly` so a hand-run `npm publish` from a working tree that never
 * built the binaries fails here instead of on npm.
 */

const { execSync } = require('child_process');
const path = require('path');

const ANDROID_ABIS = ['arm64-v8a', 'x86_64'];

// npm rejects tarballs over 256 MiB. Fail well before that so growth is noticed
// while there is still room to act on it.
const MAX_PACKED_BYTES = 200 * 1024 * 1024;

// --ignore-scripts so packing does not re-run `prepare`; only the file list and
// size are needed here.
const [pack] = JSON.parse(
  execSync('npm pack --dry-run --json --ignore-scripts', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  })
);
const files = new Set(pack.files.map((file) => file.path));

const required = [
  ['BdkRnFramework.xcframework/Info.plist', 'iOS xcframework'],
  ['BdkRnFramework.xcframework/ios-arm64/libbdkffi.a', 'iOS device slice'],
  [
    'BdkRnFramework.xcframework/ios-arm64-simulator/libbdkffi.a',
    'iOS simulator slice',
  ],
  ...ANDROID_ABIS.map((abi) => [
    `android/src/main/jniLibs/${abi}/libbdkffi.so`,
    `Android ${abi} shared library`,
  ]),
  ['cpp/generated/bdk.cpp', 'generated C++ bindings'],
  ['src/generated/bdk.ts', 'generated TypeScript bindings'],
  ['lib/module/index.js', 'compiled JavaScript (run `pnpm prepare`)'],
];

const problems = required
  .filter(([file]) => !files.has(file))
  .map(([file, label]) => `missing ${label} (${file})`);

// A static archive still links, but multiplies the package size ~10x, so it
// would be a silent regression. See android.useSharedLibrary in ubrn.config.yaml.
for (const file of files) {
  if (/^android\/src\/main\/jniLibs\/.*\.a$/.test(file)) {
    problems.push(`Android static archive in the tarball (${file})`);
  }
  if (file.startsWith('bdk-ffi/')) {
    problems.push(`Rust sources leaked into the tarball (${file})`);
  }
}

const packedMiB = (pack.size / 1024 / 1024).toFixed(1);
if (pack.size > MAX_PACKED_BYTES) {
  problems.push(
    `tarball is ${packedMiB} MiB, over the ${MAX_PACKED_BYTES / 1024 / 1024} MiB budget`
  );
}

if (problems.length > 0) {
  console.error(`\nRefusing to publish ${pack.id}:\n`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    '\nReleases are built and published by .github/workflows/release.yml when a'
  );
  console.error(
    'v* tag is pushed. To build locally, run `just build-tarball`.\n'
  );
  process.exit(1);
}

console.log(
  `${pack.id}: ${files.size} files, ${packedMiB} MiB packed, prebuilt binaries present`
);
