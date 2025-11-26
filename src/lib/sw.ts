import { update } from '$lib/stores/update.svelte';

export function serviceWorkerSupported() {
	return 'navigator' in window && 'serviceWorker' in navigator;
}

export async function setupServiceWorker() {
	if (!serviceWorkerSupported()) return;
	const reg = await navigator.serviceWorker.register('/service-worker.js', {
		type: import.meta.env.DEV ? 'module' : 'classic'
	});
	reg.addEventListener('updatefound', () => {
		const worker = reg.installing!;
		worker.addEventListener('statechange', () => {
			if (import.meta.env.DEV) console.log('Worker state changed to', worker.state);
			if (worker.state === 'installed') {
				if (navigator.serviceWorker.controller) {
					if (import.meta.env.DEV) console.log('Service worker updated');
					update.found = true;
				}
			}
		});
	});
}

export async function updateServiceWorker() {
	if (!serviceWorkerSupported()) return;
	const reg = await navigator.serviceWorker.getRegistration();
	if (reg) {
		await reg.update();
	} else {
		await setupServiceWorker();
	}
}
