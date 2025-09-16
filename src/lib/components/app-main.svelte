<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { cn } from '$lib/utils';
	import type { ClassValue } from 'clsx';
	import type { Snippet } from 'svelte';

	let { children, class: kelas }: { children: Snippet; class?: ClassValue } = $props();
</script>

<ScrollArea class="@container h-0 grow">
	<div
		class={cn(
			'ml-[calc(var(--sidebar-width)*-1)] px-4 pt-4 pb-16 transition-[margin-left] duration-200 ease-linear group-has-[[data-slot=sidebar][data-collapsible=offcanvas]]/sidebar-wrapper:ml-0',
			kelas
		)}
	>
		{@render children()}
	</div>
</ScrollArea>
