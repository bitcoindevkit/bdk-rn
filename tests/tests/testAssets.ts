/**
 * Utility for copying test assets from app bundle to writable location
 */

import RNFS from 'react-native-fs';

/**
 * Copies a database file from the Android assets folder to a writable location
 * @param assetFileName The name of the file in the assets folder
 * @returns The absolute path to the copied file
 */
export async function copyDatabaseFromAssets(
  assetFileName: string
): Promise<string> {
  // Destination path in the app's document directory
  const destPath = `${RNFS.DocumentDirectoryPath}/${assetFileName}`;

  // Check if file already exists at destination
  const exists = await RNFS.exists(destPath);
  if (exists) {
    // Delete existing file to ensure fresh copy
    await RNFS.unlink(destPath);
  }

  // Copy the file from assets
  await RNFS.copyFileAssets(assetFileName, destPath);

  return destPath;
}

/**
 * Cleans up test database files
 * @param filePaths Array of file paths to delete
 */
export async function cleanupDatabaseFiles(
  filePaths: string[]
): Promise<void> {
  for (const filePath of filePaths) {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  }
}
