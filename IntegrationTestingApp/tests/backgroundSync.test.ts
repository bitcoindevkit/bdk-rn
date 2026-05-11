/**
 * Integration test for background sync behaviour.
 *
 * This test verifies that sync operations do not block the JS thread.
 * A setInterval counter runs concurrently with the sync call; if the JS
 * thread were blocked the counter would stay at zero for the duration.
 *
 * Requires network access to the Signet Esplora endpoint.
 */

import {
  Network,
  NetworkKind,
  Descriptor,
  Wallet,
  Persister,
  KeychainKind,
  EsploraClient,
} from 'bdk-rn';
import { describe, it, expect } from './testRunner';
import {
  TEST_EXTENDED_PRIVKEY,
  BIP84_TEST_RECEIVE_PATH,
  BIP84_TEST_CHANGE_PATH,
} from './constants';

// const SIGNET_ESPLORA_URL = 'https://blockstream.info/signet/api';
const REGTEST_ESPLORA_URL = 'http://10.0.2.2:3002'

export function runBackgroundSyncTests() {
  describe('Background Sync Tests', () => {
    it('esplora sync does not block the JS thread', async () => {
      const externalDescriptor = new Descriptor(
        `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_RECEIVE_PATH}/*)`,
        NetworkKind.Test
      );
      const changeDescriptor = new Descriptor(
        `wpkh(${TEST_EXTENDED_PRIVKEY}/${BIP84_TEST_CHANGE_PATH}/*)`,
        NetworkKind.Test
      );

      const persister = Persister.newInMemory();
      const wallet = new Wallet(
        externalDescriptor,
        changeDescriptor,
        Network.Regtest,
        persister
      );

      const addr0 = wallet.revealNextAddress(KeychainKind.External);
      const addr1 = wallet.revealNextAddress(KeychainKind.External);
      const addr2 = wallet.revealNextAddress(KeychainKind.External);
      console.log(`  Syncing addresses:`);
      console.log(`    [${addr0.index}] ${addr0.address.toQrUri()}`);
      console.log(`    [${addr1.index}] ${addr1.address.toQrUri()}`);
      console.log(`    [${addr2.index}] ${addr2.address.toQrUri()}`);

      const syncRequest = wallet.startSyncWithRevealedSpks().build();
      const client = new EsploraClient(REGTEST_ESPLORA_URL, undefined);

      let ticks = 0;
      const interval = setInterval(() => { ticks++; }, 50);

      try {
        const update = await client.sync(syncRequest, 1n);
        wallet.applyUpdate(update);
      } catch (e: any) {
        clearInterval(interval);
        const detail = e?.inner
          ? `${e.tag}: status=${e.inner.status ?? 'n/a'}, message="${e.inner.errorMessage ?? e.inner}"`
          : String(e);
        throw new Error(`Esplora sync failed — ${detail}`);
      } finally {
        clearInterval(interval);
      }

      console.log(`  Esplora sync ticks=${ticks}`);
      expect(ticks).toBeGreaterThan(0);
    });
  });
}
