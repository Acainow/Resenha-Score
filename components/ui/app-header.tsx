import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../../app/_GlobalContext';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const AVATAR_COLORS = ['#1A1A1A', '#3B82F6', '#EF4444', '#F97316', '#10B981', '#8B5CF6'];

export default function AppHeader({ title, showBack = false, onBack }: AppHeaderProps) {
  const router = useRouter();
  const { user, theme, toggleTheme, avatarColor, avatarUri, changeAvatarColor, changeAvatarPhoto, saveProfile, updateProfileName, generateUniqueNickname, signOut, colors, pendingGroupInvites, acceptGroupInvite, rejectGroupInvite, refreshAppData } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [username, setUsername] = useState(user?.name || '');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    setUsername(user?.name || '');
  }, [user?.name]);

  const initials = useMemo(() => {
    if (!user?.name) return 'US';
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const normalizedUserEmail = (user?.email || '').trim().toLowerCase();
  const pendingIncomingInvites = pendingGroupInvites.filter(
    (invite) => invite.status === 'pending' && invite.toEmail.trim().toLowerCase() === normalizedUserEmail
  );

  const handleLogout = async () => {
    setMenuVisible(false);
    await signOut();
    router.replace('/login');
  };

  const handleSaveUsername = async () => {
    setUsernameError(null);
    if (!username.trim()) {
      setUsernameError('Informe um nome de usuário.');
      return;
    }
    setSavingUsername(true);
    try {
      await saveProfile(username.trim());
      setUsernameError(null);
    } catch (err: any) {
      setUsernameError(err?.message || 'Erro ao salvar o nome.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleGenerateNickname = async () => {
    setUsernameError(null);
    setSavingUsername(true);
    try {
      const generated = await generateUniqueNickname();
      setUsername(generated);
      await saveProfile(generated);
    } catch (err: any) {
      setUsernameError(err?.message || 'Não foi possível gerar um nick.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handlePickProfilePhoto = async () => {
    console.log('handlePickProfilePhoto called');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permissão para acessar a galeria negada.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      console.log('Imagem selecionada:', result.assets[0].uri);
      await changeAvatarPhoto(result.assets[0].uri);
      setMenuVisible(false);
    } else {
      console.log('Seleção de imagem cancelada ou sem assets');
    }
  };

  const handleRandomPhoto = () => {
    const next = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    changeAvatarColor(next);
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
      {showBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (onBack) return onBack();
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={[styles.title, { color: colors.title, marginLeft: -8 }]}>{title}</Text>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={async () => {
            await refreshAppData();
            setNotificationsVisible(true);
          }}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.icon} />
          {pendingIncomingInvites.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
              <Text style={styles.badgeText}>{pendingIncomingInvites.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.avatar, { backgroundColor: avatarColor }]} onPress={() => setMenuVisible(true)}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.notificationsOverlay}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.modalOverlay }]} onPress={() => setMenuVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.title }]}>Perfil</Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtitle }]}>Acesse suas configurações e aproveite a experiência.</Text>

            <View style={styles.profileRow}>
              <View style={[styles.modalAvatar, { backgroundColor: avatarColor }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.modalAvatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.title }]}>{user?.name || 'Usuário'}</Text>
                <Text style={[styles.profileEmail, { color: colors.subtitle }]}>{user?.email || 'sem email'}</Text>
              </View>
            </View>

            <View style={[styles.menuSection, { marginTop: 14 }]}> 
              <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>Nome de usuário</Text>
              <TextInput
                style={[styles.usernameInput, { backgroundColor: colors.menuButtonBg, color: colors.text, borderColor: colors.menuButtonBg }]}
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setUsernameError(null);
                }}
                placeholder="Digite seu nick"
                placeholderTextColor={colors.subtitle}
                autoCapitalize="none"
              />
              {usernameError ? <Text style={[styles.errorText, { color: '#DC2626' }]}>{usernameError}</Text> : null}
              <View style={styles.usernameActionRow}>
                <TouchableOpacity style={[styles.usernameButton, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]} onPress={handleGenerateNickname} disabled={savingUsername}>
                  {savingUsername ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={[styles.usernameButtonText, { color: colors.text }]}>Gerar nick aleatório</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.usernameButton, { backgroundColor: colors.primary }]} onPress={handleSaveUsername} disabled={savingUsername}>
                  {savingUsername ? (
                    <ActivityIndicator color={colors.avatarText} />
                  ) : (
                    <Text style={[styles.usernameButtonText, { color: colors.avatarText }]}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.menuSection}>
              <Text style={[styles.sectionTitle, theme === 'dark' ? styles.titleDark : styles.titleLight]}>Ações</Text>
              <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.menuButtonBg }]} onPress={handlePickProfilePhoto}>
                <Ionicons name="image-outline" size={18} color={colors.icon} />
                <Text style={[styles.menuText, { color: colors.menuText }]}>Trocar foto de perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.menuButtonBg }]} onPress={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}>
                <Ionicons name="contrast-outline" size={18} color={colors.icon} />
                <Text style={[styles.menuText, { color: colors.menuText }]}>{theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.menuButtonBg }]} onPress={() => setMenuVisible(false)}>
                <Ionicons name="information-circle-outline" size={18} color={colors.icon} />
                <Text style={[styles.menuText, { color: colors.menuText }]}>Sobre o app</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#FFF" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={notificationsVisible} transparent animationType="slide" onRequestClose={() => setNotificationsVisible(false)}>
        <View style={styles.notificationsOverlay}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.modalOverlay }]} onPress={() => setNotificationsVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.modalBackground, borderTopColor: colors.menuButtonBg }]}>
            <Text style={[styles.modalTitle, { color: colors.title }]}>Convites de grupo</Text>
            <ScrollView
              style={[styles.invitesScroll, { flexGrow: 1 }]}
              contentContainerStyle={[styles.invitesScrollContent, { paddingBottom: 20 }]}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {pendingIncomingInvites.length === 0 ? (
                <Text style={[styles.modalSubtitle, { color: colors.subtitle }]}>Nenhum convite pendente.</Text>
              ) : (
                pendingIncomingInvites.map((invite) => (
                  <View key={invite.id} style={[styles.inviteRow, { backgroundColor: colors.menuButtonBg, borderColor: colors.primary }]}> 
                    <View style={styles.inviteInfo}>
                      <Text style={[styles.inviteTitle, { color: colors.text }]}>{invite.groupName}</Text>
                      <Text style={[styles.inviteSubtitle, { color: colors.subtitle }]}>De: {invite.fromUserName}</Text>
                      <Text style={[styles.inviteStatus, { color: invite.status === 'pending' ? colors.primary : colors.subtitle }]}>{invite.status.toUpperCase()}</Text>
                    </View>
                    {invite.status === 'pending' ? (
                      <View style={styles.inviteActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.success }]}
                          onPress={async () => {
                            await acceptGroupInvite(invite.id);
                            await refreshAppData();
                            setNotificationsVisible(false);
                          }}
                        >
                          <Text style={styles.actionText}>Aceitar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.danger }]}
                          onPress={async () => {
                            await rejectGroupInvite(invite.id);
                            await refreshAppData();
                            setNotificationsVisible(false);
                          }}
                        >
                          <Text style={styles.actionText}>Recusar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerLight: {
    backgroundColor: '#FAFBFB',
  },
  headerDark: {
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleLight: {
    color: '#004643',
  },
  titleDark: {
    color: '#FFF',
  },
  placeholder: {
    width: 32,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  inviteRow: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  inviteInfo: {
    marginBottom: 12,
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  inviteSubtitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  inviteStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '900',
  },
  notificationsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 320,
    maxHeight: '78%',
    borderTopWidth: 1,
  },
  modalLight: {
    backgroundColor: '#FFFFFF',
  },
  modalDark: {
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 18,
  },
  invitesScroll: {
    flexGrow: 0,
    flexShrink: 1,
    flex: 1,
  },
  invitesScrollContent: {
    paddingBottom: 8,
  },
  subtitleLight: {
    color: '#4B5563',
  },
  subtitleDark: {
    color: '#D1D5DB',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    opacity: 0.8,
  },
  menuSection: {
    marginTop: 8,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  usernameInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  usernameActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  usernameButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  usernameButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  errorText: {
    fontSize: 13,
    marginBottom: 10,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  menuTextDark: {
    color: '#111827',
  },
  menuButtonDark: {
    backgroundColor: '#F3F4F6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 16,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: '900',
    marginLeft: 10,
  },
});
