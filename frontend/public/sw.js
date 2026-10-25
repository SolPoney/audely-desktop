// Service worker minimal : affiche les notifications push et ramène
// l'utilisateur sur l'app au clic. Pas de cache / mode hors-ligne (hors
// scope) — seul le push est géré ici.

self.addEventListener('push', (event) => {
	let data = { titre: 'Audely', corps: 'Un exercice vous attend.' };
	try {
		if (event.data) data = event.data.json();
	} catch {
		// payload non-JSON : on garde le message par défaut
	}

	event.waitUntil(
		self.registration.showNotification(data.titre, {
			body: data.corps,
			icon: '/favicon.svg',
			badge: '/favicon.svg',
			tag: 'audely-rappel',
		}),
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if ('focus' in client) return client.focus();
			}
			if (self.clients.openWindow) return self.clients.openWindow('/dashboard');
		}),
	);
});
