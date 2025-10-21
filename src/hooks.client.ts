async function setupServiceWorker() {
	if (!('navigator' in window) || !('serviceWorker' in navigator)) return;
	const reg = await navigator.serviceWorker.register('/service-worker.js', {
		type: import.meta.env.DEV ? 'module' : 'classic'
	});
	reg.addEventListener('updatefound', () => {
		const worker = reg.installing!;
		worker.addEventListener('statechange', () => {
			if (worker.state === 'installed') {
				if (navigator.serviceWorker.controller) {
					if (import.meta.env.DEV) console.log('Service worker updated');
					setTimeout(() => location.reload(), 100);
				}
			}
		});
	});
}

export function init() {
	setupServiceWorker();
}
