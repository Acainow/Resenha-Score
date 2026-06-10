import { Slot } from 'expo-router';
import { AppProvider } from './_GlobalContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}
