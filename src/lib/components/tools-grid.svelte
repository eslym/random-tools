<script lang="ts">
	import type { ClassValue } from 'clsx';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
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
		<Card.Root>
			<Card.Header>
				<Card.Title>{item.title}</Card.Title>
				<Card.Description>{item.description}</Card.Description>
				<Card.Action>
					<Button variant="secondary" size="icon" href="{pathPrefix}{item.path}">
						<ExternalLinkIcon />
					</Button>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	{/each}
</div>
