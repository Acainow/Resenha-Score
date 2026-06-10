import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'resenha_push_token_v1';

export async function getStoredPushToken(): Promise<string | null> {
	try {
		const v = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
		return v || null;
	} catch (e) {
		console.warn('getStoredPushToken failed', e);
		return null;
	}
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
	try {
		const Device = await import('expo-device').catch(() => null);
		const Notifications = await import('expo-notifications').catch(() => null);

		if (!Notifications || !Device) {
			console.warn('registerForPushNotificationsAsync: native notifications/device modules not available in this environment');
			return null;
		}

		if (!Device.isDevice) {
			console.warn('registerForPushNotificationsAsync: not a physical device');
			return null;
		}

		const perm = await Notifications.getPermissionsAsync();
		let finalStatus = perm.status || perm.granted || 'undetermined';
		if (finalStatus !== 'granted') {
			const req = await Notifications.requestPermissionsAsync();
			finalStatus = req.status || req.granted || finalStatus;
		}

		if (finalStatus !== 'granted') {
			console.warn('registerForPushNotificationsAsync: permission not granted');
			return null;
		}

		const tokenData = await Notifications.getExpoPushTokenAsync();
		const token = (tokenData && (tokenData as any).data) || null;
		if (!token) {
			console.warn('registerForPushNotificationsAsync: no token returned');
			return null;
		}

		try {
			await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
		} catch (e) {
			console.warn('registerForPushNotificationsAsync: failed to persist token', e);
		}
		return token;
	} catch (err) {
		console.warn('registerForPushNotificationsAsync: unexpected error', err);
		return null;
	}
}

export default registerForPushNotificationsAsync;
