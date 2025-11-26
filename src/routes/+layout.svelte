<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/theme.svelte';
	import { browser } from '$app/environment';
	import * as Dialog from '$lib/components/ui/dialog';
	import { update } from '$lib/stores/update.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { updated } from '$app/state';
	import { serviceWorkerSupported, updateServiceWorker } from '$lib/sw';
	import { beforeNavigate } from '$app/navigation';

	let { children } = $props();

	if (browser) {
		const themeColor = document.querySelector('meta[name="theme-color"]');

		$effect(() => {
			if (theme.current === 'dark') {
				document.documentElement.classList.add('dark');
				themeColor?.setAttribute('content', '#fcfcff');
			} else {
				document.documentElement.classList.remove('dark');
				themeColor?.setAttribute('content', '#f9f9ff');
			}
		});

		/**
		 * If service worker is supported, update it and it will trigger the prompt for reload,
		 * otherwise listen to navigation events and force a full reload if there's an update.
		 *
		 * When service worker is available, it will cache the old version, so it is ok not to reload,
		 * but when it's not available, we need to reload to ensure the app is not trying to load
		 * outdated resources (ex: missing javascript files).
		 *
		 * @see https://svelte.dev/docs/kit/configuration#version
		 */
		if (serviceWorkerSupported()) {
			$effect(() => {
				if (updated.current) {
					// try to avoid cdn caching issues by delaying the update check
					setTimeout(updateServiceWorker, 30_000);
				}
			});
		} else {
			beforeNavigate(({ willUnload, to }) => {
				if (updated.current && !willUnload && to?.url) {
					location.href = to.url.href;
				}
			});
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Dialog.Root bind:open={update.found}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update Available</Dialog.Title>
			<Dialog.Description>
				A new version of Random Tools is available. Please refresh the page to get the latest
				features and improvements.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: 'secondary' })}>Cancel</Dialog.Close>
			<Button onclick={() => location.reload()}>Refresh</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
