/**
 * Test constants ported from androidTest/kotlin/org/bitcoindevkit/Constants.kt
 */

import { Descriptor, NetworkKind } from 'bdk-rn';

// Test networks
export const TEST_EXTENDED_PRIVKEY =
  'tprv8ZgxMBicQKsPf2qfrEygW6fdYseJDDrVnDv26PH5BHdvSuG6ecCbHqLVof9yZcMoM31z9ur3tTYbSnr1WBqbGX97CbXcmp5H6qeMpyvx35B';
export const BIP84_TEST_RECEIVE_PATH = '84h/1h/0h/0';
export const BIP84_TEST_CHANGE_PATH = '84h/1h/0h/1';
export const BIP86_TEST_RECEIVE_PATH = '86h/1h/0h/0';
export const BIP86_TEST_CHANGE_PATH = '86h/1h/0h/1';

// Mainnet
export const MAINNET_EXTENDED_PRIVKEY =
  'xprv9s21ZrQH143K3LRcTnWpaCSYb75ic2rGuSgicmJhSVQSbfaKgPXfa8PhnYszgdcyWLoc8n1E2iHUnskjgGTAyCEpJYv7fqKxUcRNaVngA1V';
export const BIP84_MAINNET_RECEIVE_PATH = '84h/0h/0h/1';
export const BIP86_MAINNET_RECEIVE_PATH = '86h/0h/0h/1';

export const BIP84_DESCRIPTOR = new Descriptor(
  `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_RECEIVE_PATH}/*)`,
  NetworkKind.Test
);
export const BIP84_CHANGE_DESCRIPTOR = new Descriptor(
  `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_CHANGE_PATH}/*)`,
  NetworkKind.Test
);
export const BIP86_DESCRIPTOR = new Descriptor(
  `tr(${TEST_EXTENDED_PRIVKEY}/${BIP86_TEST_RECEIVE_PATH}/*)`,
  NetworkKind.Test
);
export const BIP86_CHANGE_DESCRIPTOR = new Descriptor(
  `tr(${TEST_EXTENDED_PRIVKEY}/${BIP86_TEST_CHANGE_PATH}/*)`,
  NetworkKind.Test
);
export const NON_EXTENDED_DESCRIPTOR_0 = new Descriptor(
  `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_RECEIVE_PATH}/0)`,
  NetworkKind.Test
);
export const NON_EXTENDED_DESCRIPTOR_1 = new Descriptor(
  `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_RECEIVE_PATH}/1)`,
  NetworkKind.Test
);

// Using the MNEMONIC_AWESOME
export const TEST_EXTENDED_PRIVKEY_0 =
  'tprv8ZgxMBicQKsPdWAHbugK2tjtVtRjKGixYVZUdL7xLHMgXZS6BFbFi1UDb1CHT25Z5PU1F9j7wGxwUiRhqz9E3nZRztikGUV6HoRDYcqPhM4';
export const BIP84_TEST_RECEIVE_PATH_0 = '84h/1h/0h/0';
export const TEST_BIP84_DESCRIPTOR_0 = new Descriptor(
  `wpkh(${TEST_EXTENDED_PRIVKEY_0}/${BIP84_TEST_RECEIVE_PATH_0}/*)`,
  NetworkKind.Test
);
