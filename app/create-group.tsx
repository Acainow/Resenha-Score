import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/ui/app-header';
import { GroupMember, useAppContext } from './_GlobalContext';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user, colors, avatarUri, createGroup } = useAppContext();

  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);

  const addMember = () => {
    const trimmedName = memberName.trim();
    if (!trimmedName) {
      setMemberError('Informe o nome do participante');
      return;
    }

    const nextMember: GroupMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmedName,
      email: memberEmail.trim(),
      avatarColor: '#3B82F6',
      avatarUri: null,
    };

    setMembers((prev) => [...prev, nextMember]);
    setMemberName('');
    setMemberEmail('');
    setMemberError(null);
  };

  const removeMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;

    const owner = user
      ? { id: user.id, name: user.name || 'Você', email: user.email || '', avatarColor: '#111827', avatarUri: avatarUri || null }
      : null;

    const allMembers = owner ? [owner, ...members] : members;
    const newGroupId = createGroup(groupName.trim(), allMembers);
    router.replace(`/group?groupId=${newGroupId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <AppHeader title="Criar Grupo" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.subtitle }]}>NOME DO GRUPO</Text>
        <TextInput
          placeholder="Ex: Galera do Futebol"
          placeholderTextColor={colors.subtitle}
          value={groupName}
          onChangeText={setGroupName}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.menuButtonBg, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.subtitle, marginTop: 10 }]}>ADICIONAR PARTICIPANTE</Text>
        <View style={styles.memberRow}>
          <TextInput
            placeholder="Nome"
            placeholderTextColor={colors.subtitle}
            value={memberName}
            onChangeText={setMemberName}
            style={[styles.input, styles.memberInput, { backgroundColor: colors.card, borderColor: colors.menuButtonBg, color: colors.text }]}
          />
          <TextInput
            placeholder="Email (opcional)"
            placeholderTextColor={colors.subtitle}
            value={memberEmail}
            onChangeText={setMemberEmail}
            style={[styles.input, styles.memberInput, { backgroundColor: colors.card, borderColor: colors.menuButtonBg, color: colors.text }]}
          />
        </View>
        {memberError ? <Text style={[styles.errorText, { color: '#DC2626' }]}>{memberError}</Text> : null}

        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={addMember}>
          <Ionicons name="person-add" size={16} color={colors.avatarText} />
          <Text style={[styles.addBtnText, { color: colors.avatarText }]}>Adicionar participante</Text>
        </TouchableOpacity>

        <View style={styles.membersContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Participantes adicionados</Text>
          {members.length === 0 ? (
            <Text style={[styles.helpText, { color: colors.subtitle }]}>Adicione membros ao grupo para que eles possam receber convites e participem das enquetes.</Text>
          ) : (
            members.map((m) => (
              <View key={m.id} style={[styles.memberItem, { borderColor: colors.menuButtonBg }]}> 
                <View>
                  <Text style={[styles.memberName, { color: colors.text }]}>{m.name}</Text>
                  {m.email ? <Text style={[styles.memberEmail, { color: colors.subtitle }]}>{m.email}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => removeMember(m.id)}>
                  <Ionicons name="close" size={18} color={colors.subtitle} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]} onPress={handleCreateGroup}>
          <Text style={[styles.createButtonText, { color: colors.avatarText }]}>CRIAR GRUPO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, marginBottom: 12 },
  memberRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  memberInput: { flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 4, marginBottom: 18 },
  addBtnText: { marginLeft: 8, fontWeight: '800' },
  membersContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10 },
  helpText: { fontSize: 13, lineHeight: 20 },
  memberItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  memberName: { fontSize: 15, fontWeight: '900' },
  memberEmail: { fontSize: 13, marginTop: 2 },
  errorText: { marginBottom: 10, fontSize: 13 },
  createButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  createButtonText: { fontWeight: '900' },
});
