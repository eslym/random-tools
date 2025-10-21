<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ToolsGrid from '$lib/components/tools-grid.svelte';

	let { data } = $props();
</script>

<AppHeader title="Home" description="Several random tools which might be useful." />

<ScrollArea class="grow px-8 pt-8 pb-16 max-md:px-4">
	<div class="flex flex-col gap-8">
		{#each data.menu as group (group.path)}
			<div>
				<h2 class="text-sm font-semibold">{group.title}</h2>
				<ToolsGrid items={group.items} pathPrefix={group.path} class="mt-4" />
			</div>
		{/each}
	</div>
</ScrollArea>
