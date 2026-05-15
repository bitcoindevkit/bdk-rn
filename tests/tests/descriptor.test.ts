/**
 * Integration test for BDK Descriptor functionality
 * Ported from androidTest/kotlin/org/bitcoindevkit/DescriptorTest.kt
 */

import { Descriptor, NetworkKind } from 'bdk-rn';
import { describe, it, expect } from './testRunner';
import {
  TEST_EXTENDED_PRIVKEY,
  BIP84_TEST_RECEIVE_PATH,
  BIP86_TEST_RECEIVE_PATH,
  MAINNET_EXTENDED_PRIVKEY,
  BIP84_MAINNET_RECEIVE_PATH,
  BIP86_MAINNET_RECEIVE_PATH,
} from './constants';

export function runDescriptorTests() {
  describe('Descriptor Integration Tests', () => {
    // Create extended WPKH descriptors for all networks.
    it('should create extended WPKH descriptors for all networks', () => {
      new Descriptor(
        `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_RECEIVE_PATH}/*)`,
        NetworkKind.Test
      );
      new Descriptor(
        `wpkh(${MAINNET_EXTENDED_PRIVKEY}/${BIP84_MAINNET_RECEIVE_PATH}/*)`,
        NetworkKind.Main
      );
    });

    // Create extended TR descriptors for all networks.
    it('should create extended TR descriptors for all networks', () => {
      new Descriptor(
        `tr(${TEST_EXTENDED_PRIVKEY}/${BIP86_TEST_RECEIVE_PATH}/*)`,
        NetworkKind.Test
      );
      new Descriptor(
        `tr(${MAINNET_EXTENDED_PRIVKEY}/${BIP86_MAINNET_RECEIVE_PATH}/*)`,
        NetworkKind.Main
      );
    });

    // Create non-extended descriptors for all networks.
    it('should create non-extended descriptors for all networks', () => {
      new Descriptor(
        `tr(${TEST_EXTENDED_PRIVKEY}/${BIP86_TEST_RECEIVE_PATH}/0)`,
        NetworkKind.Test
      );
      new Descriptor(
        `tr(${MAINNET_EXTENDED_PRIVKEY}/${BIP86_MAINNET_RECEIVE_PATH}/0)`,
        NetworkKind.Main
      );
    });

    // Cannot create addr() descriptor.
    it('should throw error when creating addr() descriptor', () => {
      expect(() => {
        new Descriptor(
          'addr(tb1qhjys9wxlfykmte7ftryptx975uqgd6kcm6a7z4)',
          NetworkKind.Test
        );
      }).toThrow();
    });
  });
}
