import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Button,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Network,
  NetworkKind,
  Mnemonic,
  DescriptorSecretKey,
  Descriptor,
  Wallet,
  Persister,
  KeychainKind,
  ElectrumClient,
  type AddressInfo,
} from 'bdk-rn';

// Hardcoded mnemonic for demo purposes only — never use this in production.
const DEMO_MNEMONIC =
  'awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome';

// Android emulator reaches the host machine via 10.0.2.2; iOS simulator uses localhost.
const ELECTRUM_URL = Platform.OS === 'android'
  ? 'tcp://10.0.2.2:60401'
  : 'tcp://localhost:60401';

export default function App() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [pendingBalance, setPendingBalance] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [log, setLog] = useState<string>('Initializing...');

  const walletRef = useRef<Wallet | null>(null);

  useEffect(() => {
    try {
      setLog('Generating wallet...');

      // NetworkKind.Test covers all test networks (Signet, Testnet, Testnet4)
      const mnemonic = Mnemonic.fromString(DEMO_MNEMONIC);
      const secretKey = new DescriptorSecretKey(NetworkKind.Test, mnemonic, undefined);
      const descriptor = Descriptor.newBip86(secretKey, KeychainKind.External, NetworkKind.Test);
      const persister = Persister.newInMemory();
      const wallet = Wallet.createSingle(descriptor, Network.Regtest, persister);

      walletRef.current = wallet as unknown as Wallet;

      const addressInfo: AddressInfo = wallet.revealNextAddress(KeychainKind.External);
      setAddress(addressInfo.address.toString());

      setLog('Wallet ready. Tap Sync to fetch balance.');
    } catch (err) {
      setLog(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncWallet = async () => {
    if (!walletRef.current) return;

    setSyncing(true);
    setLog('Connecting to Electrum...');

    try {
      const client = new ElectrumClient(ELECTRUM_URL);
      const fullScanRequest = walletRef.current.startFullScan().build();

      setLog('Scanning...');
      const update = await client.fullScan(fullScanRequest, BigInt(20), BigInt(20), false);

      walletRef.current.applyUpdate(update);

      const b = walletRef.current.balance();
      setBalance(b.confirmed.toSat().toString());
      setPendingBalance(
        (b.trustedPending.toSat() + b.untrustedPending.toSat()).toString()
      );
      setLog('Sync complete!');
    } catch (err) {
      setLog(`Sync error: ${err}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Setting up wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>BDK React Native</Text>
        <Text style={styles.logText}>{log}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Network</Text>
          <Text style={styles.value}>Regtest</Text>

          <Text style={styles.label}>Address</Text>
          <Text style={styles.address}>{address}</Text>

          <Text style={styles.label}>Mnemonic</Text>
          <Text style={styles.mnemonic} numberOfLines={1} ellipsizeMode="middle">
            {DEMO_MNEMONIC}
          </Text>
        </View>

        <View style={[styles.card, styles.balanceCard]}>
          <Text style={styles.label}>Confirmed Balance</Text>
          <Text style={styles.bigBalance}>
            {balance || '—'} <Text style={styles.sats}>sats</Text>
          </Text>

          <Text style={styles.label}>Pending</Text>
          <Text style={styles.smallBalance}>{pendingBalance || '—'} sats</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={syncing ? 'Syncing...' : 'Sync Wallet'}
            onPress={syncWallet}
            disabled={syncing}
          />
          {syncing && <ActivityIndicator style={{ marginLeft: 10 }} />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  scroll: { padding: 20, paddingBottom: 50 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  logText: { textAlign: 'center', color: '#666', marginBottom: 20 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  balanceCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#c8e6c9',
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: { fontSize: 16, color: '#333', marginBottom: 15, fontWeight: '500' },
  address: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#0066cc',
    marginBottom: 15,
    backgroundColor: '#f0f8ff',
    padding: 5,
    borderRadius: 4,
  },
  mnemonic: { fontSize: 14, color: '#555', fontStyle: 'italic' },
  bigBalance: { fontSize: 36, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  smallBalance: { fontSize: 18, color: '#666', fontWeight: '600' },
  sats: { fontSize: 16, color: '#888', fontWeight: 'normal' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: { marginTop: 10, fontSize: 16 },
});
