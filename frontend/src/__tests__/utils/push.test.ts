import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { estSupportePush, activerNotifications, desactiverNotifications, getAbonnementExistant } from "../../utils/push";

const API = "http://api.test";

describe("estSupportePush", () => {
	afterEach(() => {
		// @ts-expect-error — nettoyage entre tests
		delete (window as any).PushManager;
	});

	it("false si PushManager absent (jsdom par défaut)", () => {
		expect(estSupportePush()).toBe(false);
	});

	it("true si serviceWorker + PushManager + Notification sont présents", () => {
		(window as any).PushManager = function () {};
		Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });
		(window as any).Notification = function () {};
		expect(estSupportePush()).toBe(true);
	});
});

describe("activerNotifications", () => {
	let mockRegistration: any;
	let mockSubscription: any;

	beforeEach(() => {
		vi.restoreAllMocks();

		mockSubscription = {
			toJSON: () => ({ endpoint: "https://push.example.com/abc", keys: { p256dh: "p", auth: "a" } }),
		};
		mockRegistration = {
			pushManager: { subscribe: vi.fn().mockResolvedValue(mockSubscription) },
		};

		(window as any).PushManager = function () {};
		(window as any).Notification = { requestPermission: vi.fn().mockResolvedValue("granted") };
		Object.defineProperty(navigator, "serviceWorker", {
			value: {
				register: vi.fn().mockResolvedValue(mockRegistration),
				ready: Promise.resolve(mockRegistration),
				getRegistration: vi.fn().mockResolvedValue(mockRegistration),
			},
			configurable: true,
		});

		global.fetch = vi.fn()
			.mockResolvedValueOnce({ json: async () => ({ publicKey: "ZmFrZS1rZXk" }) }) // vapid-public-key
			.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "ok" }) }); // subscribe
	});

	it("enregistre le SW, demande la permission, s'abonne et poste l'abonnement au backend", async () => {
		await activerNotifications(API, "token-123");

		expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
		expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith(
			expect.objectContaining({ userVisibleOnly: true }),
		);
		expect(global.fetch).toHaveBeenNthCalledWith(2, `${API}/api/push/subscribe`, expect.objectContaining({
			method: "POST",
			body: JSON.stringify({ endpoint: "https://push.example.com/abc", keys: { p256dh: "p", auth: "a" } }),
		}));
	});

	it("rejette si la permission est refusée, sans jamais appeler subscribe", async () => {
		(window as any).Notification.requestPermission = vi.fn().mockResolvedValue("denied");

		await expect(activerNotifications(API, "token-123")).rejects.toThrow("Permission refusée.");
		expect(mockRegistration.pushManager.subscribe).not.toHaveBeenCalled();
	});

	it("rejette si le navigateur ne supporte pas le push", async () => {
		delete (window as any).PushManager;

		await expect(activerNotifications(API, "token-123")).rejects.toThrow(/pas prises en charge/);
	});
});

describe("desactiverNotifications / getAbonnementExistant", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		(window as any).PushManager = function () {};
		(window as any).Notification = function () {};
	});

	it("getAbonnementExistant renvoie null si aucun service worker enregistré", async () => {
		Object.defineProperty(navigator, "serviceWorker", {
			value: { getRegistration: vi.fn().mockResolvedValue(undefined) },
			configurable: true,
		});
		expect(await getAbonnementExistant()).toBeNull();
	});

	it("desactiverNotifications se désabonne côté navigateur et informe le backend", async () => {
		const unsubscribe = vi.fn().mockResolvedValue(true);
		const subscription = { endpoint: "https://push.example.com/abc", unsubscribe };
		Object.defineProperty(navigator, "serviceWorker", {
			value: {
				getRegistration: vi.fn().mockResolvedValue({
					pushManager: { getSubscription: vi.fn().mockResolvedValue(subscription) },
				}),
			},
			configurable: true,
		});
		global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

		await desactiverNotifications(API, "token-123");

		expect(unsubscribe).toHaveBeenCalled();
		expect(global.fetch).toHaveBeenCalledWith(`${API}/api/push/unsubscribe`, expect.objectContaining({
			method: "POST",
			body: JSON.stringify({ endpoint: "https://push.example.com/abc" }),
		}));
	});

	it("desactiverNotifications ne fait rien si aucun abonnement actif", async () => {
		Object.defineProperty(navigator, "serviceWorker", {
			value: { getRegistration: vi.fn().mockResolvedValue(undefined) },
			configurable: true,
		});
		global.fetch = vi.fn();

		await desactiverNotifications(API, "token-123");

		expect(global.fetch).not.toHaveBeenCalled();
	});
});
