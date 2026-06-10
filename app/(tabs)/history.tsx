import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/ui/app-header';
import { useAppContext } from '../_GlobalContext';

export default function HistoryScreen() {
  const { score, enquetes, tituloEnquete, confirmados, totalConvidados, colors } = useAppContext();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingBottom: 18 }]}> 
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <AppHeader title="Meu Histórico" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Sua Pontuação</Text>

        <View style={[styles.podiumCard, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
          <Text style={[styles.podiumText, { color: colors.subtitle }]}>Você</Text>
          <View style={[styles.podiumBar, { backgroundColor: colors.background, borderColor: colors.primary }]}> 
            <Text style={[styles.podiumNumber, { color: colors.text }]}>{score || 0}</Text>
          </View>
          <Text style={[styles.podiumScore, { color: colors.subtitle }]}>{score || 0} pts</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30, color: colors.text }]}>🕰️ Histórico de Resenhas</Text>

        {(!enquetes || enquetes.length === 0) ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
            <Ionicons name="calendar-outline" size={40} color={colors.subtitle} />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>Nenhuma resenha criada ainda.</Text>
          </View>
        ) : (
          enquetes.map((enquete: any, index: number) => {
            const isAtiva = enquete.status === 'ativa' && enquete.titulo === tituloEnquete;
            const total = isAtiva ? Number(totalConvidados) || 0 : enquete.presentes || 0;
            const confirmadosValue = isAtiva ? Number(confirmados) || 0 : enquete.presentes || 0;
            const porcentagemCalc = total > 0 ? Math.round((confirmadosValue / total) * 100) : 0;
            const porcentagem = Math.min(100, Math.max(0, porcentagemCalc));

            return (
              <View key={index} style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
                <View style={styles.recordHeader}>
                  <Text
                    style={[
                      styles.recordTag,
                      {
                        backgroundColor: isAtiva ? colors.success : colors.menuButtonBg,
                        color: isAtiva ? colors.avatarText : colors.subtitle,
                      },
                    ]}
                  >
                    {isAtiva ? 'ATIVA' : 'FINALIZADA'}
                  </Text>
                  <Text style={[styles.recordDate, { color: colors.subtitle }]}>{enquete.dataCriacao}</Text>
                </View>
                <Text style={[styles.recordTitle, { color: colors.text }]}>{enquete.titulo}</Text>
                {enquete.locais?.length > 0 && (
                  <View style={styles.recordGroup}>
                    <Text style={[styles.recordLabel, { color: colors.text }]}>Locais sugeridos</Text>
                    {enquete.locais.map((local: string, idx: number) => (
                      <Text key={idx} style={[styles.recordItem, { color: colors.subtitle }]}>• {local}</Text>
                    ))}
                  </View>
                )}
                {enquete.datas?.length > 0 && (
                  <View style={styles.recordGroup}>
                    <Text style={[styles.recordLabel, { color: colors.text }]}>Datas sugeridas</Text>
                    {enquete.datas.map((data: string, idx: number) => (
                      <Text key={idx} style={[styles.recordItem, { color: colors.subtitle }]}>• {data}</Text>
                    ))}
                  </View>
                )}
                <View style={styles.percentageRow}>
                  <View style={[styles.percentageCircle, { backgroundColor: colors.background, borderColor: colors.menuButtonBg }]}> 
                    <View style={[styles.percentageFill, { height: `${porcentagem}%`, backgroundColor: isAtiva ? colors.success : colors.subtitle }]} />
                    <View style={styles.percentageValueWrap}>
                      <Text style={[styles.percentageValue, { color: colors.text }]}>{porcentagem}%</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.percentageLabel, { color: colors.text }]}>{isAtiva ? 'Aguardando votos' : 'Presença final'}</Text>
                    <Text style={[styles.percentageSub, { color: colors.subtitle }]}>{confirmadosValue} confirmados</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#0F1724', marginBottom: 18 },
  podiumCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  podiumText: { color: '#64748B', fontSize: 14, fontWeight: '800', marginBottom: 14 },
  podiumBar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F8FAFC', borderWidth: 8, borderColor: '#FACC15', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  podiumNumber: { fontSize: 42, fontWeight: '900', color: '#0F1724' },
  podiumScore: { fontSize: 13, fontWeight: '800', color: '#64748B' },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { marginTop: 14, color: '#64748B', fontSize: 15, textAlign: 'center' },
  recordCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22, marginBottom: 18, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recordTag: { fontSize: 11, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  activeTag: { backgroundColor: '#DCFCE7', color: '#166534' },
  closedTag: { backgroundColor: '#E2E8F0', color: '#475569' },
  recordDate: { fontSize: 12, color: '#94A3B8' },
  recordTitle: { fontSize: 20, fontWeight: '900', color: '#0F1724', marginBottom: 16 },
  recordGroup: { marginBottom: 14 },
  recordLabel: { fontSize: 13, fontWeight: '800', color: '#0F1724', marginBottom: 6 },
  recordItem: { fontSize: 14, color: '#64748B', marginLeft: 10, marginBottom: 4 },
  percentageRow: { flexDirection: 'row', alignItems: 'center' },
  percentageCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', justifyContent: 'flex-end', marginRight: 16 },
  percentageFill: { width: '100%' },
  percentageValueWrap: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  percentageValue: { fontSize: 14, fontWeight: '900', color: '#0F1724' },
  percentageLabel: { fontSize: 15, fontWeight: '800', color: '#0F1724' },
  percentageSub: { fontSize: 13, color: '#64748B', marginTop: 4 },
});
