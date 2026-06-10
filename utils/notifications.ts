export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
}

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]) {
  if (!messages.length) return;

  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  await Promise.all(
    chunks.map((chunk) =>
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Expo push error', response.status, errorText);
        }
      })
    )
  );
}
