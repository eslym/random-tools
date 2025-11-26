<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/theme.svelte';
	import { browser } from '$app/environment';

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
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
