/**
 * Integration test for BDK Wallet creation
 * Ported from androidTest/kotlin/org/bitcoindevkit/CreatingWalletTest.kt
 */

import { Wallet, Persister, Network, Descriptor } from 'bdk-rn';
import { describe, it, expect } from './testRunner';
import {
  BIP84_DESCRIPTOR,
  BIP84_CHANGE_DESCRIPTOR,
  BIP86_DESCRIPTOR,
  BIP86_CHANGE_DESCRIPTOR,
  NON_EXTENDED_DESCRIPTOR_0,
  NON_EXTENDED_DESCRIPTOR_1,
  TEST_EXTENDED_PRIVKEY,
} from './constants';

export function runCreatingWalletTests() {
  describe('Creating Wallet Tests', () => {
    // Create a WPKH wallet.
    it('should create a WPKH wallet', () => {
      const conn = Persister.newInMemory();

      const wallet = new Wallet(
        BIP84_DESCRIPTOR,
        BIP84_CHANGE_DESCRIPTOR,
        Network.Testnet,
        conn
      );

      expect(wallet).toBeDefined();
    });

    // Create a TR wallet.
    it('should create a TR wallet', () => {
      const conn = Persister.newInMemory();

      const wallet = new Wallet(
        BIP86_DESCRIPTOR,
        BIP86_CHANGE_DESCRIPTOR,
        Network.Testnet,
        conn
      );

      expect(wallet).toBeDefined();
    });

    // Create a wallet with a non-extended descriptor.
    it('should create a wallet with non-extended descriptor', () => {
      const conn = Persister.newInMemory();

      const wallet = new Wallet(
        NON_EXTENDED_DESCRIPTOR_0,
        NON_EXTENDED_DESCRIPTOR_1,
        Network.Testnet,
        conn
      );

      expect(wallet).toBeDefined();
    });

    // Create a wallet with a single descriptor.
    it('should create a wallet with single descriptor', () => {
      const conn = Persister.newInMemory();

      const wallet = Wallet.createSingle(BIP86_DESCRIPTOR, Network.Testnet, conn);

      expect(wallet).toBeDefined();
    });

    // Create a wallet with a public multipath descriptor.
    it('should create a wallet with multipath descriptor', () => {
      const conn = Persister.newInMemory();

      const multipathDescriptor = new Descriptor(
        'wpkh([9a6a2580/84\'/0\'/0\']xpub6DEzNop46vmxR49zYWFnMwmEfawSNmAMf6dLH5YKDY463twtvw1XD7ihwJRLPRGZJz799VPFzXHpZu6WdhT29WnaeuChS6aZHZPFmqczR5K/<0;1>/*)',
        Network.Bitcoin
      );

      const wallet = Wallet.createFromTwoPathDescriptor(
        multipathDescriptor,
        Network.Bitcoin,
        conn
      );

      expect(wallet).toBeDefined();
    });

    // You cannot create a private multipath descriptor.
    it('should throw error when creating private multipath descriptor', () => {
      expect(() => {
        new Descriptor(
          `${TEST_EXTENDED_PRIVKEY}/<0;1>/*)`,
          Network.Testnet
        );
      }).toThrow();
    });

    // Descriptors do not match provided network.
    it('should throw error when descriptors dont match network', () => {
      const conn = Persister.newInMemory();

      // The descriptors provided are for Testnet 3, but the wallet attempts to build for Mainnet
      expect(() => {
        new Wallet(
          NON_EXTENDED_DESCRIPTOR_0,
          NON_EXTENDED_DESCRIPTOR_1,
          Network.Bitcoin,
          conn
        );
      }).toThrow();
    });
  });
}
