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
				themeColor?.setAttribute('content', '#131119');
			} else {
				document.documentElement.classList.remove('dark');
				themeColor?.setAttribute('content', '#f9f9ff');
			}
		});

		if (serviceWorkerSupported()) {
			$effect(() => {
				if (updated.current) {
					updateServiceWorker();
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
