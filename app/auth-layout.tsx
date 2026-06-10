import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppContext } from './_GlobalContext';

export default function AuthLayout() {
  const router = useRouter();
  const { user, session, authLoading, loadingData, isInitializing, colors } = useAppContext();

  useEffect(() => {
    if (authLoading || loadingData || isInitializing) return;

    if (!session || !user) {
      // Não autenticado, redireciona para login
      router.replace('/login');
    }
  }, [session, user, authLoading, loadingData, isInitializing, router]);

  if (authLoading || loadingData || isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}
