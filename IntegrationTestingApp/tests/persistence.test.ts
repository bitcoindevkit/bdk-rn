/**
 * Integration test for BDK Persistence functionality
 * Ported from androidTest/kotlin/org/bitcoindevkit/PersistenceTest.kt
 */

import { Wallet, Persister, Descriptor, Network, NetworkKind, KeychainKind } from 'bdk-rn';
import { describe, it, expect } from './testRunner';
import { TEST_BIP84_DESCRIPTOR_0 } from './constants';
import { copyDatabaseFromAssets, cleanupDatabaseFiles } from './testAssets';

export function runPersistenceTests() {
  describe('Persistence Integration Tests', () => {
    const descriptor = new Descriptor(
      'wpkh(tprv8ZgxMBicQKsPf2qfrEygW6fdYseJDDrVnDv26PH5BHdvSuG6ecCbHqLVof9yZcMoM31z9ur3tTYbSnr1WBqbGX97CbXcmp5H6qeMpyvx35B/84h/1h/0h/0/*)',
      NetworkKind.Test
    );
    const changeDescriptor = new Descriptor(
      'wpkh(tprv8ZgxMBicQKsPf2qfrEygW6fdYseJDDrVnDv26PH5BHdvSuG6ecCbHqLVof9yZcMoM31z9ur3tTYbSnr1WBqbGX97CbXcmp5H6qeMpyvx35B/84h/1h/0h/1/*)',
      NetworkKind.Test
    );

    // Ported from androidTest: Correctly load wallet from sqlite persistence
    it('should correctly load wallet from sqlite persistence', async () => {
      const dbPath = await copyDatabaseFromAssets('persistence_test_db.sqlite3');

      try {
        const connection = Persister.newSqlite(dbPath);
        const wallet = Wallet.load(descriptor, changeDescriptor, connection);
        const addressInfo = wallet.revealNextAddress(KeychainKind.External);

        expect(addressInfo.index).toBe(7);
        expect(addressInfo.address.toString()).toBe(
          'tb1qan3lldunh37ma6c0afeywgjyjgnyc8uz975zl2'
        );
      } finally {
        // Clean up
        await cleanupDatabaseFiles([dbPath]);
      }
    });

    // Ported from androidTest: Load single descriptor wallet from persistence
    it('should load single descriptor wallet from persistence', async () => {
      const dbPath = await copyDatabaseFromAssets(
        'single_descriptor_wallet.sqlite3'
      );

      try {
        const db = Persister.newSqlite(dbPath);
        const wallet = Wallet.loadSingle(TEST_BIP84_DESCRIPTOR_0, db);
        const addressInfo = wallet.revealNextAddress(KeychainKind.External);

        expect(addressInfo.index).toBe(1);
        expect(addressInfo.address.toString()).toBe(
          'bcrt1q8nv72uahwegcg00n626dayvvcekjncehv3668f'
        );
      } finally {
        // Clean up
        await cleanupDatabaseFiles([dbPath]);
      }
    });
  });
}
