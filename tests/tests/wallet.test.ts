/**
 * Integration test for BDK Wallet functionality
 *
 * This test requires:
 * - Native module to be built for Android
 * - Test to run on Android emulator or device
 */

import {
  Network,
  NetworkKind,
  Mnemonic,
  DescriptorSecretKey,
  Descriptor,
  Wallet,
  Persister,
  KeychainKind,
} from 'bdk-rn';
import { describe, it, expect } from './testRunner';
import { BIP84_DESCRIPTOR, BIP84_CHANGE_DESCRIPTOR } from './constants';

export function runWalletTests() {
  describe('Wallet Integration Tests', () => {
    it('should create a wallet and generate an address', () => {
      // Use a known mnemonic for reproducibility
      const knownMnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const mnemonic = Mnemonic.fromString(knownMnemonic);

      // Create descriptor secret key from mnemonic
      const secretKey = new DescriptorSecretKey(
        NetworkKind.Test,
        mnemonic,
        undefined
      );

      expect(secretKey).toBeDefined();

      // Create descriptor using BIP86 (Taproot)
      const descriptor = Descriptor.newBip86(
        secretKey,
        KeychainKind.External,
        NetworkKind.Test
      );

      expect(descriptor).toBeDefined();

      // Create in-memory persister
      const persister = Persister.newInMemory();

      // Create wallet
      const wallet = Wallet.createSingle(descriptor, Network.Signet, persister);

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
      const knownMnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

      // First wallet
      const mnemonic1 = Mnemonic.fromString(knownMnemonic);
      const secretKey1 = new DescriptorSecretKey(
        NetworkKind.Test,
        mnemonic1,
        undefined
      );
      const descriptor1 = Descriptor.newBip86(
        secretKey1,
        KeychainKind.External,
        NetworkKind.Test
      );
      const persister1 = Persister.newInMemory();
      const wallet1 = Wallet.createSingle(
        descriptor1,
        Network.Signet,
        persister1
      );
      const address1 = wallet1.revealNextAddress(KeychainKind.External);

      // Second wallet with same mnemonic
      const mnemonic2 = Mnemonic.fromString(knownMnemonic);
      const secretKey2 = new DescriptorSecretKey(
        NetworkKind.Test,
        mnemonic2,
        undefined
      );
      const descriptor2 = Descriptor.newBip86(
        secretKey2,
        KeychainKind.External,
        NetworkKind.Test
      );
      const persister2 = Persister.newInMemory();
      const wallet2 = Wallet.createSingle(
        descriptor2,
        Network.Signet,
        persister2
      );
      const address2 = wallet2.revealNextAddress(KeychainKind.External);

      // Both wallets should generate the same first address
      expect(address1.address.toString()).toBe(address2.address.toString());
      expect(address1.index).toBe(address2.index);
    });

    // Ported from androidTest: Wallet produces valid addresses for its network.
    it('should produce valid addresses for its network', () => {
      const conn = Persister.newInMemory();
      const wallet = new Wallet(
        BIP84_DESCRIPTOR,
        BIP84_CHANGE_DESCRIPTOR,
        Network.Testnet,
        conn
      );
      const addressInfo = wallet.revealNextAddress(KeychainKind.External);

      // Address should be valid for Testnet 3, Testnet 4, and Signet
      expect(addressInfo.address.isValidForNetwork(Network.Testnet)).toBe(true);
      expect(addressInfo.address.isValidForNetwork(Network.Testnet4)).toBe(true);
      expect(addressInfo.address.isValidForNetwork(Network.Signet)).toBe(true);

      // Address should NOT be valid for Regtest and Bitcoin
      expect(addressInfo.address.isValidForNetwork(Network.Regtest)).toBe(false);
      expect(addressInfo.address.isValidForNetwork(Network.Bitcoin)).toBe(false);
    });

    // Ported from androidTest: Wallet has 0 balance prior to sync.
    it('should have 0 balance for new wallet', () => {
      const conn = Persister.newInMemory();
      const wallet = new Wallet(
        BIP84_DESCRIPTOR,
        BIP84_CHANGE_DESCRIPTOR,
        Network.Testnet,
        conn
      );

      // toSat() returns a bigint, so we compare with 0n
      expect(wallet.balance().total.toSat()).toBe(0n);
    });

    // Ported from androidTest: Single-descriptor wallets return an address on the external keychain
    it('should create addresses for single descriptor wallet', () => {
      const conn = Persister.newInMemory();
      const wallet = Wallet.createSingle(
        BIP84_DESCRIPTOR,
        Network.Testnet,
        conn
      );
      const address1 = wallet.peekAddress(KeychainKind.External, 0);
      const address2 = wallet.peekAddress(KeychainKind.Internal, 0);

      // Addresses should be the same for both keychains in a single-descriptor wallet
      expect(address1.address.toString()).toBe(address2.address.toString());
    });
  });
}
