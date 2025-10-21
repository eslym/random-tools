/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
/// <reference types="../../.svelte-kit/ambient.d.ts" />

import { build, files, prerendered, version } from '$service-worker';
import { cacheFirst, networkFirst } from './caches';
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const ASSETS = new Set<string>([...build, ...files, ...prerendered]);
const CACHE = `cache-${version}`;
const GFONTS_ORIGINS = new Set<string>([
	'https://fonts.googleapis.com',
	'https://fonts.gstatic.com'
]);
const GFONTS_CACHE = 'gfonts-cache-v1';
const METHODS = new Set<string>(['GET', 'HEAD']);

async function addFilesToCache() {
	if (import.meta.env.DEV) return;
	try {
		const cache = await caches.open(CACHE);
		await cache.addAll([...ASSETS]);
	} catch (error) {
		console.warn('Failed to cache assets during install:', error);
	}
}

async function clearOldCaches() {
	if (import.meta.env.DEV) return;
	const keys = await caches.keys();
	await Promise.all(
		keys.map((key) => {
			if (key !== CACHE && key !== GFONTS_CACHE) {
				return caches.delete(key);
			}
		})
	);
}

async function activate() {
	await clearOldCaches();
	await self.clients.claim();
}

self.addEventListener('install', (event) => {
	event.waitUntil(Promise.all([self.skipWaiting(), addFilesToCache()]));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(activate());
});

self.addEventListener('fetch', (event) => {
	if (!METHODS.has(event.request.method)) return;
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) {
		if (!GFONTS_ORIGINS.has(url.origin)) return;
		if (event.request.destination === 'style') {
			event.respondWith(networkFirst(event.request, GFONTS_CACHE));
		} else if (event.request.destination === 'font') {
			event.respondWith(cacheFirst(event.request, GFONTS_CACHE));
		}
		return;
	}
	if (ASSETS.has(url.pathname)) {
		event.respondWith(cacheFirst(url.pathname, CACHE));
	}
});
