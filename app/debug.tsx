import React, { useState } from 'react';
import { Alert, Button, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from './_GlobalContext';

export default function DebugScreen() {
  const { user, pendingGroupInvites, votosRegistrados, enquetes, setEnqueteAtivaId, refreshAppData, attemptRegisterPush } = useAppContext() as any;
  const [refreshing, setRefreshing] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        overScrollMode="always"
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refreshAppData();
              setRefreshing(false);
            }}
            colors={[/* fallback color */'#0F41D4']}
          />
        }
      >
        <Text style={styles.heading}>Debug Info</Text>
        <View style={styles.block}>
          <Text style={styles.label}>User</Text>
          <Text>{user ? `${user.name} <${user.email}> (${user.id})` : 'null'}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Pending Group Invites</Text>
          {pendingGroupInvites.length === 0 ? (
            <Text>(none)</Text>
          ) : (
            pendingGroupInvites.map((inv) => (
              <View key={inv.id} style={{ marginBottom: 8 }}>
                <Text>{inv.groupName} → {inv.toEmail} ({inv.status})</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Enquetes (sample)</Text>
          {enquetes.slice(0, 6).map((e) => (
            <View key={e.id} style={{ marginBottom: 8 }}>
              <Text>{e.id} — {e.titulo} — {e.status}</Text>
            </View>
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Votos registrados (sample)</Text>
          {votosRegistrados.slice(0, 10).map((v) => (
            <Text key={v.id}>{v.enqueteId} — {v.memberId} — {v.tipo}</Text>
          ))}
        </View>

        <Button title="Set first enquete as active" onPress={() => { if (enquetes[0]) setEnqueteAtivaId(enquetes[0].id); }} />
        <View style={{ height: 8 }} />
        <Button
          title="Register Push Token (manual)"
          onPress={async () => {
            try {
              await attemptRegisterPush();
              Alert.alert('Registro', 'Tentativa de registro de push executada. Veja logs para detalhes.');
            } catch (err) {
              Alert.alert('Erro', String(err));
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  block: { marginBottom: 14 },
  label: { fontWeight: '700', marginBottom: 6 },
});
