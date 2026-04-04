import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../GlobalContext'; // ajuste se a pasta for diferente

export default function DetailsScreen() {
  const router = useRouter();
  
  const { score, setScore, tituloEnquete, confirmados, setConfirmados, totalConvidados, encerrarResenha, ponderada, enquetes, votosRegistrados, setVotosRegistrados } = useAppContext();
  
  // GARANTE QUE NENHUM BOTÃO COMECE APERTADO (null)
  const [votoAtual, setVotoAtual] = useState<'sim' | 'nao' | 'talvez' | null>(null);
  const animatedPercent = useRef(new Animated.Value(0)).current;

  // 1. CÁLCULO BLINDADO CONTRA NEGATIVOS (Nunca será -10%)
  const probabilidadeCalc = totalConvidados > 0 ? Math.round((confirmados / totalConvidados) * 100) : 0;
  const probabilidade = Math.max(0, probabilidadeCalc);

  useEffect(() => {
    Animated.timing(animatedPercent, {
      toValue: probabilidade,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [probabilidade, animatedPercent]);

  useEffect(() => {
    if (!tituloEnquete) {
      setVotoAtual(null);
      return;
    }

    const enqueteId = enquetes.find(e => e.titulo === tituloEnquete)?.id;
    const votoAtualRegistrado = votosRegistrados.find(
      (v) => v.enqueteId === enqueteId && v.memberId === 'usuario-current'
    );

    if (votoAtualRegistrado) {
      setVotoAtual(votoAtualRegistrado.tipo);
    } else {
      setVotoAtual(null);
    }
  }, [tituloEnquete, enquetes, votosRegistrados]);

  // 2. FUNÇÃO DE VOTO CORRIGIDA COM TALVEZ E PESO CONSISTENTE
  const confirmarVoto = (tipoVoto: 'sim' | 'nao' | 'talvez') => {
    if (votoAtual === tipoVoto) return;

    const weight = ponderada ? Math.max(1, score) : 1;
    const previousVoteCount = votoAtual === 'sim' ? weight : votoAtual === 'talvez' ? weight * 0.5 : 0;
    const nextVoteCount = tipoVoto === 'sim' ? weight : tipoVoto === 'talvez' ? weight * 0.5 : 0;

    setConfirmados((prev: number) => Math.max(0, prev - previousVoteCount + nextVoteCount));

    setScore((prev: number) => {
      let nextScore = prev;
      if (votoAtual === 'sim') nextScore -= 10;
      if (votoAtual === 'nao') nextScore += 5;

      if (tipoVoto === 'sim') nextScore += 10;
      if (tipoVoto === 'nao') nextScore -= 5;
      return nextScore;
    });

    // Persiste o voto no histórico
    const enqueteId = enquetes.find(e => e.titulo === tituloEnquete)?.id || '';
    if (enqueteId) {
      const novoVoto = {
        enqueteId,
        memberId: 'usuario-current', // Usuário atual
        tipo: tipoVoto as 'sim' | 'nao' | 'talvez',
        timestamp: Date.now()
      };
      
      // Remove voto anterior do mesmo usuário e enquete
      const votosAtualizados = votosRegistrados.filter(
        v => !(v.enqueteId === enqueteId && v.memberId === 'usuario-current')
      );
      setVotosRegistrados([...votosAtualizados, novoVoto]);
    }

    // Marca o botão que foi apertado agora
    setVotoAtual(tipoVoto);

    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👀 {tituloEnquete}</Text>
        <View style={styles.avatar}><Ionicons name="person" size={16} color="#FFF" /></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={styles.chartContainer}>
          <View style={styles.circleGraphic}>
            <Text style={styles.probLabel}>PROBABILIDADE</Text>
            <Text style={styles.probValue}>{probabilidade}%</Text>
            <View style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <View style={{ width: 80, height: 8, backgroundColor: '#E5E7EB', borderRadius: 999 }}>
                <Animated.View
                  style={{
                    width: animatedPercent.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                    height: '100%',
                    backgroundColor: '#55FF99',
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
            <View style={styles.probBadge}>
              <Ionicons name="trending-up" size={12} color="#FFF" />
              <Text style={styles.probBadgeText}> ALTO ENGAJAMENTO</Text>
            </View>
          </View>
        </View>

        <Text style={styles.mainHeading}>Grande chance de{"\n"}acontecer!</Text>
        <Text style={styles.subHeading}>{confirmados} membros confirmaram{"\n"}presença. A vibe está incrível.</Text>

        <Text style={styles.sectionLabel}>CONFIRMAR PRESENÇA</Text>
        <View style={styles.actionRow}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
              votoAtual === 'sim' ? styles.actionBtnSim : {}
            ]}
            onPress={() => confirmarVoto('sim')}
          >
            <Ionicons name="checkmark-circle" size={24} color={votoAtual === 'sim' ? '#FFF' : '#1A1A1A'} />
            <Text style={votoAtual === 'sim' ? styles.actionBtnTextActive : styles.actionBtnText}>Sim</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
              votoAtual === 'nao' ? styles.actionBtnNao : {}
            ]}
            onPress={() => confirmarVoto('nao')}
          >
            <Ionicons name="close-circle" size={24} color={votoAtual === 'nao' ? '#FFF' : '#1A1A1A'} />
            <Text style={votoAtual === 'nao' ? styles.actionBtnTextActive : styles.actionBtnText}>Não</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
              votoAtual === 'talvez' ? styles.actionBtnTalvez : {}
            ]}
            onPress={() => confirmarVoto('talvez')}
          >
            <Ionicons name="help-circle" size={24} color={votoAtual === 'talvez' ? '#FFF' : '#1A1A1A'} />
            <Text style={votoAtual === 'talvez' ? styles.actionBtnTextActive : styles.actionBtnText}>Talvez</Text>
          </Pressable>
        </View>

        {/* 4. BOTÃO DE FINALIZAR RESENHA AQUI NO FUNDO */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#FF4C4C', 
            padding: 20, 
            borderRadius: 15, 
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20
          }}
          onPress={() => {
            if (encerrarResenha) encerrarResenha(); // Joga pro histórico
            router.push('/');  // Volta pra tela inicial
          }} 
        >
          <Text style={{ fontWeight: '900', color: '#FFFFFF', fontSize: 16 }}>
            🏁 FINALIZAR
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#004643' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 50 },
  chartContainer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  circleGraphic: { width: 240, height: 240, borderRadius: 120, borderWidth: 16, borderColor: '#00844A', borderTopColor: '#6EFFA8', justifyContent: 'center', alignItems: 'center' },
  probLabel: { color: '#004643', fontWeight: '800', fontSize: 12, letterSpacing: 2, marginBottom: 5, opacity: 0.7 },
  probValue: { fontSize: 72, fontWeight: '900', color: '#004643', lineHeight: 75 },
  probBadge: { backgroundColor: '#00844A', flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  probBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 10, letterSpacing: 0.5 },
  mainHeading: { fontSize: 26, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
  subHeading: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#6B7280', letterSpacing: 1, marginBottom: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  tagSmall: { backgroundColor: '#6EFFA8', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  tagSmallText: { fontSize: 10, fontWeight: '800', color: '#004643' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  actionBtn: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 20, borderRadius: 20, alignItems: 'center', marginHorizontal: 5, justifyContent: 'center' },
  actionBtnPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  actionBtnSim: { backgroundColor: '#006D44' },
  actionBtnNao: { backgroundColor: '#1A1A1A' },
  actionBtnTalvez: { backgroundColor: '#D97706' },
  actionBtnText: { fontWeight: '800', color: '#1A1A1A', fontSize: 15, marginTop: 8 },
  actionBtnTextActive: { fontWeight: '800', color: '#FFF', fontSize: 15, marginTop: 8 },
  locationCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 1 },
  locationTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  locationDesc: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 15 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  miniAvatarText: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  voteBadgePrimary: { backgroundColor: '#6EFFA8', width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  voteBadgeTextPrimary: { fontSize: 16, fontWeight: '900', color: '#004643' },
  voteBadgeSecondary: { backgroundColor: '#E5E7EB', width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  voteBadgeTextSecondary: { fontSize: 16, fontWeight: '900', color: '#4B5563' }
});