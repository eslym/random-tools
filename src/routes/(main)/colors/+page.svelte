<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import AppMain from '$lib/components/app-main.svelte';
	import ToolsGrid from '$lib/components/tools-grid.svelte';

	let { data: meta } = $props();
</script>

<AppHeader {...meta} />

<AppMain class="w-full px-8 pt-8 pb-16 max-md:px-4">
	<ToolsGrid items={meta.items} pathPrefix="/colors" />
</AppMain>
