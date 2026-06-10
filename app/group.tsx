import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/ui/app-header';
import { GroupMember, useAppContext } from './_GlobalContext';

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams() as { groupId?: string };
  const router = useRouter();
  const { enquetes, groups, colors, setTituloEnquete, setEnqueteAtivaId, addGroupMember, inviteGroupMember, removeGroupMember, deleteGroup, user } = useAppContext() as any;
  const { refreshAppData } = useAppContext() as any;
  const { fetchAggregatedGroupMembers } = useAppContext() as any;
  const [refreshing, setRefreshing] = useState(false);

  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [aggregatedMembers, setAggregatedMembers] = useState<GroupMember[] | null>(null);

  const group = groups.find((g: any) => g.id === groupId) || null;
  const isOwner = group?.ownerId === user?.id;
  const currentMember = group?.members.find((member: GroupMember) => member.id === user?.id || member.email === user?.email) || null;
  const groupEnquetes = enquetes.filter((e: any) => e.groupId === groupId);
  const [filter, setFilter] = useState<'all' | 'ativa' | 'encerrada'>('all');
  const filteredEnquetes = groupEnquetes.filter((e: any) => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const openEnquete = (enquete: any) => {
    setTituloEnquete(enquete.titulo);
    setEnqueteAtivaId(enquete.id);
    router.push({ pathname: '/details', params: { enqueteId: enquete.id } } as any);
  };

  const handleLeaveGroup = async () => {
    if (!group || !currentMember) return;
    removeGroupMember(group.id, currentMember.id);
    router.replace('/');
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    deleteGroup(group.id);
    router.replace('/');
  };

  const handleAddMember = async () => {
    setMemberError(null);
    if (!group) return;

    const email = memberEmail.trim();
    const name = memberName.trim();
    if (!email && !name) {
      setMemberError('Informe nome ou email para adicionar ou convidar.');
      return;
    }

    if (email) {
      try {
        await inviteGroupMember(group.id, email);
        setMemberName('');
        setMemberEmail('');
        setMemberError('Convite enviado com sucesso.');
        // refresh aggregated list
        setAggregatedMembers(await fetchAggregatedGroupMembers(group.id));
      } catch (error: any) {
        setMemberError(error?.message || 'Não foi possível enviar o convite.');
      }
      return;
    }

    const nextMember: GroupMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      email: '',
      avatarColor: '#3B82F6',
      avatarUri: null,
    };

    addGroupMember(group.id, nextMember);
    setMemberName('');
    setMemberEmail('');
    setMemberError(null);
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!groupId) return;
      const members = await fetchAggregatedGroupMembers(groupId);
      if (mounted) setAggregatedMembers(members);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [groupId, groups]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <AppHeader title={group ? group.name : 'Grupo'} showBack />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
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
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterBtn, filter === 'all' ? styles.filterBtnActive : {}]}>
            <Text style={[styles.filterText, filter === 'all' ? styles.filterTextActive : {}]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('ativa')} style={[styles.filterBtn, filter === 'ativa' ? styles.filterBtnActive : {}]}>
            <Text style={[styles.filterText, filter === 'ativa' ? styles.filterTextActive : {}]}>Ativas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('encerrada')} style={[styles.filterBtn, filter === 'encerrada' ? styles.filterBtnActive : {}]}>
            <Text style={[styles.filterText, filter === 'encerrada' ? styles.filterTextActive : {}]}>Encerradas</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.membersSection, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
          <Text style={[styles.membersTitle, { color: colors.text }]}>Membros</Text>
          {((aggregatedMembers && aggregatedMembers.length > 0) || group?.members) ? (
            (aggregatedMembers ?? group?.members ?? []).map((member: GroupMember) => {
              const memberIsOwner = group?.ownerId === member.id;
              const canRemove = isOwner && member.id !== user?.id;
              return (
                <View key={member.id} style={styles.memberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: member.avatarColor, borderColor: colors.card }]}> 
                    {member.avatarUri ? (
                      <Image source={{ uri: member.avatarUri }} style={styles.memberAvatarImage} />
                    ) : (
                      <Text style={[styles.memberAvatarText, { color: colors.avatarText }]}>{member.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberTitleRow}>
                      <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                      {memberIsOwner ? (
                        <View style={[styles.ownerBadge, { backgroundColor: colors.primary }]}> 
                          <Ionicons name="trophy-outline" size={14} color="#FFF" />
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.memberEmail, { color: colors.subtitle }]}>{member.email || 'sem email'}</Text>
                  </View>
                  {canRemove ? (
                    <TouchableOpacity style={[styles.removeMemberBtn, { borderColor: colors.primary }]} onPress={() => removeGroupMember(group.id, member.id)}>
                      <Ionicons name="person-remove-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text style={[styles.helpText, { color: colors.subtitle }]}>Nenhum membro adicionado ainda.</Text>
          )}

          <View style={styles.memberAddRow}>
            <TextInput
              placeholder="Nome do membro"
              placeholderTextColor={colors.subtitle}
              value={memberName}
              onChangeText={setMemberName}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.menuButtonBg, color: colors.text, flex: 1, marginRight: 8 }]}
            />
            <TextInput
              placeholder="Email (opcional)"
              placeholderTextColor={colors.subtitle}
              value={memberEmail}
              onChangeText={setMemberEmail}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.menuButtonBg, color: colors.text, flex: 1 }]}
            />
          </View>
          {memberError ? <Text style={[styles.errorText, { color: '#DC2626' }]}>{memberError}</Text> : null}
          {!isOwner && currentMember ? (
            <TouchableOpacity style={[styles.leaveButton, { backgroundColor: colors.danger }]} onPress={handleLeaveGroup}>
              <Ionicons name="exit-outline" size={16} color="#FFF" />
              <Text style={[styles.leaveButtonText, { color: '#FFF' }]}>Sair do grupo</Text>
            </TouchableOpacity>
          ) : null}
          {isOwner ? (
            <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.danger }]} onPress={handleDeleteGroup}>
              <Ionicons name="trash-outline" size={16} color="#FFF" />
              <Text style={[styles.leaveButtonText, { color: '#FFF' }]}>Excluir grupo</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[styles.addMemberBtn, { backgroundColor: colors.primary }]} onPress={handleAddMember}>
            <Ionicons name="person-add" size={16} color={colors.avatarText} />
            <Text style={[styles.addBtnText, { color: colors.avatarText }]}>Adicionar membro</Text>
          </TouchableOpacity>
        </View>
        {filteredEnquetes.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}> 
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma resenha neste grupo.</Text>
            <Text style={[styles.emptySub, { color: colors.subtitle }]}>Quando uma enquete for criada para este grupo, ela aparecerÃ¡ aqui.</Text>
          </View>
        ) : (
          filteredEnquetes.map((enquete: any) => (
            <TouchableOpacity key={enquete.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]} onPress={() => openEnquete(enquete)}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>{enquete.titulo}</Text>
                <Text style={[styles.meta, { color: colors.subtitle }]}>{enquete.dataCriacao}</Text>
              </View>
              <View style={styles.statusWrap}>
                <Text style={[styles.status, { color: enquete.status === 'ativa' ? colors.primary : colors.subtitle }]}>{enquete.status.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  filterBtnActive: { backgroundColor: '#E8F0FF' },
  filterText: { fontWeight: '700' },
  filterTextActive: { color: '#0F41D4' },
  empty: { borderRadius: 14, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptySub: { fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  title: { fontSize: 16, fontWeight: '900', lineHeight: 22 },
  meta: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  statusWrap: { alignItems: 'flex-end' },
  status: { fontSize: 12, fontWeight: '900' },
  membersSection: { borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  membersTitle: { fontSize: 15, fontWeight: '900', marginBottom: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  memberAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1, overflow: 'hidden', marginRight: 12 },
  memberAvatarImage: { width: '100%', height: '100%' },
  memberAvatarText: { fontSize: 16, fontWeight: '900' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '800', marginBottom: 2, lineHeight: 20 },
  memberEmail: { fontSize: 13, lineHeight: 18 },
  memberTitleRow: { flexDirection: 'row', alignItems: 'center' },
  ownerBadge: { marginLeft: 8, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  removeMemberBtn: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  leaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  leaveButtonText: { marginLeft: 8, fontWeight: '800' },
  memberAddRow: { flexDirection: 'row', marginTop: 14, marginBottom: 10 },
  input: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  addBtnText: { marginLeft: 8, fontWeight: '800' },
  errorText: { marginBottom: 10, fontSize: 13 },
  helpText: { fontSize: 13, lineHeight: 20 },
});
