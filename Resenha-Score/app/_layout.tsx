import { Stack } from 'expo-router';
import { AppProvider } from './GlobalContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Garante que o grupo de abas seja a tela principal */}
        <Stack.Screen name="(tabs)" /> 
        
        {/* Registra a tela de detalhes para o router.push('/details') funcionar */}
        <Stack.Screen name="details" options={{ presentation: 'card' }} />
        
        {/* Se você tiver um modal.tsx na raiz, registre-o também */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AppProvider>
  );
}