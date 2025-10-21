export async function networkFirst(request: RequestInfo, cacheName: string) {
	try {
		const res = await fetch(request);
		if (!res.ok) return res;
		const cache = await caches.open(cacheName);
		cache.put(request, res.clone());
		return res;
	} catch (error) {
		const cache = await caches.open(cacheName);
		const res = await cache.match(request);
		if (res) return res;
		throw error;
	}
}

export async function cacheFirst(request: RequestInfo, cacheName: string) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) {
		return cached;
	}
	const res = await fetch(request);
	if (res.ok) {
		cache.put(request, res.clone());
	}
	return res;
}
