#!/usr/bin/env node
/**
 * Downloads the prebuilt native binaries for bdk-rn from GitHub Releases.
 *
 * The published npm package does not contain the Rust binaries (Android
 * static libs and the iOS xcframework) to keep the tarball small. This
 * script runs on `npm install` in the consumer's project, downloads the
 * artifacts for the matching release tag, verifies their SHA-256 checksums
 * (baked into package.json at publish time by CI), and extracts them into
 * the package root where the podspec and CMakeLists expect them.
 *
 * Environment variables:
 *   BDK_RN_SKIP_POSTINSTALL  - set to any value to skip this script entirely.
 *   BDK_RN_BINARY_BASE_URL   - override the download base URL (mirror).
 *                              Artifacts are fetched from <base>/<tag>/<zip>.
 *   BDK_RN_ARTIFACTS_DIR     - directory containing the artifact zips
 *                              (offline installs / CI caches). Zips are
 *                              copied from there instead of downloaded.
 *
 * Note: downloads use plain https and do not honor HTTP(S)_PROXY. Behind a
 * proxy, pre-fetch the zips and point BDK_RN_ARTIFACTS_DIR at them, or set
 * BDK_RN_SKIP_POSTINSTALL and provide the binaries yourself.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const packageJson = require(path.join(PACKAGE_ROOT, 'package.json'));

const DEFAULT_BASE_URL =
  'https://github.com/bitcoindevkit/bdk-rn/releases/download';
const BASE_URL = process.env.BDK_RN_BINARY_BASE_URL || DEFAULT_BASE_URL;
const MAX_REDIRECTS = 5;

const ARTIFACTS = [
  {
    name: 'Android',
    zipName: 'android-artifacts.zip',
    checksumKey: 'android',
    existsPath: path.join(PACKAGE_ROOT, 'android', 'src', 'main', 'jniLibs'),
  },
  {
    name: 'iOS',
    zipName: 'ios-artifacts.zip',
    checksumKey: 'ios',
    existsPath: path.join(PACKAGE_ROOT, 'BdkRnFramework.xcframework'),
    // iOS builds only happen on macOS hosts; skip the download elsewhere.
    platformGuard: 'darwin',
  },
];

function log(message) {
  console.log(`[bdk-rn] ${message}`);
}

function download(url, destination, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      reject(new Error(`Too many redirects while downloading ${url}`));
      return;
    }
    https
      .get(url, (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          resolve(
            download(response.headers.location, destination, redirectCount + 1)
          );
          return;
        }
        if (response.statusCode !== 200) {
          response.resume();
          reject(
            new Error(`Download failed (HTTP ${response.statusCode}): ${url}`)
          );
          return;
        }
        const file = fs.createWriteStream(destination);
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', (error) => {
          fs.rmSync(destination, { force: true });
          reject(error);
        });
      })
      .on('error', reject);
  });
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function verifyChecksum(filePath, expected, name) {
  const actual = await sha256(filePath);
  if (actual !== expected) {
    throw new Error(
      `Checksum mismatch for ${name}:\n  expected ${expected}\n  got      ${actual}\n` +
        'The downloaded artifact does not match the checksum recorded at publish time. ' +
        'Refusing to install it.'
    );
  }
}

function extractZip(zipPath, destination) {
  if (process.platform === 'win32') {
    // tar.exe (bsdtar) ships with Windows 10 1803+ and extracts zip archives.
    execFileSync('tar', ['-xf', zipPath, '-C', destination], {
      stdio: 'inherit',
    });
  } else {
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', destination], {
      stdio: 'inherit',
    });
  }
}

function manualInstructions(releaseTag) {
  return (
    `You can install the binaries manually:\n` +
    `  1. Download the artifact zips from ` +
    `https://github.com/bitcoindevkit/bdk-rn/releases/tag/${releaseTag}\n` +
    `  2. Verify their SHA-256 checksums against the "checksums" field in ` +
    `node_modules/bdk-rn/package.json\n` +
    `  3. Extract them into node_modules/bdk-rn/\n` +
    `Or point BDK_RN_ARTIFACTS_DIR at a directory containing the zips and reinstall.\n` +
    `To build from source instead, see https://github.com/bitcoindevkit/bdk-rn#readme`
  );
}

async function main() {
  if (process.env.BDK_RN_SKIP_POSTINSTALL) {
    log('BDK_RN_SKIP_POSTINSTALL is set, skipping binary download.');
    return;
  }

  const checksums = packageJson.checksums || {};
  const releaseTag = packageJson.releaseTag || `v${packageJson.version}`;

  const pending = ARTIFACTS.filter((artifact) => {
    if (artifact.platformGuard && process.platform !== artifact.platformGuard) {
      return false;
    }
    return !fs.existsSync(artifact.existsPath);
  });

  if (pending.length === 0) {
    log('Native binaries already present, nothing to do.');
    return;
  }

  if (pending.every((artifact) => !checksums[artifact.checksumKey])) {
    // Development checkout or git install: no checksums are recorded, so
    // there is nothing trustworthy to download. Build from source instead.
    log(
      'No artifact checksums found in package.json (development install?). ' +
        'Skipping binary download. Build the binaries with ' +
        '`just submodule-init && just submodule-apply-patch && just build-tarball`.'
    );
    return;
  }

  const localDir = process.env.BDK_RN_ARTIFACTS_DIR;

  for (const artifact of pending) {
    const expected = checksums[artifact.checksumKey];
    if (!expected) {
      log(`No checksum for ${artifact.name} artifact, skipping it.`);
      continue;
    }

    const zipPath = path.join(PACKAGE_ROOT, artifact.zipName);
    try {
      if (localDir) {
        const localZip = path.join(localDir, artifact.zipName);
        log(`Copying ${artifact.name} binaries from ${localZip}`);
        fs.copyFileSync(localZip, zipPath);
      } else {
        const url = `${BASE_URL}/${releaseTag}/${artifact.zipName}`;
        log(`Downloading ${artifact.name} binaries from ${url}`);
        await download(url, zipPath);
      }

      await verifyChecksum(zipPath, expected, artifact.zipName);
      log(`Checksum verified for ${artifact.zipName}`);
      extractZip(zipPath, PACKAGE_ROOT);
      log(`${artifact.name} binaries installed.`);
    } catch (error) {
      console.error(`[bdk-rn] Failed to install ${artifact.name} binaries.`);
      console.error(`[bdk-rn] ${error.message}`);
      console.error(`[bdk-rn] ${manualInstructions(releaseTag)}`);
      process.exit(1);
    } finally {
      fs.rmSync(zipPath, { force: true });
    }
  }
}

main().catch((error) => {
  console.error(`[bdk-rn] Unexpected error: ${error.message}`);
  process.exit(1);
});
