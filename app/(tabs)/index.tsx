import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/ui/app-header';
import { useAppContext } from '../_GlobalContext';

const getRankInfo = (score: number) => {
  if (score >= 80) {
    return { label: 'Rei da Resenha', emoji: '👑' };
  } else if (score >= 50) {
    return { label: 'Entusiasta', emoji: '⚡' };
  } else if (score >= 20) {
    return { label: 'Participante', emoji: '🎯' };
  }
  return { label: 'Iniciante', emoji: '🌱' };
};

export default function HomeScreen() {
  const router = useRouter();
  const { score, tituloEnquete, confirmados, totalConvidados, datas, encerrarResenha, groups, setTituloEnquete, setEnqueteAtivaId, enquetes } = useAppContext();
  const { refreshAppData } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  const convidadosNum = Number(totalConvidados) || 0;
  const confirmadosNum = Number(confirmados) || 0;
  const probabilidade = convidadosNum > 0 ? Math.round((confirmadosNum / convidadosNum) * 100) : 0;
  const titulo = String(tituloEnquete || '').trim();
  const rankInfo = getRankInfo(score || 0);

  const { colors } = useAppContext();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingBottom: 18 }]}> 
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { flexGrow: 1 }]}
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
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
      >
        <AppHeader title="Resenha Score" />

        <View style={[styles.scoreCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.scoreLabel}>PONTUAÇÃO ATUAL</Text>
            <Text style={styles.scoreValue}>{score || 0}</Text>
            <View style={styles.rankBadge}>
              <Ionicons name="sparkles" size={14} color="#FFF" />
              <Text style={styles.rankBadgeText}>{rankInfo.emoji} {rankInfo.label}</Text>
            </View>
          </View>
          <Ionicons name="flash" size={110} color={(colors.avatarText as string) ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.08)'} style={styles.scoreBackgroundIcon} />
        </View>

        <TouchableOpacity style={[styles.btnCreate, { backgroundColor: colors.menuButtonBg, borderColor: colors.menuButtonBg }]} onPress={() => router.push('/create?mode=poll')}>
          <Ionicons name="add-circle" size={22} color={colors.primary} />
          <Text style={[styles.btnCreateText, { color: colors.primary }]}>Criar Nova Enquete</Text>
        </TouchableOpacity>

        

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resenha em Destaque</Text>
        </View>

        {titulo ? (
          <View style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
            <Text style={[styles.featuredTag, { color: colors.primary }]}>📅 AGORA</Text>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>{titulo}</Text>

            {datas && datas.length > 0 && (
              <View style={styles.featuredList}>
                <Text style={[styles.featuredLabel, { color: colors.text }]}>Datas sugeridas</Text>
                {datas.map((data: string, idx: number) => (
                  <Text key={idx} style={[styles.featuredItem, { color: colors.subtitle }]}>• {data}</Text>
                ))}
              </View>
            )}

            <View style={styles.probabilityRow}>
              <View style={[styles.probabilityCircle, { backgroundColor: colors.background, borderColor: colors.menuButtonBg }]}>
                <View style={[styles.probabilityFill, { height: `${probabilidade}%`, backgroundColor: colors.success }]} />
                <View style={styles.probabilityValueWrap}>
                  <Text style={[styles.probabilityValue, { color: colors.text }]}>{probabilidade}%</Text>
                </View>
              </View>
              <View style={styles.probabilityTextGroup}>
                <Text style={[styles.probabilityTitle, { color: colors.text }]}>Chance de acontecer</Text>
                <Text style={[styles.probabilitySubtitle, { color: colors.subtitle }]}>{confirmadosNum} de {convidadosNum} confirmados</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.primaryAction, { backgroundColor: colors.primary }]} onPress={() => router.push({ pathname: '/details' } as any)}>
              <Text style={[styles.primaryActionText, { color: colors.avatarText }]}>Votar Agora</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.emptyHighlightCard, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
            <Text style={styles.emptyHighlightEmoji}>🍺</Text>
            <Text style={[styles.emptyHighlightTitle, { color: colors.text }]}>Nenhuma resenha lançada</Text>
            <Text style={[styles.emptyHighlightText, { color: colors.subtitle }]}>Crie uma enquete acima para começar a agitar a galera.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meus Grupos</Text>
          <TouchableOpacity onPress={() => router.push('create-group')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Criar grupo</Text>
          </TouchableOpacity>
        </View>

        {groups.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum grupo ainda.</Text>
            <Text style={[styles.emptySub, { color: colors.subtitle }]}>Crie um grupo para começar a adicionar membros e organizar seu time.</Text>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}
              onPress={() => router.push(`/group?groupId=${group.id}`)}
            >
              <View style={[styles.groupIconBox, { backgroundColor: colors.menuButtonBg }]}> 
                <Ionicons name="people-circle" size={24} color={colors.primary} />
              </View>
              <View style={styles.groupInfo}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>{group.name}</Text>
                <Text style={[styles.groupSub, { color: colors.subtitle }]}>{group.members.length} membros</Text>
              </View>
              <View style={styles.groupStatus}>
                <Text style={group.status === 'active' ? styles.statusActive : styles.statusInactive}>
                  {group.status === 'active' ? 'ATIVO' : 'INATIVO'}
                </Text>
                <View style={styles.avatarStack}>
                  {group.members.slice(0, 3).map((member, index) => (
                    <View
                      key={member.id}
                      style={[
                        styles.smallAvatar,
                        { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -10, backgroundColor: member.avatarColor, borderColor: colors.card },
                      ]}
                    >
                      {member.avatarUri ? (
                        <Image source={{ uri: member.avatarUri }} style={styles.smallAvatarImage} />
                      ) : (
                        <Text style={[styles.avatarTxt, { color: colors.text }]}>{member.name.charAt(0)}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.sectionHeader}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico de Enquetes</Text>
        </View>

        {enquetes && enquetes.length > 0 ? (
          enquetes.map((enquete: any, idx: number) => {
              const isClickable = enquete.status === 'ativa';
              const Wrapper: any = isClickable ? TouchableOpacity : View;
              return (
                <Wrapper
                  key={enquete.id || idx}
                  style={[styles.enqueteCard, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}
                  {...(isClickable
                    ? {
                        onPress: () => {
                          setTituloEnquete(enquete.titulo);
                          setEnqueteAtivaId(enquete.id);
                          router.push({ pathname: '/details', params: { enqueteId: enquete.id } } as any);
                        },
                      }
                    : {})}
                >
                  <View style={styles.enqueteCardContent}>
                    <Text style={[styles.enqueteTitle, { color: colors.text }]}>{enquete.titulo}</Text>
                    <Text style={[styles.enqueteMeta, { color: colors.subtitle }]}>{enquete.dataCriacao}</Text>
                    <Text style={[styles.enqueteStatus, { color: enquete.status === 'ativa' ? colors.primary : colors.subtitle }]}>\
                      {enquete.status === 'ativa' ? '● Ativa' : '● Encerrada'}
                    </Text>
                  </View>
                  {enquete.status === 'ativa' && (
                    <View style={[styles.enqueteBadge, { backgroundColor: colors.success }]}> 
                      <Ionicons name="radio-button-on" size={14} color="#FFF" />
                    </View>
                  )}
                </Wrapper>
              );
            })
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma enquete criada</Text>
            <Text style={[styles.emptySub, { color: colors.subtitle }]}>Crie sua primeira enquete acima para começar!</Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20 },
  scoreCard: { backgroundColor: '#0F41D4', borderRadius: 24, padding: 24, marginBottom: 20, overflow: 'hidden', position: 'relative', elevation: 6, shadowColor: '#1E3A8A', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  scoreLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.2, marginBottom: 8 },
  scoreValue: { fontSize: 64, fontWeight: '900', color: '#FFFFFF', lineHeight: 70 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, marginTop: 16 },
  rankBadgeText: { color: '#FFFFFF', fontWeight: '800', marginLeft: 8 },
  scoreBackgroundIcon: { position: 'absolute', right: -20, top: 12, opacity: 0.24 },
  btnCreate: { backgroundColor: '#E7F0FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 18, borderWidth: 1, borderColor: '#D6E4FF', marginBottom: 24 },
  btnCreateText: { color: '#0F41D4', fontWeight: '900', fontSize: 15, marginLeft: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#0F1724' },
  linkText: { color: '#0F41D4', fontSize: 14, fontWeight: '800' },
  featuredCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  featuredTag: { fontSize: 12, fontWeight: '900', color: '#0F41D4', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  featuredTitle: { fontSize: 24, fontWeight: '900', color: '#0F1724', marginBottom: 18 },
  featuredList: { marginBottom: 18 },
  featuredLabel: { fontSize: 14, fontWeight: '800', color: '#0F1724', marginBottom: 10 },
  featuredItem: { fontSize: 14, color: '#64748B', marginLeft: 10, marginBottom: 4 },
  probabilityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  probabilityCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', justifyContent: 'flex-end', marginRight: 16 },
  probabilityFill: { width: '100%', backgroundColor: '#16A34A' },
  probabilityValueWrap: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  probabilityValue: { fontSize: 18, fontWeight: '900', color: '#0F1724' },
  probabilityTextGroup: { flex: 1 },
  probabilityTitle: { fontSize: 16, fontWeight: '800', color: '#0F1724', marginBottom: 4 },
  probabilitySubtitle: { fontSize: 14, color: '#64748B' },
  primaryAction: { backgroundColor: '#0F41D4', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryActionText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  emptyHighlightCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 30, borderWidth: 1, borderStyle: 'dashed', borderColor: '#94A3B8', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  emptyHighlightEmoji: { fontSize: 36, marginBottom: 14 },
  emptyHighlightTitle: { fontSize: 18, fontWeight: '900', color: '#0F1724', marginBottom: 8 },
  emptyHighlightText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0F1724', marginBottom: 6 },
  emptySub: { color: '#64748B', fontSize: 14, lineHeight: 20 },
  groupCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#CBD5E1', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  groupIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E7F0FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  groupInfo: { flex: 1 },
  groupTitle: { fontSize: 15, fontWeight: '900', color: '#0F1724', marginBottom: 4 },
  groupSub: { color: '#64748B', fontSize: 13 },
  groupStatus: { alignItems: 'flex-end' },
  statusActive: { color: '#16A34A', fontWeight: '900', fontSize: 10, letterSpacing: 0.6 },
  statusInactive: { color: '#94A3B8', fontWeight: '800', fontSize: 10, letterSpacing: 0.6 },
  avatarStack: { flexDirection: 'row' },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF', overflow: 'hidden' },
  smallAvatarImage: { width: '100%', height: '100%', borderRadius: 14 },
  avatarTxt: { color: '#0F1724', fontSize: 11, fontWeight: '900' },
  enqueteCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  enqueteCardContent: { flex: 1 },
  enqueteTitle: { fontSize: 14, fontWeight: '800', color: '#0F1724', marginBottom: 4 },
  enqueteMeta: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  enqueteStatus: { fontSize: 12, fontWeight: '600' },
  enqueteBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#16A34A' },
  spacer: { height: 30 }
});
