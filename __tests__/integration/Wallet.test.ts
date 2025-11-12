/**
 * Integration test for BDK Wallet functionality
 *
 * This test requires:
 * - Native module to be built for Android
 * - Test to run on Android emulator or device
 *
 * Run with: yarn test:android
 */

import {
  Network,
  Mnemonic,
  DescriptorSecretKey,
  Descriptor,
  Wallet,
  Persister,
  KeychainKind,
} from 'bdk-rn';

describe('Wallet Integration Tests', () => {
  it('should create a wallet and generate an address', () => {
    // Use a known mnemonic for reproducibility
    const knownMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const mnemonic = Mnemonic.fromString(knownMnemonic);

    // Create descriptor secret key from mnemonic
    const secretKey = new DescriptorSecretKey(
      Network.Signet,
      mnemonic,
      undefined
    );

    expect(secretKey).toBeDefined();

    // Create descriptor using BIP86 (Taproot)
    const descriptor = Descriptor.newBip86(
      secretKey,
      KeychainKind.External,
      Network.Signet
    );

    expect(descriptor).toBeDefined();

    // Create in-memory persister
    const persister = Persister.newInMemory();

    // Create wallet
    const wallet = Wallet.createSingle(
      descriptor,
      Network.Signet,
      persister
    );

    expect(wallet).toBeDefined();

    // Get first address
    const addressInfo = wallet.revealNextAddress(KeychainKind.External);

    expect(addressInfo).toBeDefined();
    expect(addressInfo.address).toBeDefined();
    expect(addressInfo.index).toBe(0);

    // Verify the address is a valid string
    const addressString = addressInfo.address.toString();
    expect(typeof addressString).toBe('string');
    expect(addressString.length).toBeGreaterThan(0);
  });

  it('should generate deterministic addresses from same mnemonic', () => {
    // Use the same mnemonic twice and verify we get the same address
    const knownMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    // First wallet
    const mnemonic1 = Mnemonic.fromString(knownMnemonic);
    const secretKey1 = new DescriptorSecretKey(Network.Signet, mnemonic1, undefined);
    const descriptor1 = Descriptor.newBip86(secretKey1, KeychainKind.External, Network.Signet);
    const persister1 = Persister.newInMemory();
    const wallet1 = Wallet.createSingle(descriptor1, Network.Signet, persister1);
    const address1 = wallet1.revealNextAddress(KeychainKind.External);

    // Second wallet with same mnemonic
    const mnemonic2 = Mnemonic.fromString(knownMnemonic);
    const secretKey2 = new DescriptorSecretKey(Network.Signet, mnemonic2, undefined);
    const descriptor2 = Descriptor.newBip86(secretKey2, KeychainKind.External, Network.Signet);
    const persister2 = Persister.newInMemory();
    const wallet2 = Wallet.createSingle(descriptor2, Network.Signet, persister2);
    const address2 = wallet2.revealNextAddress(KeychainKind.External);

    // Both wallets should generate the same first address
    expect(address1.address.toString()).toBe(address2.address.toString());
    expect(address1.index).toBe(address2.index);
  });
});
