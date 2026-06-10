import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from './_GlobalContext';

const socialProviders: Array<{ provider: 'google'; label: string; icon: string; color: string }> = [
  { provider: 'google', label: 'Continuar com Google', icon: 'logo-google', color: '#DB4437' },
];

export default function Login() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, signInWithProvider, authLoading, colors } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const mapAuthError = (message?: string | null) => {
    if (!message) return 'Erro ao processar solicitação';
    const lowerMessage = message.toLowerCase();
    if (message.includes('Invalid login credentials')) return 'Credenciais inválidas';
    if (message.includes('User not found')) return 'Usuário não encontrado';
    if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('account not confirmed')) return 'Verifique seu email para confirmar a conta antes de entrar.';
    if (lowerMessage.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres';
    if (lowerMessage.includes('invalid email') || lowerMessage.includes('invalid email address')) return 'Email inválido';
    if (lowerMessage.includes('no user found') || lowerMessage.includes('unconfirmed')) return 'Usuário não encontrado ou não confirmado.';
    if (message.includes('Tempo de conexão esgotado') || lowerMessage.includes('sem conexão') || lowerMessage.includes('connection')) {
      return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
    }
    return message;
  };

  const handleSubmit = async () => {
    setError(null);
    setResetMessage(null);
    if (!email.trim()) {
      setError('Informe seu email para continuar.');
      return;
    }
    if (isResetMode) {
      try {
        await resetPassword(email.trim());
        setResetMessage('E-mail de recuperação enviado. Verifique sua caixa de entrada.');
        setError(null);
      } catch (err: any) {
        setError(mapAuthError(err?.message));
      }
      return;
    }
    if (!password) {
      setError('Informe sua senha para continuar.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Informe seu nome para criar a conta.');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, name.trim());
        setError('Verifique seu email para confirmar a conta');
      } else {
        await signIn(email.trim(), password);
        router.replace('/');
      }
    } catch (err: any) {
      setError(mapAuthError(err?.message));
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    setError(null);
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      setError(err?.message || 'Erro ao autenticar');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBox}>
          <View style={[styles.logoCircle, { backgroundColor: colors.menuButtonBg }]}> 
            <Ionicons name="sparkles" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.heading, { color: colors.text }]}>Bem-vindo</Text>
          <Text style={[styles.subheading, { color: colors.subtitle }]}>Entre para criar resenhas, ver seu histórico e gerenciar seu grupo com estilo.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>{isResetMode ? 'Recuperar senha' : isSignUp ? 'Criar conta' : 'Entrar'}</Text>

          {isSignUp && !isResetMode && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.menuButtonBg }]}
              placeholder="Nome"
              value={name}
              onChangeText={setName}
              editable={!authLoading}
              placeholderTextColor={colors.subtitle}
            />
          )}

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.menuButtonBg }]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!authLoading}
            placeholderTextColor={colors.subtitle}
          />

          {!isResetMode && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.menuButtonBg }]}
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!authLoading}
              placeholderTextColor={colors.subtitle}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {resetMessage ? <Text style={[styles.success, { color: '#16A34A' }]}>{resetMessage}</Text> : null}

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={authLoading}>
            {authLoading ? (
              <ActivityIndicator color={colors.avatarText} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.avatarText }]}>{isResetMode ? 'Enviar link de recuperação' : isSignUp ? 'Registrar' : 'Entrar'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            {!isResetMode ? (
              <>
                <Text style={[styles.switchText, { color: colors.subtitle }]}>{isSignUp ? 'Já tem conta?' : 'Não tem conta?'}</Text>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={authLoading}>
                  <Text style={[styles.switchAction, { color: colors.primary }]}>{isSignUp ? 'Entrar' : 'Registre-se'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.switchText, { color: colors.subtitle }]}>Lembrou a senha?</Text>
            )}
              <TouchableOpacity style={styles.rightAction} onPress={() => { setIsResetMode(!isResetMode); setError(null); setResetMessage(null); }} disabled={authLoading}>
                <Text style={[styles.switchAction, { color: colors.primary }]}>{isResetMode ? 'Voltar' : 'Esqueci a senha'}</Text>
              </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.menuButtonBg }]} />
          <Text style={[styles.dividerText, { color: colors.subtitle }]}>ou</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.menuButtonBg }]} />
        </View>

        <View style={styles.socialContainer}>
          {socialProviders.map((item) => (
            <TouchableOpacity
              key={item.provider}
              style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}
              onPress={() => handleSocialLogin(item.provider)}
              disabled={authLoading}
            >
              <View style={[styles.iconBox, { borderColor: item.color, backgroundColor: colors.background }]}> 
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.socialText, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F1724',
    textAlign: 'center',
  },
  subheading: {
    marginTop: 10,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1724',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    color: '#0F1724',
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  error: {
    color: '#C53030',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  success: {
    color: '#16A34A',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchText: {
    color: '#475569',
    fontSize: 14,
    marginRight: 6,
  },
  switchAction: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '700',
  },
  rightAction: {
    marginLeft: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  socialContainer: {
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  appleButton: {
    borderColor: '#111111',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#F8FAFC',
  },
  socialText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F1724',
  },
  appleText: {
    color: '#111827',
  },
});
