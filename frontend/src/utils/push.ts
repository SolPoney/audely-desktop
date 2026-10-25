/** Les notifications push (Web Push/VAPID) sont-elles utilisables sur ce navigateur ? */
export const estSupportePush = (): boolean =>
	'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/** Convertit la clé publique VAPID (base64 URL-safe) au format attendu par PushManager.subscribe. */
const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const array = new Uint8Array(new ArrayBuffer(rawData.length));
	for (let i = 0; i < rawData.length; i++) array[i] = rawData.charCodeAt(i);
	return array;
};

/** Abonnement push existant pour ce navigateur, s'il y en a un. */
export const getAbonnementExistant = async (): Promise<PushSubscription | null> => {
	if (!estSupportePush()) return null;
	const registration = await navigator.serviceWorker.getRegistration();
	if (!registration) return null;
	return registration.pushManager.getSubscription();
};

/**
 * Active les notifications : enregistre le service worker, demande la
 * permission, s'abonne auprès du navigateur puis envoie l'abonnement au
 * backend. Lève une erreur avec un message utilisateur en cas d'échec.
 */
export const activerNotifications = async (apiUrl: string, token: string): Promise<void> => {
	if (!estSupportePush()) {
		throw new Error("Les notifications ne sont pas prises en charge sur ce navigateur.");
	}

	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		throw new Error('Permission refusée.');
	}

	const registration = await navigator.serviceWorker.register('/sw.js');
	await navigator.serviceWorker.ready;

	const { publicKey } = await fetch(`${apiUrl}/api/push/vapid-public-key`).then((r) => r.json());
	if (!publicKey) {
		throw new Error('Clé de notification indisponible.');
	}

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicKey),
	});

	const json = subscription.toJSON();
	await fetch(`${apiUrl}/api/push/subscribe`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
	});
};

/** Désactive les notifications : se désabonne côté navigateur et côté backend. */
export const desactiverNotifications = async (apiUrl: string, token: string): Promise<void> => {
	const subscription = await getAbonnementExistant();
	if (!subscription) return;

	const endpoint = subscription.endpoint;
	await subscription.unsubscribe();

	await fetch(`${apiUrl}/api/push/unsubscribe`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body: JSON.stringify({ endpoint }),
	});
};
