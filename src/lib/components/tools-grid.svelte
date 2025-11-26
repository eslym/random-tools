<script lang="ts">
	import type { ClassValue } from 'clsx';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Item from '$lib/components/ui/item';
	import { ExternalLinkIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let {
		items,
		pathPrefix = '',
		class: kelas
	}: {
		items: { title: string; description: string; path: string }[];
		pathPrefix?: string;
		class?: ClassValue;
	} = $props();
</script>

<div
	class={cn(
		'grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-x-4 gap-y-6',
		kelas
	)}
>
	{#each items as item (item.path)}
		<Item.Root variant="muted">
			<Item.Content>
				<Item.Title>{item.title}</Item.Title>
				<Item.Description>{item.description}</Item.Description>
			</Item.Content>
			<Item.Actions>
				<Button variant="secondary" size="icon" href="{pathPrefix}{item.path}">
					<ExternalLinkIcon />
				</Button>
			</Item.Actions>
		</Item.Root>
	{/each}
</div>
