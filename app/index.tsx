import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppContext } from './_GlobalContext';

export default function IndexRoute() {
  const { user, authLoading, loadingData, isInitializing } = useAppContext();

  if (authLoading || loadingData || isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#004643" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
