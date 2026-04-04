import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppContext } from '../GlobalContext';

const getRankInfo = (score: number) => {
  if (score >= 80) {
    return { label: 'Rei da Resenha', emoji: '👑', color: '#FFD700' };
  } else if (score >= 50) {
    return { label: 'Entusiasta', emoji: '⚡', color: '#FF9500' };
  } else if (score >= 20) {
    return { label: 'Participante', emoji: '🎯', color: '#34C759' };
  } else {
    return { label: 'Iniciante', emoji: '🌱', color: '#8E8E93' };
  }
};

export default function HomeScreen() {
  const router = useRouter();
  
 const { score, tituloEnquete, confirmados, totalConvidados, datas, encerrarResenha } = useAppContext();

  // 1. Números super seguros contra quebras (NaN)
  const convidadosNum = Number(totalConvidados) || 0;
  const confirmadosNum = Number(confirmados) || 0;
  const probabilidade = convidadosNum > 0 ? Math.round((confirmadosNum / convidadosNum) * 100) : 0;
  
  // 2. A MÁGICA AQUI: Só ativa o card principal se tiver título válido E pelo menos 1 convidado!
  const titulo = String(tituloEnquete || '').trim();
  const temEnqueteAtiva = titulo.length > 0 && convidadosNum > 0;

  const rankInfo = getRankInfo(score || 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFB" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>👀 ResenhaScore</Text>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#6EFFA8" />
          </View>
        </View>

        {/* SCORE CARD */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreLabel}>PONTUAÇÃO ATUAL</Text>
            <Text style={styles.scoreValue}>{score || 0}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{rankInfo.emoji} {rankInfo.label}</Text>
            </View>
          </View>
          <Ionicons name="flash" size={120} color="#FFF" style={styles.scoreBackgroundIcon} />
        </View>

        {/* BOTÃO CRIAR */}
        <TouchableOpacity style={styles.btnCreate} onPress={() => router.navigate('/(tabs)/create')}>
          <Ionicons name="add-circle" size={22} color="#FFF" />
          <Text style={styles.btnCreateText}> Criar Nova Enquete</Text>
        </TouchableOpacity>

        {/* SEÇÃO RESENHA EM DESTAQUE */}
        <View style={styles.sectionHeader}>
       {/* TÍTULO DA SEÇÃO */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 25, marginBottom: 15 }}>
        Resenha em Destaque
      </Text>
      </View>

      {/* MÁGICA DA ENQUETE CONDICIONAL */}
      {tituloEnquete ? (
        
        // ---- CARD COM A ENQUETE ATIVA ----
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          borderLeftWidth: 8,
          borderLeftColor: '#55FF99', // A listra verde na lateral!
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3
        }}>
          
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#004643', marginBottom: 5 }}>
            📅 AGORA
          </Text>

          {/* O TÍTULO REAL DA ENQUETE */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 }}>
            {tituloEnquete}
          </Text>

          {/* DATAS SUGERIDAS */}
          {datas && datas.length > 0 && (
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 }}>
                📅 Datas Sugeridas:
              </Text>
              {datas.map((data: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 13, color: '#6B7280', marginLeft: 10 }}>
                  • {data}
                </Text>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            
            {/* RODINHA DE PORCENTAGEM DINÂMICA */}
            
            {/* BOLINHA ENCHENDO TIPO BATERIA 🔋 */}
            <View style={{ 
              width: 60, 
              height: 60, 
              borderRadius: 30, 
              backgroundColor: '#F0F5F5', 
              overflow: 'hidden', 
              justifyContent: 'flex-end', 
              marginRight: 15,
              borderWidth: 2,
              borderColor: '#E0E5EC'
            }}>
              <View style={{ 
                width: '100%', 
                height: `${totalConvidados > 0 ? Math.round((confirmados / totalConvidados) * 100) : 0}%`, 
                backgroundColor: '#55FF99' 
              }} />
              <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' }}>
                  {totalConvidados > 0 ? Math.round((confirmados / totalConvidados) * 100) : 0}%
                </Text>
              </View>
            </View>

            {/* TEXTOS AO LADO DA BOLINHA */}
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }}>
                Chance de Acontecer
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                {confirmados} de {totalConvidados} confirmados
              </Text>
            </View>

          </View>
          {/* FIM DO BLOCO DA PORCENTAGEM */}

          <TouchableOpacity 
            style={{ backgroundColor: '#E0E5EC', padding: 15, borderRadius: 10, alignItems: 'center' }}
            onPress={() => router.push('/details')} 
          >
            <Text style={{ fontWeight: 'bold', color: '#004643', fontSize: 16 }}>Votar Agora</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: '#DC2626', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }}
            onPress={encerrarResenha} 
          >
            <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 16 }}>Encerrar Resenha</Text>
          </TouchableOpacity>

        </View>

      ) : (

        // ---- CARD VAZIO (NENHUMA RESENHA) ----
        <View style={{ backgroundColor: '#FFFFFF', padding: 30, borderRadius: 15, borderWidth: 2, borderColor: '#D0D8E0', borderStyle: 'dashed', alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🍺</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3A4A5A', marginBottom: 5 }}>
            Nenhuma resenha lançada
          </Text>
          <Text style={{ fontSize: 14, color: '#8A9Aaa', textAlign: 'center' }}>
            Crie uma enquete acima para começar a agitar a galera.
          </Text>
        </View>

      )}

        {/* SEÇÃO MEUS GRUPOS */}
        <View style={[styles.sectionHeader, { marginTop: 15, alignItems: 'center' }]}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>Meus Grupos</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.groupCard}>
          <View style={styles.groupIconBox}>
            <Ionicons name="football-outline" size={24} color="#004643" />
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupTitle}>Futebol de Quarta</Text>
            <Text style={styles.groupSub}><Ionicons name="people" size={12} /> 18 membros</Text>
          </View>
          <View style={styles.groupStatus}>
            <Text style={styles.statusActive}>ATIVO AGORA</Text>
            <View style={styles.avatarStack}>
              <View style={[styles.smallAvatar, { zIndex: 3, backgroundColor: '#3B82F6' }]}><Text style={styles.avatarTxt}>M</Text></View>
              <View style={[styles.smallAvatar, { zIndex: 2, backgroundColor: '#EF4444', marginLeft: -10 }]}><Text style={styles.avatarTxt}>J</Text></View>
              <View style={[styles.smallAvatar, { zIndex: 1, backgroundColor: '#64748B', marginLeft: -10 }]}><Text style={styles.avatarTxt}>+5</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.groupCard}>
          <View style={[styles.groupIconBox, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="business-outline" size={24} color="#DC2626" />
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupTitle}>Amigos do Prédio</Text>
            <Text style={styles.groupSub}><Ionicons name="people" size={12} /> 42 membros</Text>
          </View>
          <View style={styles.groupStatus}>
            <Text style={styles.statusInactive}>HÁ 2H</Text>
            <View style={styles.avatarStack}>
              <View style={[styles.smallAvatar, { zIndex: 2, backgroundColor: '#10B981' }]}><Text style={styles.avatarTxt}>C</Text></View>
              <View style={[styles.smallAvatar, { zIndex: 1, backgroundColor: '#64748B', marginLeft: -10 }]}><Text style={styles.avatarTxt}>+12</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFB' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 25 },
  logo: { fontSize: 24, fontWeight: '900', color: '#004643', letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#6EFFA8' },
  
  scoreCard: { backgroundColor: '#6EFFA8', borderRadius: 25, padding: 30, flexDirection: 'row', justifyContent: 'space-between', overflow: 'hidden', marginBottom: 25, elevation: 5 },
  scoreContent: { flex: 1, position: 'relative', zIndex: 1 },
  scoreLabel: { fontSize: 13, fontWeight: '800', color: '#004643', opacity: 0.6, letterSpacing: 1, marginBottom: 5 },
  scoreValue: { fontSize: 72, fontWeight: '900', color: '#004643', lineHeight: 75, marginTop: -5 },
  rankBadge: { backgroundColor: 'rgba(255,255,255,0.5)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, alignSelf: 'flex-start', marginTop: 8 },
  rankBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#004643' },
  scoreBackgroundIcon: { position: 'absolute', right: -30, top: 10, opacity: 0.15 },
  
  btnCreate: { backgroundColor: '#004643', flexDirection: 'row', padding: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 35, elevation: 3 },
  btnCreateText: { color: '#FFF', fontWeight: 'bold', fontSize: 17 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', lineHeight: 26 },
  liveTag: { backgroundColor: '#E8F5E9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  liveText: { fontSize: 11, fontWeight: '900', color: '#004643', letterSpacing: 0.5 },
  linkText: { color: '#004643', fontWeight: '800', fontSize: 14 },
  
  eventCard: { backgroundColor: '#FFF', borderRadius: 25, flexDirection: 'row', overflow: 'hidden', marginBottom: 30, elevation: 3 },
  sideBar: { width: 10, backgroundColor: '#6EFFA8' },
  cardBody: { flex: 1, padding: 25 },
  eventDate: { color: '#004643', fontWeight: '800', fontSize: 13, marginBottom: 8, letterSpacing: 0.5 },
  eventTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  chanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  circle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  circleFill: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#6EFFA8' },
  circleInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  circleText: { fontWeight: '900', fontSize: 14, color: '#1A1A1A' },
  chanceTextColumn: { marginLeft: 15 },
  chanceTitle: { fontWeight: '800', fontSize: 16, color: '#1A1A1A' },
  chanceSub: { color: '#6B7280', fontSize: 13, marginTop: 3 },
  btnVote: { backgroundColor: '#E2E8F0', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnVoteText: { color: '#004643', fontWeight: '800', fontSize: 16 },

  // O CARD VAZIO QUE VOCÊ GOSTOU (Protegido contra bugs de renderização)
  emptyCard: { backgroundColor: '#F8FAFC', borderRadius: 25, padding: 35, alignItems: 'center', marginBottom: 30, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', overflow: 'hidden' },
  emptyCardTitle: { fontSize: 18, fontWeight: '800', color: '#475569', marginBottom: 5 },
  emptyCardSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 10, lineHeight: 20 },

  groupCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2 },
  groupIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  groupInfo: { flex: 1 },
  groupTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  groupSub: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  groupStatus: { alignItems: 'flex-end' },
  statusActive: { fontSize: 10, fontWeight: '900', color: '#004643', letterSpacing: 0.5, marginBottom: 8 },
  statusInactive: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8 },
  avatarStack: { flexDirection: 'row' },
  smallAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarTxt: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

  spacer: { height: 40 }
});