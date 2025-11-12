/**
 * Integration test for BDK Mnemonic functionality
 *
 * This test requires:
 * - Native module to be built for Android
 * - Test to run on Android emulator or device
 *
 * Run with: yarn test:android
 */

import { Mnemonic, WordCount } from 'bdk-rn';

describe('Mnemonic Integration Tests', () => {
  it('should create a new 12-word mnemonic', () => {
    const mnemonic = new Mnemonic(WordCount.Words12);

    expect(mnemonic).toBeDefined();

    // Convert to string and verify it has 12 words
    const mnemonicString = mnemonic.toString();
    const words = mnemonicString.split(' ');

    expect(words.length).toBe(12);
    expect(mnemonicString.length).toBeGreaterThan(0);
  });

  it('should parse a valid mnemonic string and recreate it', () => {
    // Use a known valid 12-word mnemonic (from BIP39 standard)
    const knownMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const mnemonic = Mnemonic.fromString(knownMnemonic);
    expect(mnemonic).toBeDefined();

    // Verify we can get the string back
    const recreatedString = mnemonic.toString();
    expect(recreatedString).toBe(knownMnemonic);
  });

  it('should create a 24-word mnemonic', () => {
    const mnemonic = new Mnemonic(WordCount.Words24);

    expect(mnemonic).toBeDefined();

    const mnemonicString = mnemonic.toString();
    const words = mnemonicString.split(' ');

    expect(words.length).toBe(24);
  });

  it('should throw error for invalid mnemonic string', () => {
    const invalidMnemonic = 'invalid mnemonic words that are not real';

    expect(() => {
      Mnemonic.fromString(invalidMnemonic);
    }).toThrow();
  });
});
