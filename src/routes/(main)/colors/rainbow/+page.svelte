<script lang="ts" module>
	import Rainbow from 'rainbowvis.js';

	function defaultData() {
		return {
			colors: ['#000000', '#FFFFFF'],
			scale: 3
		};
	}

	const data = new PersistedState('rainbow-colors', defaultData());
	const rainbow = new Rainbow();

	let result = $derived.by(() => {
		try {
			rainbow.setSpectrumByArray(data.current.colors);
			rainbow.setNumberRange(0, data.current.scale - 1);
			return new Array(data.current.scale).fill(0).map((_, i) => `#${rainbow.colourAt(i)}`);
		} catch {
			data.current = defaultData();
			return [];
		}
	});
</script>

<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import { PersistedState } from 'runed';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import AppMain from '$lib/components/app-main.svelte';
	import * as ColorPicker from '$lib/components/ui/color-picker';
	import { Button } from '$lib/components/ui/button';
	import { ChevronsDownIcon, ChevronsUpIcon, MinusIcon } from '@lucide/svelte';
	import { Snippet } from '$lib/components/ui/snippet';

	let { data: meta } = $props();
</script>

<AppHeader {...meta} group="Color Tools" />

<AppMain class="w-xl" wrapperClass="px-4 pt-4 pb-16">
	<Card.Root>
		<Card.Header>
			<Card.Description>{meta.description}</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-2">
				{#each data.current.colors as color, index (`${index}-${color}`)}
					{@const isLast = index === data.current.colors.length - 1}
					<div class="flex gap-2">
						<Button
							variant="ghost"
							size="icon"
							disabled={index === 0}
							onclick={() => {
								const color = data.current.colors.splice(index, 1)[0];
								data.current.colors.splice(index - 1, 0, color);
							}}
						>
							<ChevronsUpIcon />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							disabled={isLast}
							onclick={() => {
								const color = data.current.colors.splice(index, 1)[0];
								data.current.colors.splice(index + 1, 0, color);
							}}
						>
							<ChevronsDownIcon />
						</Button>
						<ColorPicker.Root bind:value={data.current.colors[index]}>
							<ColorPicker.Trigger class="grow">Pick a Color</ColorPicker.Trigger>
							<ColorPicker.Picker />
						</ColorPicker.Root>
						<Button
							variant="destructive"
							disabled={data.current.colors.length <= 2}
							size="icon"
							onclick={() => {
								data.current.colors.splice(index, 1);
							}}
						>
							<MinusIcon />
						</Button>
					</div>
				{/each}
				<div class="mt-2 flex justify-end">
					<Button
						variant="secondary"
						class="mt-2"
						onclick={() => {
							const last = data.current.colors[data.current.colors.length - 1];
							data.current.colors.push(last);
						}}
					>
						Add Color
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
	<Card.Root class="mt-6">
		<Card.Header>
			<Card.Title>Color Scale</Card.Title>
			<Card.Description>The number of colors to generate in the gradient.</Card.Description>
			<Card.Action>
				<Input type="number" min={2} class="w-24" bind:value={data.current.scale} />
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-2">
				{#each result as color}
					<div class="flex">
						<div
							class="checkerboard aspect-square h-full w-auto overflow-hidden rounded-l-md border-y border-l"
						>
							<div class="size-full" style:background-color={color}></div>
						</div>
						<Snippet text={color} class="w-0 grow rounded-l-none" />
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</AppMain>

<style>
	.checkerboard {
		background: repeating-conic-gradient(#fff 0% 25%, #000 0% 50%, #fff 0% 75%, #000 0% 100%);
		background-size: 100% 100%;
		background-clip: padding-box;
	}
</style>
