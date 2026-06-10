import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { AppState, Platform, Alert } from 'react-native';
import { supabase } from '../config/supabase';
import { sendExpoPushNotifications } from '../utils/notifications';
import { getStoredPushToken, registerForPushNotificationsAsync } from '../utils/registerPush';

// Permite que o navegador feche sozinho após o login
WebBrowser.maybeCompleteAuthSession();

// --- DEFINIÇÃO DOS TIPOS ---
export interface Voto {
  id: string;
  enqueteId: string;
  memberId: string;
  tipo: 'sim' | 'nao' | 'talvez';
  timestamp: number;
}

export interface Enquete {
  id: string;
  userId: string;
  groupId?: string | null;
  dataCriacao: string;
  dataEncerramento?: string;
  titulo: string;
  presentes: number;
  fotos: number;
  cor: string;
  locais: string[];
  datas: string[];
  status: 'ativa' | 'encerrada';
  ponderada: boolean;
}

export interface Member {
  id: string;
  enqueteId: string;
  name: string;
  points: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarUri?: string | null;
  pushToken?: string | null;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  members: GroupMember[];
  createdAt: number;
  status: 'active' | 'paused' | 'archived';
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  groupSnapshot: Group;
  fromUserId: string;
  fromUserName: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

interface AppContextProps {
  user: User | null;
  session: any;
  authLoading: boolean;
  isInitializing: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithProvider: (provider: 'google') => Promise<void>;
  signOut: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: (next: 'light' | 'dark') => void;
  avatarColor: string;
  avatarUri: string | null;
  changeAvatarColor: (color: string) => Promise<void>;
  changeAvatarPhoto: (uri: string | null) => Promise<void>;
  saveProfile: (name: string) => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  generateUniqueNickname: () => Promise<string>;
  groups: Group[];
  createGroup: (name: string, members: GroupMember[]) => string;
  addGroupMember: (groupId: string, member: GroupMember) => void;
  removeGroupMember: (groupId: string, memberId: string) => void;
  deleteGroup: (groupId: string) => void;
  updateGroupName: (groupId: string, name: string) => void;
  toggleGroupStatus: (groupId: string) => void;
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  tituloEnquete: string;
  setTituloEnquete: Dispatch<SetStateAction<string>>;
  enqueteAtivaId: string | null;
  setEnqueteAtivaId: Dispatch<SetStateAction<string | null>>;
  confirmados: number;
  setConfirmados: Dispatch<SetStateAction<number>>;
  totalConvidados: number;
  setTotalConvidados: Dispatch<SetStateAction<number>>;
  locais: string[];
  setLocais: Dispatch<SetStateAction<string[]>>;
  datas: string[];
  setDatas: Dispatch<SetStateAction<string[]>>;
  ponderada: boolean;
  setPonderada: Dispatch<SetStateAction<boolean>>;
  albumPosts: any[];
  setAlbumPosts: Dispatch<SetStateAction<any[]>>;
  votosRegistrados: Voto[];
  setVotosRegistrados: Dispatch<SetStateAction<Voto[]>>;
  enquetes: Enquete[];
  members: Member[];
  pendingGroupInvites: GroupInvite[];
  inviteGroupMember: (groupId: string, email: string) => Promise<void>;
  acceptGroupInvite: (inviteId: string) => Promise<void>;
  rejectGroupInvite: (inviteId: string) => Promise<void>;
  fetchAggregatedGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  encerrarResenha: (enqueteId?: string) => Promise<void>;
  criarEnquete: (titulo: string, locais: string[], datas: string[], ponderada: boolean, groupId?: string | null) => Promise<void>;
  refreshAppData: () => Promise<void>;
  attemptRegisterPush: () => Promise<void>;
  getTotalPoints: () => number;
  loadingData: boolean;
  colors: { [key: string]: string };
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [score, setScore] = useState(0);
  const [tituloEnquete, setTituloEnquete] = useState('');
  const [enqueteAtivaId, setEnqueteAtivaId] = useState<string | null>(null);
  const [confirmados, setConfirmados] = useState(0);
  const [totalConvidados, setTotalConvidados] = useState(0);
  const [locais, setLocais] = useState<string[]>([]);
  const [datas, setDatas] = useState<string[]>([]);
  const [ponderada, setPonderada] = useState(false);
  const [albumPosts, setAlbumPosts] = useState<any[]>([]);
  const [votosRegistrados, setVotosRegistrados] = useState<Voto[]>([]);
  const [enquetes, setEnquetes] = useState<Enquete[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingGroupInvites, setPendingGroupInvites] = useState<GroupInvite[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [avatarColor, setAvatarColor] = useState('#1A1A1A');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  const registerPushTokenForUser = async (userId: string) => {
    console.log('registerPushTokenForUser: attempt', { userId });
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        console.warn('registerPushTokenForUser: no token returned; registration skipped or failed. See registerForPushNotificationsAsync logs for details.', { userId });
        return;
      }

      console.log('registerPushTokenForUser: token received', { userId, token });
      setPushToken(token);
      try {
        const { data, error } = await supabase.from('profiles').upsert({ id: userId, push_token: token });
        if (error) {
          console.warn('registerPushTokenForUser: supabase upsert returned error', error, { userId, token });
        } else {
          console.log('registerPushTokenForUser: supabase upsert success', { userId });
        }
      } catch (e) {
        console.warn('registerPushTokenForUser: upsert threw', e, { userId });
      }
    } catch (e) {
      console.warn('registerPushTokenForUser: unexpected error', e, { userId });
    }
  };

  const attemptRegisterPush = async () => {
    if (!user?.id) {
      console.warn('attemptRegisterPush: no user logged in');
      return;
    }
    await registerPushTokenForUser(user.id);
  };

  async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Tempo de conexão esgotado. Tente novamente.')), timeoutMs)
    );
    return Promise.race([promise, timeout]) as Promise<T>;
  }

  const THEME_KEY = 'resenha_theme_v1';
  const USER_KEY = 'resenha_user_v1';
  const AVATAR_BUCKET = 'avatars';

  const getAvatarFilePath = (userId: string) => `${userId}.jpg`;
  const getUserGroupRowId = (groupId: string, userId: string) => `${groupId}-${userId}`;

  const normalizeEnqueteRow = (row: any): Enquete => ({
    id: row.id,
    userId: row.userId ?? row.userid ?? '',
    groupId: row.groupId ?? row.groupid ?? null,
    dataCriacao: row.dataCriacao ?? row.datacriacao ?? '',
    dataEncerramento: row.dataEncerramento ?? row.dataencerramento ?? undefined,
    titulo: row.titulo,
    presentes: row.presentes ?? 0,
    fotos: row.fotos ?? 0,
    cor: row.cor ?? '#004643',
    locais: row.locais ?? [],
    datas: row.datas ?? [],
    status: row.status,
    ponderada: row.ponderada ?? false,
  });

  const getImageDataUri = async (uri: string): Promise<string | null> => {
    try {
      // For local files (Android/iOS), prefer returning the original uri so
      // we can try to fetch it as a blob. On Android, convert to a content URI
      // which is more reliably fetchable in Expo.
      if (uri.startsWith('file://') || uri.startsWith('content://')) {
        try {
          if (Platform.OS === 'android' && FileSystem.getContentUriAsync) {
            const content: any = await FileSystem.getContentUriAsync(uri);
            return content?.uri || uri;
          }
        } catch (e) {
          // fallback to returning the file uri; we'll try other strategies later
          console.warn('Não foi possível obter content URI para imagem:', e);
        }
        return uri;
      }
      return uri;
    } catch (err) {
      console.warn('Erro ao ler imagem local:', err);
      return null;
    }
  };

  const base64ToArrayBuffer = async (base64: string): Promise<ArrayBuffer | null> => {
    try {
      if (typeof atob === 'function') {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }

      if ((globalThis as any).Buffer) {
        const buffer = (globalThis as any).Buffer.from(base64, 'base64');
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      }

      const response = await fetch(`data:application/octet-stream;base64,${base64}`);
      return await response.arrayBuffer();
    } catch (err) {
      console.warn('Erro ao converter base64 para ArrayBuffer:', err);
      return null;
    }
  };

  const uploadAvatarImage = async (uri: string): Promise<string | null> => {
    if (!user?.id) return null;
    try {
      const session = await supabase.auth.getSession();
      console.log('Supabase session at upload:', session);
      if (!session?.data?.session) {
        console.warn('uploadAvatarImage: sem sessão Supabase ativa — abortando upload. Faça login antes de enviar avatar.');
        return null;
      }

      const filePath = getAvatarFilePath(user.id);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as const });
      if (!base64) {
        console.warn('uploadAvatarImage: não foi possível ler o arquivo como base64');
        return null;
      }
      console.log('uploadAvatarImage: base64 length:', base64.length);

      const arrayBuffer = await base64ToArrayBuffer(base64);
      if (!arrayBuffer) {
        console.warn('uploadAvatarImage: não foi possível converter base64 para ArrayBuffer');
        return null;
      }

      const { data: uploadData, error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, arrayBuffer, {
        upsert: true,
        contentType: 'image/jpeg',
      });
      if (uploadError) {
        console.warn('Erro ao fazer upload da imagem de avatar:', uploadError, { filePath });
        return null;
      }
      console.log('Upload do avatar bem-sucedido:', { filePath, uploadData });
      return filePath;
    } catch (err) {
      console.warn('Erro ao converter/uploadar avatar:', err);
      return null;
    }
  };

  const getAvatarUrl = async (storedAvatarUri: string | null): Promise<string | null> => {
    if (!storedAvatarUri) return null;
    if (storedAvatarUri.startsWith('http') || storedAvatarUri.startsWith('data:')) {
      return storedAvatarUri;
    }
    try {
      const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(storedAvatarUri, 60 * 60 * 24 * 365);
      if (error || !data?.signedUrl) {
        console.warn('Erro ao gerar URL assinada do avatar:', error, { storedAvatarUri, data });
        return null;
      }
      console.log('Signed URL gerada para avatar:', { storedAvatarUri, signedUrl: data.signedUrl });
      return data.signedUrl;
    } catch (err) {
      console.warn('Erro ao obter URL do avatar:', err);
      return null;
    }
  };

  const persistAvatarProfile = async (uri: string | null, storagePath: string | null, color: string) => {
    if (!user?.id) return;
    try {
      const payload: any = {
        id: user.id,
        email: user.email || '',
        name: user.name || user.email || '',
        avatar_uri: storagePath ?? uri,
        avatar_color: color,
      };
      const { data, error } = await supabase.from('profiles').upsert(payload);
      if (error) {
        console.warn('Erro ao salvar perfil no Supabase:', error, { payload });
      } else {
        console.log('Perfil salvo/upsert em profiles:', { payload, data });
      }
    } catch (err) {
      console.warn('Erro ao salvar perfil no Supabase (exception):', err);
    }
  };

  const normalizeProfileName = (name: string) => name.trim().toLowerCase();

  const isProfileNameTaken = async (name: string, excludeUserId?: string) => {
    const normalized = normalizeProfileName(name);
    if (!normalized) return false;
    try {
      const query = supabase.from('profiles').select('id').ilike('name', normalized).limit(1);
      const { data, error } = excludeUserId
        ? await query.neq('id', excludeUserId)
        : await query;

      if (error) return false;
      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.warn('Erro ao verificar nome no Supabase:', err);
      return false;
    }
  };

  const randomNickAdjectives = ['Resenha', 'Master', 'Ninja', 'Turbo', 'Vibe', 'Flash', 'Mister', 'Senhor', 'Rainha', 'Boss', 'Legend', 'Alpha', 'Fera', 'Zeca', 'Bora', 'Samba'];
  const randomNickNouns = ['Score', 'Bebida', 'Vibes', 'Festa', 'Churras', 'Balada', 'Clube', 'Crew', 'Mestre', 'Mitra', 'Galo', 'Guria', 'Tropa', 'Tribo', 'Gang', 'Chefe'];

  const generateUniqueNickname = async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const adjective = randomNickAdjectives[Math.floor(Math.random() * randomNickAdjectives.length)];
      const noun = randomNickNouns[Math.floor(Math.random() * randomNickNouns.length)];
      const suffix = Math.floor(Math.random() * 90) + 10;
      const candidate = `${adjective}${noun}${suffix}`;
      if (!(await isProfileNameTaken(candidate, user?.id))) {
        return candidate;
      }
    }
    const fallback = `Resenha${Date.now().toString().slice(-4)}`;
    return fallback;
  };

  const saveProfile = async (name: string) => {
    await updateProfileName(name);
    await persistAvatarProfile(avatarUri, avatarPath, avatarColor);
  };

  const updateProfileName = async (name: string) => {
    if (!user?.id) {
      throw new Error('Faça login para atualizar seu nome.');
    }
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Informe um nome válido.');
    }
    if (await isProfileNameTaken(trimmed, user.id)) {
      throw new Error('Este nick já existe. Escolha outro.');
    }

    let avatar_uri: string | null = avatarUri;
    let avatar_color = avatarColor;
    let avatar_storage_path: string | null = avatarPath;
    try {
      const { data: existingProfile, error: existingError } = await supabase
        .from('profiles')
        .select('avatar_uri, avatar_color')
        .eq('id', user.id)
        .single();
      if (!existingError && existingProfile) {
        if (avatar_uri == null) avatar_uri = existingProfile.avatar_uri || null;
        if (!avatar_color) avatar_color = existingProfile.avatar_color || avatar_color;
        if (!avatar_storage_path && avatar_uri && !avatar_uri.startsWith('http') && !avatar_uri.startsWith('data:')) {
          avatar_storage_path = avatar_uri;
        }
      }
    } catch (err) {
      // ignore; preserve current avatar values
    }

    const updatedUser = { ...user, name: trimmed };
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      // ignore storage error
    }

    try {
      await supabase.auth.updateUser({ data: { name: trimmed } });
    } catch (err) {
      console.warn('Erro ao atualizar nome no Supabase Auth:', err);
      // Continuar mesmo se metadata não puder ser atualizado
    }

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: trimmed,
        avatar_uri: avatar_storage_path ?? avatar_uri,
        avatar_color,
      });
    } catch (err) {
      console.warn('Erro ao atualizar nome no Supabase profiles:', err);
      throw new Error('Erro ao salvar o nome. Tente novamente.');
    }

    if (avatar_uri !== avatarUri) {
      const resolved = await getAvatarUrl(avatar_uri);
      setAvatarUri(resolved);
    }
    if (avatar_uri && !avatar_uri.startsWith('http') && !avatar_uri.startsWith('data:')) {
      setAvatarPath(avatar_uri);
    }
    if (avatar_color !== avatarColor) {
      setAvatarColor(avatar_color);
    }
  };

  const persistGroupToSupabase = async (group: Group) => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.from('user_groups').upsert({
        id: getUserGroupRowId(group.id, user.id),
        user_id: user.id,
        group_data: group,
        updated_at: new Date().toISOString(),
      }).select('*');
      if (error) {
        console.warn('persistGroupToSupabase: upsert error', error, { groupId: group.id, userId: user.id });
      } else {
        console.log('persistGroupToSupabase: upsert success', { groupId: group.id, userId: user.id, returned: data });
      }
    } catch (err) {
      console.warn('Erro ao persistir grupo no Supabase:', err);
    }
  };

  const propagateGroupMembers = async (groupId: string, unifiedMembers: GroupMember[]) => {
    try {
      const { data: rows, error } = await supabase.from('user_groups').select('id, group_data').eq("group_data->>id", groupId);
      if (error) {
        console.warn('propagateGroupMembers: error fetching user_groups rows', error);
        return;
      }
      if (!Array.isArray(rows) || rows.length === 0) return;

      for (const row of rows) {
        try {
          const existing = row.group_data as any;
          const newGroupData = { ...existing, members: unifiedMembers };
          const { error: upErr } = await supabase.from('user_groups').update({ group_data: newGroupData, updated_at: new Date().toISOString() }).eq('id', row.id);
          if (upErr) {
            console.warn('propagateGroupMembers: update failed for row', row.id, upErr);
          } else {
            console.log('propagateGroupMembers: updated row', row.id);
          }
        } catch (e) {
          console.warn('propagateGroupMembers: unexpected error for row', row, e);
        }
      }
    } catch (err) {
      console.warn('propagateGroupMembers: unexpected error', err);
    }
  };

  const updateInviteStatus = async (inviteId: string, status: 'accepted' | 'rejected') => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('group_invites')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', inviteId)
        .select('*');
      if (error) {
        console.warn('updateInviteStatus: supabase error', error, { inviteId, status });
        return false;
      }
      console.log('updateInviteStatus: updated', { inviteId, status, data });
      return true;
    } catch (err) {
      console.warn('Erro ao atualizar status do convite no Supabase:', err);
    }
  };

  const lightColors = {
    background: '#F8FAFC',
    headerBg: '#FAFBFB',
    title: '#004643',
    icon: '#004643',
    modalBackground: '#FFFFFF',
    modalOverlay: 'rgba(0,0,0,0.35)',
    subtitle: '#4B5563',
    menuButtonBg: '#CBD5E1',
    menuText: '#111827',
    avatarText: '#FFFFFF',
    primary: '#0F41D4',
    success: '#16A34A',
    danger: '#DC2626',
    card: '#FFFFFF',
    text: '#0F1724',
  } as const;

  const darkColors = {
    background: '#071022',
    headerBg: '#071522',
    title: '#FFFFFF',
    icon: '#E6EEF8',
    modalBackground: '#0A0F18',
    modalOverlay: 'rgba(0,0,0,0.45)',
    subtitle: '#9CA3AF',
    menuButtonBg: '#334155',
    menuText: '#E6EEF8',
    avatarText: '#FFFFFF',
    primary: '#60A5FA',
    success: '#34D399',
    danger: '#FB7185',
    card: '#0B1320',
    text: '#E6EEF8',
  } as const;

  const colors = theme === 'light' ? lightColors : darkColors;

  const AUTH_TIMEOUT_MS = 30000; // extended timeout to avoid false positives on slow networks

  const isNetworkError = (err: any) => {
    if (!err || !err.message) return false;
    const m = err.message.toString().toLowerCase();
    return m.includes('tempo de conexão') || m.includes('connection') || m.includes('timeout') || m.includes('network');
  };

  async function retryIfNetwork<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
    let lastErr: any = null;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e: any) {
        lastErr = e;
        if (i === attempts - 1) break;
        if (!isNetworkError(e)) break;
        // small delay before retry
        await new Promise((res) => setTimeout(res, 700));
      }
    }
    throw lastErr;
  }



  const notifyGroupMembers = async (groupId: string, title: string, body: string) => {
    console.log('notifyGroupMembers called', { groupId, title, body });
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup || targetGroup.members.length === 0) return;

    const memberEmails = targetGroup.members
      .map((member) => member.email)
      .filter((email) => !!email && email !== user?.email);

    const fallbackPushTokens = targetGroup.members
      .map((member) => member.pushToken)
      .filter((token): token is string => typeof token === 'string' && token.length > 0);

    let pushTokens: string[] = [...fallbackPushTokens];

    if (memberEmails.length > 0) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('push_token, email')
          .in('email', memberEmails)
          .not('push_token', 'is', null);

        if (!error && data && Array.isArray(data)) {
          const profileTokens = data
            .map((row: any) => row.push_token)
            .filter((token: string | null) => typeof token === 'string' && token.length > 0);

          pushTokens = [...pushTokens, ...profileTokens];
        }
      } catch (err) {
        console.warn('Erro ao buscar tokens de profiles:', err);
      }
    }

    const uniqueTokens = Array.from(new Set(pushTokens));
    if (uniqueTokens.length === 0) return;

    console.log('notifyGroupMembers: sending notifications to tokens count=', uniqueTokens.length);
    try {
      const messages = uniqueTokens.map((token: string) => ({
        to: token,
        title,
        body,
        sound: 'default' as const,
        data: { groupId },
      }));
      console.log('notifyGroupMembers: messages prepared', { sample: messages[0] });
      await sendExpoPushNotifications(messages);
      console.log('notifyGroupMembers: sendExpoPushNotifications completed');
    } catch (err) {
      console.warn('Erro ao notificar membros do grupo:', err);
    }
  };

  const fetchPendingGroupInvites = async (email: string, userId?: string | null) => {
    const normalizedEmail = email.trim().toLowerCase();
    console.log('fetchPendingGroupInvites for:', normalizedEmail);
    if (!normalizedEmail && !userId) {
      setPendingGroupInvites([]);
      return;
    }

    try {
      const receivedQuery = supabase
        .from('group_invites')
        .select('id, group_id, group_name, group_snapshot, from_user_id, from_user_name, to_email, status, created_at')
        .ilike('to_email', normalizedEmail);

      const sentQuery = userId
        ? supabase
            .from('group_invites')
            .select('id, group_id, group_name, group_snapshot, from_user_id, from_user_name, to_email, status, created_at')
            .eq('from_user_id', userId)
        : null;

      const [{ data: receivedData, error: receivedError }, sentResult] = await Promise.all([
        receivedQuery,
        sentQuery ? sentQuery : Promise.resolve({ data: [], error: null }),
      ]);

      const sentData = (sentResult as any)?.data ?? [];
      const combined = [...(Array.isArray(receivedData) ? receivedData : []), ...(Array.isArray(sentData) ? sentData : [])];

      const deduped = Array.from(
        new Map(combined.map((row: any) => [row.id, row])).values()
      );

      if (receivedError) {
        console.warn('Erro ao buscar convites no Supabase:', receivedError, { normalizedEmail, userId });
      }
      if (Array.isArray(deduped)) {
        console.log('Convites recebidos do Supabase:', deduped);
        setPendingGroupInvites(
          deduped.map((row: any) => ({
            id: row.id,
            groupId: row.group_id,
            groupName: row.group_name,
            groupSnapshot: row.group_snapshot,
            fromUserId: row.from_user_id,
            fromUserName: row.from_user_name,
            toEmail: row.to_email,
            status: row.status,
            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          })) as GroupInvite[]
        );
        return;
      }
    } catch (err) {
      console.warn('Erro ao buscar convites no Supabase (exception):', err, { normalizedEmail, userId });
    }
    setPendingGroupInvites([]);
  };

  const loadUserData = async (currentUser: User) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar_uri, avatar_color')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!profileError && profileData) {
        const profileName = profileData.name?.trim();
        if (profileName && profileName !== currentUser.name) {
          const nextUser = { ...currentUser, name: profileName };
          setUser(nextUser);
          try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
          } catch (error) {
            // ignore storage error
          }
        }
        const storedAvatar = profileData.avatar_uri || null;
        const isPath = storedAvatar && !storedAvatar.startsWith('http') && !storedAvatar.startsWith('data:');
        if (isPath) {
          setAvatarPath(storedAvatar);
        } else {
          setAvatarPath(null);
        }
        setAvatarColor(profileData.avatar_color || '#1A1A1A');
        const resolvedAvatarUri = await getAvatarUrl(storedAvatar);
        setAvatarUri(resolvedAvatarUri);
      } else {
        setAvatarUri(null);
        setAvatarPath(null);
        setAvatarColor('#1A1A1A');
        try {
          await supabase.from('profiles').upsert({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.name || currentUser.email || '',
            avatar_uri: null,
            avatar_color: '#1A1A1A',
          });
        } catch (err) {
          // ignore if profile table not available or upsert fails
        }
      }
    } catch (err) {
      setAvatarUri(null);
      setAvatarColor('#1A1A1A');
    }

    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select('group_data')
        .eq('user_id', currentUser.id);
      if (!error && Array.isArray(data)) {
        setGroups(data.map((row) => row.group_data as Group));
      } else {
        setGroups([]);
      }
    } catch (err) {
      setGroups([]);
    }

    try {
      const { data, error } = await supabase
        .from('enquetes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setEnquetes(data.map((row) => normalizeEnqueteRow(row)));
      } else {
        setEnquetes([]);
      }
    } catch (err) {
      setEnquetes([]);
    }

    try {
      await fetchPendingGroupInvites(currentUser.email || '', currentUser.id);
    } catch (err) {
      setPendingGroupInvites([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') setTheme(stored);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser && !user) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
          } catch (e) {
            // ignore
          }
        }
        const storedPush = await getStoredPushToken();
        if (storedPush) setPushToken(storedPush);
      } catch (err) {
        // ignore
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setEnquetes([]);
      setPendingGroupInvites([]);
      setAvatarUri(null);
      setAvatarColor('#1A1A1A');
      return;
    }
    loadUserData(user);
  }, [user?.id]);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: '156802394559-34m3akue6d9qes4c4gvppov6edhpasv3.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
    },
    { useProxy: true } as any
  );

  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) {
          setSession(data.session);
          setUser({
            id: data.session.user.id,
            name: (data.session.user.user_metadata as any)?.name || data.session.user.email || '',
            email: data.session.user.email || '',
            token: data.session.access_token,
          });
        }
      } catch (error) {
        console.error('Erro ao obter sessão Supabase:', error);
      } finally {
        setAuthLoading(false);
        setIsInitializing(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const currentUser = {
          id: session.user.id,
          name: (session.user.user_metadata as any)?.name || session.user.email || '',
          email: session.user.email || '',
          token: session.access_token,
        };
        setUser(currentUser);
        void AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser)).catch(() => {});
      } else {
        setUser(null);
      }
    });

    initAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    // no default groups by design — start empty so UI shows 'sem grupos'
    // groups will be created by the user via the Create Group page
  }, [user, groups.length, avatarColor]);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token || response.authentication?.idToken;
      if (!idToken) {
        console.error('Google login retornou sem id_token.');
        return;
      }

      const loginNoSupabaseComGoogle = async () => {
        setAuthLoading(true);
        try {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          });
          if (error) throw error;
        } catch (err: any) {
          console.error('Erro ao vincular Google no Supabase:', err.message || err);
        } finally {
          setAuthLoading(false);
        }
      };

      loginNoSupabaseComGoogle();
    }
  }, [response]);

  const resetPassword = async (email: string) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.warn('resetPassword error:', error);
        throw error;
      }
      console.log('resetPassword sent:', data);
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setAuthLoading(true);
    try {
      const res = await retryIfNetwork(async () => {
        return await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
            },
          }),
          AUTH_TIMEOUT_MS
        );
      });
      console.log('signUp result:', res);
      const { data, error } = res as any;
      if (error) {
        console.warn('signUp error:', error);
        throw error;
      }
      if (data?.user) {
        const newUser = {
          id: data.user.id,
          name: name || data.user.email || '',
          email: data.user.email || '',
          token: data.session?.access_token,
        };
        setUser(newUser);
        try {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
        } catch (e) {}

        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || '',
            name: name || data.user.email || '',
            avatar_color: avatarColor,
            avatar_uri: avatarUri,
          });
          await loadUserData(newUser);
        } catch (err) {
          console.warn('Erro ao criar perfil no Supabase:', err);
        }

        // Auto push registration disabled to avoid runtime crashes on devices
        // where native `expo-notifications` bindings are not initialized.
        console.log('signUp: auto push registration skipped; use Debug -> Register Push to test manually', { userId: data.user.id });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const res = await retryIfNetwork(async () => {
        return await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          AUTH_TIMEOUT_MS
        );
      });
      const { data, error } = res as any;
      if (error) throw error;
      if (!data.session?.user) {
        throw new Error('Não foi possível autenticar. Verifique seu email e senha.');
      }
      let profileName = (data.session.user.user_metadata as any)?.name || data.session.user.email || '';
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.session.user.id)
          .single();

        if (!profileError && profileData?.name) {
          profileName = profileData.name;
        }
      } catch (err) {
        // se não existir a tabela profiles ou ocorrer erro, mantemos o nome do metadata
      }

      const signedInUser = {
        id: data.session.user.id,
        name: profileName,
        email: data.session.user.email || '',
        token: data.session.access_token,
      };

      setUser(signedInUser);
      setSession(data.session);
      try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(signedInUser));
      } catch (e) {}

      try {
        await loadUserData(signedInUser);
      } catch (err) {
        // ignore refresh error
      }

      console.log('signIn: auto push registration skipped; use Debug -> Register Push to test manually', { userId: data.session.user.id });
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google') => {
    if (!request) {
      throw new Error('Não foi possível iniciar o fluxo do Google. Tente novamente.');
    }

    setAuthLoading(true);
    try {
      await promptAsync();
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setGroups([]);
      setEnquetes([]);
      setPendingGroupInvites([]);
      setAvatarUri(null);
      setAvatarPath(null);
      setAvatarColor('#1A1A1A');
      try {
        await AsyncStorage.removeItem(USER_KEY);
      } catch (e) {
        // ignore
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleTheme = (next: 'light' | 'dark') => {
    setTheme(next);
    try {
      AsyncStorage.setItem(THEME_KEY, next);
    } catch (err) {
      // ignore
    }
  };

  const changeAvatarColor = async (color: string) => {
    setAvatarColor(color);
    if (!user?.id) return;
    await persistAvatarProfile(avatarUri, avatarPath, color);
  };

  const changeAvatarPhoto = async (uri: string | null) => {
    console.log('changeAvatarPhoto called with uri:', uri);
    if (!uri) {
      setAvatarUri(null);
      setAvatarPath(null);
      if (!user?.id) return;
      await persistAvatarProfile(null, null, avatarColor);
      return;
    }

    const previewUri = await getImageDataUri(uri);
    if (previewUri) {
      setAvatarUri(previewUri);
    } else {
      setAvatarUri(uri);
    }

    if (!user?.id) {
      console.warn('changeAvatarPhoto sem user.id');
      return;
    }
    const storagePath = await uploadAvatarImage(uri);
    if (!storagePath) {
      console.warn('Upload do avatar falhou. O avatar será exibido localmente, mas não foi salvo no Supabase.');
      return;
    }

    const resolvedAvatarUri = await getAvatarUrl(storagePath);
    setAvatarUri(resolvedAvatarUri);
    setAvatarPath(storagePath);
    await persistAvatarProfile(resolvedAvatarUri, storagePath, avatarColor);
  };

  const createGroup = (name: string, members: GroupMember[]) => {
    const ownerId = user?.id || 'anon';
    const newGroup: Group = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      ownerId,
      members,
      createdAt: Date.now(),
      status: 'active',
    };
    setGroups((prev) => [newGroup, ...prev]);
    void persistGroupToSupabase(newGroup);
    return newGroup.id;
  };

  const addGroupMember = (groupId: string, member: GroupMember) => {
    setGroups((prev) => {
      const updated = prev.map((group) => {
        if (group.id !== groupId) return group;
        const exists = group.members.some((item) => item.email === member.email);
        if (exists) return group;
        return { ...group, members: [...group.members, member] };
      });
      const changedGroup = updated.find((group) => group.id === groupId);
      if (changedGroup) {
        void persistGroupToSupabase(changedGroup);
        // propagate unified members to all user_groups rows for this group
        (async () => {
          try {
            const unified = await fetchAggregatedGroupMembers(groupId);
            // ensure the newly added member is included
            const key = (member.email || member.id || JSON.stringify(member)).toString().toLowerCase();
            const has = unified.some((m) => ((m.email || m.id || '').toString().toLowerCase()) === key);
            const finalMembers = has ? unified : [...unified, member];
            await propagateGroupMembers(groupId, finalMembers);
          } catch (e) {
            console.warn('addGroupMember: propagation failed', e);
          }
        })();
      }
      return updated;
    });
  };

  const addPendingInviteMember = (groupId: string, email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const pendingMember: GroupMember = {
      id: `pending-${normalizedEmail}`,
      name: normalizedEmail.split('@')[0] || normalizedEmail,
      email: normalizedEmail,
      avatarColor: '#3B82F6',
      avatarUri: null,
    };

    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const exists = group.members.some(
          (item) => (item.email || '').trim().toLowerCase() === normalizedEmail
        );
        if (exists) return group;
        return { ...group, members: [...group.members, pendingMember] };
      })
    );
  };

  const sendGroupInvite = async (groupId: string, toEmail: string) => {
    if (!user) throw new Error('Faça login para enviar convites.');
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Grupo não encontrado.');
    const normalizedEmail = toEmail.trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Informe o email para enviar o convite.');

    console.log('sendGroupInvite called', { groupId, toEmail: normalizedEmail, userId: user.id });
    const invite: GroupInvite = {
      id: `invite-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      groupId: group.id,
      groupName: group.name,
      groupSnapshot: group,
      fromUserId: user.id,
      fromUserName: user.name || user.email,
      toEmail: normalizedEmail,
      status: 'pending',
      createdAt: Date.now(),
    };

    let inviteCreated = false;
    try {
      const { data, error } = await supabase.from('group_invites').insert({
        id: invite.id,
        group_id: invite.groupId,
        group_name: invite.groupName,
        group_snapshot: invite.groupSnapshot,
        from_user_id: invite.fromUserId,
        from_user_name: invite.fromUserName,
        to_email: invite.toEmail,
        status: invite.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.warn('Erro ao salvar convite no Supabase:', error, { invite });
      } else {
        console.log('Convite criado no Supabase:', { invite, data });
        inviteCreated = true;
      }
    } catch (err) {
      console.warn('Erro ao salvar convite no Supabase (exception):', err, { invite });
    }

    const normalizedUserEmail = user.email?.trim().toLowerCase();
    if (inviteCreated && normalizedUserEmail && normalizedUserEmail === normalizedEmail) {
      setPendingGroupInvites((prev) => {
        if (prev.some((it) => it.id === invite.id)) return prev;
        return [invite, ...prev];
      });
    }
    // If invite created, try to send a push notification to the invitee (if they have a token)
    if (inviteCreated) {
      addPendingInviteMember(group.id, normalizedEmail);
      try {
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('push_token,email')
          .ilike('email', normalizedEmail)
          .limit(1);
        if (!profErr && Array.isArray(profiles) && profiles.length > 0) {
          const token = profiles[0].push_token;
          if (token) {
            try {
              console.log('sendGroupInvite: sending push to invitee', { to: normalizedEmail, token });
              await sendExpoPushNotifications([
                {
                  to: token,
                  title: `Você foi convidado para ${group.name}`,
                  body: `Recebeu um convite de ${user.name || user.email}`,
                  data: { groupId: group.id, inviteId: invite.id },
                  sound: 'default',
                },
              ]);
              console.log('sendGroupInvite: push sent to invitee');
            } catch (e) {
              console.warn('sendGroupInvite: failed to send push', e);
            }
          }
        }
      } catch (e) {
        console.warn('sendGroupInvite: error while querying profiles for push', e);
      }
    }
  };

  useEffect(() => {
    if (!user?.email) return;

    const refreshInvites = async () => {
      await fetchPendingGroupInvites(user.email || '', user.id);
    };

    refreshInvites();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshInvites();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (!user?.email) return;

    try {
      const channel = supabase.channel(`group-invites-${user.id}`);

      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_invites' }, (payload: any) => {
        try {
          const newRow: any = payload.new;
          if (!newRow || !newRow.to_email) return;
          if (newRow.to_email.toString().trim().toLowerCase() === (user.email || '').toString().trim().toLowerCase()) {
            const invite: GroupInvite = {
              id: newRow.id,
              groupId: newRow.group_id,
              groupName: newRow.group_name,
              groupSnapshot: newRow.group_snapshot,
              fromUserId: newRow.from_user_id,
              fromUserName: newRow.from_user_name,
              toEmail: newRow.to_email,
              status: newRow.status || 'pending',
              createdAt: newRow.created_at ? new Date(newRow.created_at).getTime() : Date.now(),
            };
            setPendingGroupInvites((prev) => (prev.some((it) => it.id === invite.id) ? prev : [invite, ...prev]));
          }
        } catch (e) {
          // ignore malformed payloads
        }
      });

      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'group_invites' }, (payload: any) => {
        try {
          const newRow: any = payload.new;
          if (!newRow || !newRow.id) return;
          setPendingGroupInvites((prev) => prev.map((it) => (it.id === newRow.id ? { ...it, status: newRow.status || it.status } : it)));
        } catch (e) {
          // ignore
        }
      });

      channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'group_invites' }, (payload: any) => {
        try {
          const oldRow: any = payload.old;
          if (!oldRow || !oldRow.id) return;
          setPendingGroupInvites((prev) => prev.filter((it) => it.id !== oldRow.id));
        } catch (e) {
          // ignore
        }
      });

      const sub = channel.subscribe();

      return () => {
        try {
          void supabase.removeChannel(channel);
        } catch (e) {
          // ignore unsubscribe errors
        }
      };
    } catch (e) {
      // ignore subscription setup errors
    }
  }, [user?.email]);

  const refreshAppData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      console.log('refreshAppData called for user', user?.email || user?.id);
      await loadUserData(user);
    } catch (err) {
      console.warn('refreshAppData failed', err);
    } finally {
      setLoadingData(false);
    }
  };

  const acceptGroupInvite = async (inviteId: string) => {
    if (!user?.email) return;
    const invite = pendingGroupInvites.find((item) => item.id === inviteId);
    if (!invite) return;

    const ok = await updateInviteStatus(inviteId, 'accepted');
    if (!ok) {
      console.warn('acceptGroupInvite: failed to update invite status on server', { inviteId });
      void fetchPendingGroupInvites(user.email || '', user.id).catch(() => {});
      Alert.alert('Erro', 'Não foi possível aceitar o convite. Tente novamente.');
      return;
    }
    setPendingGroupInvites((prev) =>
      prev.map((item) => (item.id === inviteId ? { ...item, status: 'accepted' } : item))
    );
    // remove the invite from pending list after acceptance to avoid showing stale items
    setPendingGroupInvites((prev) => prev.filter((it) => it.id !== inviteId));

    const member: GroupMember = {
      id: user.id || `member-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: user.name || user.email,
      email: user.email,
      avatarColor: avatarColor || '#3B82F6',
      avatarUri: avatarUri || null,
    };

    const existingGroup = groups.find((group) => group.id === invite.groupId);
    if (existingGroup) {
      addGroupMember(existingGroup.id, member);
      await refreshAppData();
      return;
    }

    // Add group from snapshot but avoid duplicate members
    const baseMembers: GroupMember[] = Array.isArray(invite.groupSnapshot?.members) ? invite.groupSnapshot.members : [];
    const dedup = new Map<string, GroupMember>();
    for (const m of baseMembers) {
      const key = (m.email || m.id || '').toString().toLowerCase();
      if (key) dedup.set(key, m);
    }
    const memberKey = (member.email || member.id || '').toString().toLowerCase();
    if (memberKey) dedup.set(memberKey, member);
    const acceptedGroup: Group = {
      ...invite.groupSnapshot,
      members: Array.from(dedup.values()),
    };
    setGroups((prev) => {
      if (prev.some((g) => g.id === acceptedGroup.id)) return prev;
      return [acceptedGroup, ...prev];
    });
    void persistGroupToSupabase(acceptedGroup);
    // propagate aggregated members to all copies for this group
    (async () => {
      try {
        const unified = await fetchAggregatedGroupMembers(acceptedGroup.id);
        const key = (member.email || member.id || JSON.stringify(member)).toString().toLowerCase();
        const has = unified.some((m) => ((m.email || m.id || '').toString().toLowerCase()) === key);
        const finalMembers = has ? unified : [...unified, member];
        await propagateGroupMembers(acceptedGroup.id, finalMembers);
      } catch (e) {
        console.warn('acceptGroupInvite: propagation failed', e);
      }
    })();

    await refreshAppData();
    try {
      Alert.alert('Convite aceito', 'Você foi adicionado ao grupo.');
    } catch (e) {
      // ignore alert errors in test environments
    }
  };

  const fetchAggregatedGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    if (!groupId) return [];
    try {
      const { data: rows, error } = await supabase.from('user_groups').select('group_data').eq("group_data->>id", groupId);
      if (error || !Array.isArray(rows)) return [];
      const memberMap = new Map<string, GroupMember>();
      for (const row of rows) {
        const gd = row.group_data as any;
        const membersArr = gd?.members ?? [];
        for (const m of membersArr) {
          const key = (m?.email || m?.id || JSON.stringify(m)).toString().toLowerCase();
          if (!memberMap.has(key)) {
            memberMap.set(key, {
              id: m?.id || `member-${Math.random().toString(36).slice(2)}`,
              name: m?.name || m?.email || 'Usuário',
              email: m?.email || '',
              avatarColor: m?.avatarColor || '#3B82F6',
              avatarUri: m?.avatarUri || null,
            });
          }
        }
      }
      return Array.from(memberMap.values());
    } catch (err) {
      console.warn('fetchAggregatedGroupMembers error', err);
      return [];
    }
  };

  const rejectGroupInvite = async (inviteId: string) => {
    const ok = await updateInviteStatus(inviteId, 'rejected');
    if (!ok) {
      console.warn('rejectGroupInvite: failed to update invite status on server', { inviteId });
      void fetchPendingGroupInvites(user?.email || '', user?.id).catch(() => {});
      return;
    }
    setPendingGroupInvites((prev) =>
      prev.map((item) => (item.id === inviteId ? { ...item, status: 'rejected' } : item))
    );
    // remove rejected invites from local pending list
    setPendingGroupInvites((prev) => prev.filter((it) => it.id !== inviteId));
    try {
      Alert.alert('Convite recusado', 'Você não fará parte do grupo.');
    } catch (e) {
      // ignore
    }
  };

  const removeGroupMember = (groupId: string, memberId: string) => {
    setGroups((prev) => {
      const updated = prev.map((group) =>
        group.id !== groupId
          ? group
          : { ...group, members: group.members.filter((member) => member.id !== memberId) }
      );
      const changedGroup = updated.find((group) => group.id === groupId);
      if (changedGroup) {
        void persistGroupToSupabase(changedGroup);
      }
      return updated;
    });
  };

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    void (async () => {
      try {
        const rowId = user?.id ? getUserGroupRowId(groupId, user.id) : groupId;
        await supabase.from('user_groups').delete().eq('id', rowId);
      } catch (err) {
        console.warn('Erro ao deletar grupo no Supabase:', err);
      }
    })();
  };

  const updateGroupName = (groupId: string, name: string) => {
    setGroups((prev) => {
      const updated = prev.map((group) => (group.id !== groupId ? group : { ...group, name }));
      const changedGroup = updated.find((group) => group.id === groupId);
      if (changedGroup) {
        void persistGroupToSupabase(changedGroup);
      }
      return updated;
    });
  };

  const toggleGroupStatus = (groupId: string) => {
    setGroups((prev) => {
      const updated = prev.map((group) =>
        group.id !== groupId
          ? group
          : ({
              ...group,
              status: group.status === 'active' ? 'paused' : 'active',
            } as Group)
      );
      const changedGroup = updated.find((group) => group.id === groupId);
      if (changedGroup) {
        void persistGroupToSupabase(changedGroup);
      }
      return updated;
    });
  };

  const getTotalPoints = () => members.reduce((acc, member) => acc + member.points, 0);

  const criarEnquete = async (
    titulo: string,
    locais: string[],
    datas: string[],
    ponderada: boolean,
    groupId?: string | null
  ) => {
    if (!user?.id) {
      throw new Error('Faça login para criar uma enquete.');
    }

    let createdEnqueteId: string | null = null;

    const dataCriacao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();

    const enqueteInput = {
      userid: user.id,
      groupid: groupId || null,
      datacriacao: dataCriacao,
      titulo,
      presentes: 0,
      fotos: 0,
      cor: '#004643',
      locais,
      datas,
      status: 'ativa',
      ponderada,
    };

    try {
      const { data: createdEnquete, error } = await supabase
        .from('enquetes')
        .insert(enqueteInput)
        .select('*')
        .single();

      if (error || !createdEnquete) {
        throw error || new Error('Erro ao salvar enquete no Supabase.');
      }

      const novaEnquete: Enquete = normalizeEnqueteRow(createdEnquete);
      createdEnqueteId = novaEnquete.id;

      setEnquetes((prev) => [novaEnquete, ...prev]);
    } catch (err) {
      console.warn('Erro ao criar enquete no Supabase:', err);
    }

    setPonderada(ponderada);
    setTituloEnquete(titulo);
    setEnqueteAtivaId(createdEnqueteId);
    setDatas(datas);
    setLocais(locais);
    // Compute totalConvidados using the freshest local group state first, then fall back to Supabase.
    if (groupId) {
      try {
        const targetGroup = groups.find((group) => group.id === groupId) || null;
        const localCount = targetGroup ? targetGroup.members.length : 0;

        const { data: rows, error } = await supabase.from('user_groups').select('group_data').eq("group_data->>id", groupId);
        let remoteCount = 0;
        if (!error && Array.isArray(rows)) {
          const memberSet = new Set<string>();
          for (const row of rows) {
            const gd = row.group_data as any;
            const membersArr = gd?.members ?? [];
            for (const m of membersArr) {
              const key = (m?.email || m?.id || JSON.stringify(m)).toString().toLowerCase();
              memberSet.add(key);
            }
          }
          remoteCount = memberSet.size;
        }

        setTotalConvidados(Math.max(localCount, remoteCount, targetGroup?.members.length || 0));
      } catch (e) {
        const targetGroup = groups.find((group) => group.id === groupId) || null;
        setTotalConvidados(targetGroup ? targetGroup.members.length : 10);
      }
    } else {
      const targetGroup = groups.length > 0 ? groups[0] : null;
      setTotalConvidados(targetGroup ? targetGroup.members.length : 10);
    }
    setConfirmados(0);
    if (groupId) {
      // notify group members via push
      notifyGroupMembers(groupId, 'Nova enquete no grupo', `"${titulo}" foi criada.`).catch(() => {});
    } else {
      // local feedback for non-group enquete
      try {
        // show a short local notification (if Notifications available)
        const { default: Notifications } = await import('expo-notifications');
        if (Notifications && typeof Notifications.scheduleNotificationAsync === 'function') {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Enquete criada',
              body: `${titulo} foi criada com sucesso.`,
            },
            trigger: null,
          });
        }
      } catch (e) {
        // ignore if native notifications not available
      }
    }
  };

  const encerrarResenha = async (enqueteId?: string) => {
    if (!user?.id) {
      throw new Error('Faça login para encerrar uma enquete.');
    }

    console.log('encerrarResenha called', { enqueteId, enquetesLength: enquetes.length, tituloEnquete });

    const targetEnquete =
      (enqueteId ? enquetes.find((enquete) => enquete.id === enqueteId) : null) ||
      enquetes.find((enquete) => enquete.status === 'ativa' && enquete.titulo === tituloEnquete) ||
      null;

    if (!targetEnquete) {
      throw new Error('Enquete não encontrada.');
    }

    const dataEncerramento = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();

    console.log('encerrarResenha: updating enquete', { targetId: targetEnquete.id, dataEncerramento, confirmados });

    let updatedData: any = null;
    try {
      const res = await supabase
        .from('enquetes')
        .update({
          status: 'encerrada',
          dataencerramento: dataEncerramento,
          presentes: confirmados,
        })
        .eq('id', targetEnquete.id)
        .select('*')
        .single();

      if (res.error) {
        console.warn('encerrarResenha: supabase returned error', res.error, { targetId: targetEnquete.id });
        throw res.error;
      }
      updatedData = res.data;
      console.log('encerrarResenha: supabase update success', { targetId: targetEnquete.id });
    } catch (err) {
      console.warn('encerrarResenha: update failed', err, { targetId: targetEnquete.id });
      throw err;
    }

    const updatedEnquete = updatedData
      ? normalizeEnqueteRow(updatedData)
      : {
          ...targetEnquete,
          status: 'encerrada' as const,
          dataEncerramento,
          presentes: confirmados,
        };

    setEnquetes((prev) => prev.map((enquete) => (enquete.id === targetEnquete.id ? updatedEnquete : enquete)));

    setTituloEnquete('');
    setEnqueteAtivaId(null);
    setConfirmados(0);
    setTotalConvidados(0);
    setLocais([]);
    setDatas([]);
    setPonderada(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        session,
        authLoading,
        isInitializing,
        theme,
        toggleTheme,
        avatarColor,
        avatarUri,
        changeAvatarColor,
        changeAvatarPhoto,
        groups,
        createGroup,
        addGroupMember,
        removeGroupMember,
        deleteGroup,
        updateGroupName,
        toggleGroupStatus,
        signUp,
        signIn,
        resetPassword,
        signInWithProvider,
        signOut,
        score,
        setScore,
        tituloEnquete,
        setTituloEnquete,
        enqueteAtivaId,
        setEnqueteAtivaId,
        confirmados,
        setConfirmados,
        totalConvidados,
        setTotalConvidados,
        locais,
        setLocais,
        datas,
        setDatas,
        ponderada,
        setPonderada,
        albumPosts,
        setAlbumPosts,
        votosRegistrados,
        setVotosRegistrados,
        enquetes,
        members,
        pendingGroupInvites,
        inviteGroupMember: sendGroupInvite,
        acceptGroupInvite,
        rejectGroupInvite,
        encerrarResenha,
        criarEnquete,
        refreshAppData,
        fetchAggregatedGroupMembers,
        attemptRegisterPush,
        getTotalPoints,
        saveProfile,
        updateProfileName,
        generateUniqueNickname,
        loadingData,
        colors,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro do AppProvider');
  }
  return context;
}

export default AppProvider;
