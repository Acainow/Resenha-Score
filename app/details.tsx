import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Easing, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/ui/app-header';
import { useAppContext } from './_GlobalContext';

export default function DetailsScreen() {
  const router = useRouter();
  const { enqueteId } = useLocalSearchParams() as { enqueteId?: string };
  const { score, setScore, tituloEnquete, confirmados, setConfirmados, totalConvidados, encerrarResenha, ponderada, enquetes, votosRegistrados, setVotosRegistrados, user, enqueteAtivaId } = useAppContext();
  const [votoAtual, setVotoAtual] = useState<'sim' | 'nao' | 'talvez' | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const animatedPercent = React.useRef(new Animated.Value(0)).current;

  const { colors } = useAppContext();
  const voteMemberId = user?.id || user?.email || 'anonymous';
  const currentEnquete =
    enquetes.find((e) => e.id === enqueteId) ||
    enquetes.find((e) => e.id === enqueteAtivaId) ||
    enquetes.find((e) => e.status === 'ativa') ||
    enquetes.find((e) => e.titulo === tituloEnquete) ||
    null;
  const resolvedEnquete = currentEnquete;
  const canFinalize = !!resolvedEnquete;
  const probabilidadeCalc = totalConvidados > 0 ? Math.round((confirmados / totalConvidados) * 100) : 0;
  const probabilidade = Math.max(0, Math.min(100, probabilidadeCalc));

  useEffect(() => {
    Animated.timing(animatedPercent, {
      toValue: probabilidade,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [probabilidade, animatedPercent]);

  // Auto-finalize removed: manual finalization required by users.

  useEffect(() => {
    if (!tituloEnquete && !resolvedEnquete) {
      setVotoAtual(null);
      return;
    }

    const enqueteId = resolvedEnquete?.id || enquetes.find((e) => e.titulo === tituloEnquete)?.id;
    const votoAtualRegistrado = votosRegistrados.find(
      (v) => v.enqueteId === enqueteId && v.memberId === voteMemberId
    );

    setVotoAtual(votoAtualRegistrado ? votoAtualRegistrado.tipo : null);
  }, [tituloEnquete, enquetes, votosRegistrados]);

  const confirmarVoto = (tipoVoto: 'sim' | 'nao' | 'talvez') => {
    if (votoAtual === tipoVoto) return;

    const previousVoteCount = votoAtual === 'sim' ? 1 : votoAtual === 'talvez' ? 0.5 : 0;
    const nextVoteCount = tipoVoto === 'sim' ? 1 : tipoVoto === 'talvez' ? 0.5 : 0;

    setConfirmados((prev: number) => Math.max(0, prev - previousVoteCount + nextVoteCount));

    setScore((prev: number) => {
      let nextScore = prev;
      if (votoAtual === 'sim') nextScore -= 10;
      if (votoAtual === 'nao') nextScore += 5;
      if (tipoVoto === 'sim') nextScore += 10;
      if (tipoVoto === 'nao') nextScore -= 5;
      return nextScore;
    });

    const enqueteId = resolvedEnquete?.id || enquetes.find((e) => e.titulo === tituloEnquete)?.id || '';
    if (enqueteId) {
      const novoVoto = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        enqueteId,
        memberId: voteMemberId,
        tipo: tipoVoto,
        timestamp: Date.now(),
      };
      const votosAtualizados = votosRegistrados.filter(
        (v) => !(v.enqueteId === enqueteId && v.memberId === voteMemberId)
      );
      setVotosRegistrados([...votosAtualizados, novoVoto]);
    }

    setVotoAtual(tipoVoto);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <AppHeader title={tituloEnquete || resolvedEnquete?.titulo ? `Resenha: ${tituloEnquete || resolvedEnquete?.titulo}` : 'Detalhes'} showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.chartContainer}>
          <View style={[styles.circleGraphic, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
            <Text style={[styles.probLabel, { color: colors.primary }]}>PROBABILIDADE</Text>
            <Text style={[styles.probValue, { color: colors.text }]}>{probabilidade}%</Text>
            <View style={[styles.progressBarBackground, { backgroundColor: colors.menuButtonBg }]}>
              <Animated.View
                style={{
                  width: animatedPercent.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                  height: '100%',
                  backgroundColor: colors.success,
                  borderRadius: 999,
                }}
              />
            </View>
            <View style={[styles.probBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="trending-up" size={12} color={colors.avatarText} />
              <Text style={[styles.probBadgeText, { color: colors.avatarText }]}>ALTO ENGAJAMENTO</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.mainHeading, { color: colors.text }]}>Grande chance de{`\n`}acontecer!</Text>
        <Text style={[styles.subHeading, { color: colors.subtitle }]}>{confirmados} membros confirmaram{`\n`}presença. A vibe está incrível.</Text>

        <Text style={styles.sectionLabel}>CONFIRMAR PRESENÇA</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.card, borderColor: colors.menuButtonBg },
              votoAtual === 'sim' ? [styles.actionBtnSim, { backgroundColor: colors.success, borderColor: colors.success }] : {},
            ]}
            onPress={() => confirmarVoto('sim')}
          >
            <Ionicons name="checkmark-circle" size={24} color={votoAtual === 'sim' ? colors.avatarText : colors.text} />
            <Text style={votoAtual === 'sim' ? styles.actionBtnTextActive : [styles.actionBtnText, { color: colors.text }]}>Sim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.card, borderColor: colors.menuButtonBg },
              votoAtual === 'nao' ? [styles.actionBtnNao, { backgroundColor: '#F97316', borderColor: '#F97316' }] : {},
            ]}
            onPress={() => confirmarVoto('nao')}
          >
            <Ionicons name="close-circle" size={24} color={votoAtual === 'nao' ? colors.avatarText : colors.text} />
            <Text style={votoAtual === 'nao' ? styles.actionBtnTextActive : [styles.actionBtnText, { color: colors.text }]}>Não</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.card, borderColor: colors.menuButtonBg },
              votoAtual === 'talvez' ? [styles.actionBtnTalvez, { backgroundColor: colors.primary, borderColor: colors.primary }] : {},
            ]}
            onPress={() => confirmarVoto('talvez')}
          >
            <Ionicons name="help-circle" size={24} color={votoAtual === 'talvez' ? colors.avatarText : colors.text} />
            <Text style={votoAtual === 'talvez' ? styles.actionBtnTextActive : [styles.actionBtnText, { color: colors.text }]}>Talvez</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: colors.danger, opacity: isFinalizing ? 0.7 : 1 }]}
          disabled={isFinalizing}
          onPress={async () => {
            const finalizeTarget = resolvedEnquete || enquetes.find((e) => e.status === 'ativa') || enquetes.find((e) => e.titulo === tituloEnquete) || null;
            if (!finalizeTarget) return;
            console.log('Finalizar pressed, target id:', finalizeTarget.id);
            setIsFinalizing(true);
            try {
              await encerrarResenha(finalizeTarget.id);
              router.replace('/(tabs)/history');
            } catch (error) {
              console.warn('Erro ao finalizar enquete:', error);
              Alert.alert('Erro ao finalizar enquete', (error && (error.message || String(error))) || 'Erro desconhecido. Veja logs.');
            } finally {
              setIsFinalizing(false);
            }
          }}
        >
          <Text style={styles.endButtonText}>{isFinalizing ? 'FINALIZANDO...' : '🏁 FINALIZAR'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 40 },
  chartContainer: { alignItems: 'center', marginTop: 24, marginBottom: 30 },
  circleGraphic: { width: 240, height: 240, borderRadius: 120, borderWidth: 14, borderColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  probLabel: { color: '#0F41D4', fontWeight: '900', fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  probValue: { fontSize: 68, fontWeight: '900', color: '#0F1724', lineHeight: 72 },
  progressBarBackground: { width: 120, height: 10, backgroundColor: '#E2E8F0', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  probBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F41D4', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, marginTop: 16 },
  probBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 11, marginLeft: 6 },
  mainHeading: { fontSize: 28, fontWeight: '900', color: '#0F1724', marginTop: 20, marginBottom: 10 },
  subHeading: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 30 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 18 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  actionBtnSim: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  actionBtnNao: { backgroundColor: '#F97316', borderColor: '#F97316' },
  actionBtnTalvez: { backgroundColor: '#0F41D4', borderColor: '#0F41D4' },
  actionBtnText: { marginTop: 8, fontWeight: '800', fontSize: 14 },
  actionBtnTextActive: { marginTop: 8, fontWeight: '800', color: '#FFFFFF', fontSize: 14 },
  finalizeHint: { marginTop: 16, fontSize: 13, textAlign: 'center' },
  endButton: { backgroundColor: '#DC2626', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 24 },
  endButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
});
