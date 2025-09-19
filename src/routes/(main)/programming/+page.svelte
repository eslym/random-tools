<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import ToolsGrid from '$lib/components/tools-grid.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let { data: meta } = $props();
</script>

<AppHeader {...meta} />

<ScrollArea class="grow px-8 pt-8 pb-16 max-md:px-4">
	<ToolsGrid items={meta.items} pathPrefix="/programming" />
</ScrollArea>
