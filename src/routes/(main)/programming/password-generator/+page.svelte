<script lang="ts" module>
	import { type GenOptions, PasswordGenerator } from './generator';

	function defaultData(): Required<GenOptions> & { length: number; amount: number } {
		return {
			alpha: true,
			numeric: true,
			symbols: true,
			urlSafe: false,
			exclude: '',
			requireEach: true,
			noRepeatWindow: 0,
			length: 16,
			amount: 1
		};
	}

	const generator = new PasswordGenerator();
	const data = new PersistedState('password-generator', defaultData());

	let validation = $derived(generator.validatePool(data.current, data.current.length));
	let constraints = $derived.by(() => {
		const { emptyPool, uniqueCandidates, activeCategoryCount } = validation;
		if (emptyPool) return { min: 1, max: null };
		let min = 1;
		let max = null;
		if (data.current.requireEach) {
			min = activeCategoryCount;
		}
		if (data.current.noRepeatWindow > 0 && uniqueCandidates < data.current.noRepeatWindow + 1) {
			max = uniqueCandidates;
		}
		return { min, max };
	});
</script>

<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import { PersistedState } from 'runed';
	import AppMain from '$lib/components/app-main.svelte';
	import * as Card from '$lib/components/ui/card';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { preventDefault } from '$lib/events';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Snippet } from '$lib/components/ui/snippet';
	import NumInput from '$lib/components/num-input.svelte';

	let { data: meta } = $props();

	let passwords = $state<string[]>([]);

	$effect(() => {
		if (data.current.length < constraints.min) {
			data.current.length = constraints.min;
		} else if (constraints.max !== null && data.current.length > constraints.max) {
			data.current.length = constraints.max;
		}
	});
</script>

<AppHeader {...meta} group="Programming Tools" />

<svelte:boundary onerror={() => (data.current = defaultData())}>
	<AppMain class="w-xl" wrapperClass="px-4 pt-4 pb-16">
		<Card.Root>
			<Card.Header>
				<Card.Description>
					{meta.description}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					class="contents"
					id="options-form"
					onsubmit={preventDefault(
						() =>
							(passwords = new Array(data.current.amount)
								.fill('')
								.map(() => generator.generate(data.current.length, data.current)))
					)}
				>
					<div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-6 gap-y-4">
						<Label><Switch bind:checked={data.current.alpha} /> Alpha Characters</Label>
						<Label><Switch bind:checked={data.current.numeric} /> Numeric Characters</Label>
						<Label><Switch bind:checked={data.current.symbols} /> Symbol Characters</Label>
						<Label>
							<Switch
								bind:checked={
									() => data.current.symbols && data.current.urlSafe,
									(v) => (data.current.urlSafe = v)
								}
								disabled={!data.current.symbols}
								class="peer"
							/>
							<span class="peer-disabled:text-muted-foreground"> URL Safe Symbols Only</span>
						</Label>
						<Label>
							<Switch bind:checked={data.current.requireEach} /> Require Each Selected Type
						</Label>
					</div>
					<div class="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 @max-md:grid-cols-1">
						<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
							<Label for="exclude">Exclude Characters</Label>
							<Input id="exclude" type="text" bind:value={data.current.exclude} />
						</div>
						<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
							<Label for="no-repeat">No Repeat Window</Label>
							<NumInput id="no-repeat" bind:value={data.current.noRepeatWindow} min={0} />
						</div>
						<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
							<Label for="length">Password Length</Label>
							<NumInput id="length" bind:value={data.current.length} {...constraints} />
						</div>
						<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
							<Label for="amount">Amount of Passwords</Label>
							<NumInput id="amount" bind:value={data.current.amount} min={1} />
						</div>
					</div>
					<ul class="mt-6 list-inside list-disc text-sm text-destructive">
						{#each validation.errors as error (error)}
							<li>{error}</li>
						{/each}
					</ul>
				</form>
			</Card.Content>
			<Card.Footer class="flex justify-end">
				<Button type="submit" form="options-form" disabled={Boolean(validation.errors.length)}>
					Generate
				</Button>
			</Card.Footer>
		</Card.Root>
		{#if passwords.length}
			<Card.Root class="mt-6">
				<Card.Header>
					<Card.Description>
						{passwords.length > 1 ? 'These passwords' : 'This password'} will not be stored anywhere,
						please note them down before you go away.
					</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					{#each passwords as password}
						<Snippet text={password} />
					{/each}
				</Card.Content>
			</Card.Root>
		{/if}
	</AppMain>
</svelte:boundary>
