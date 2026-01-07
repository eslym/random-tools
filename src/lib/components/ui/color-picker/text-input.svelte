<script lang="ts">
	import type { HsvaColor, RgbaColor } from 'svelte-awesome-color-picker';
	import { Input } from '../input/index.js';
	import * as ToggleGroup from '../toggle-group/index.js';
	import * as ButtonGroup from '../button-group/index.js';

	const HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{8})$/i;

	interface Props {
		isAlpha: boolean;
		rgb: RgbaColor;
		hsv: HsvaColor;
		hex: string;
		textInputModes: Array<'hex' | 'rgb' | 'hsv'>;
		onInput: (color: { hsv?: HsvaColor; rgb?: RgbaColor; hex?: string }) => void;
	}

	let {
		isAlpha,
		rgb = $bindable(),
		hsv = $bindable(),
		hex = $bindable(),
		textInputModes,
		onInput
	}: Props = $props();

	let h = $derived(Math.round(hsv.h));
	let s = $derived(Math.round(hsv.s));
	let v = $derived(Math.round(hsv.v));
	let a = $derived(hsv.a === undefined ? 1 : Math.round(hsv.a * 100) / 100);

	// svelte-ignore state_referenced_locally
	let mode = $state(textInputModes[0] || 'hex');

	const inputs = {
		hexInput,
		rgbInput,
		hsvInput
	};

	let inputSnippet = $derived(inputs[`${mode}Input`]);

	$effect(() => {
		if (!textInputModes.includes(mode)) {
			mode = textInputModes[0];
		}
	});

	function updateHex(newVal: string) {
		if (HEX_COLOR_REGEX.test(newVal)) {
			hex = newVal;
			onInput({ hex });
		}
	}

	function updateRgb(property: string) {
		return function (e: Event & { currentTarget: HTMLInputElement }) {
			let value = parseFloat((e.target as HTMLInputElement).value);
			rgb = { ...rgb, [property]: isNaN(value) ? 0 : value };
			onInput({ rgb });
		};
	}

	function updateHsv(property: string) {
		return function (e: Event & { currentTarget: HTMLInputElement }) {
			let value = parseFloat((e.target as HTMLInputElement).value);
			hsv = { ...hsv, [property]: isNaN(value) ? 0 : value };
			onInput({ hsv });
		};
	}
</script>

{#snippet hexInput()}
	<Input
		value={hex}
		maxlength={9}
		class="w-full min-w-0"
		onchange={(e) => updateHex(e.currentTarget.value)}
		aria-label="HEX"
		placeholder="HEX"
	/>
{/snippet}

{#snippet rgbInput()}
	<ButtonGroup.Root class="w-full">
		<Input
			value={rgb.r}
			maxlength={9}
			class="min-w-0 flex-1"
			onchange={updateRgb('r')}
			aria-label="R"
			placeholder="R"
		/>
		<Input
			value={rgb.g}
			maxlength={9}
			class="min-w-0 flex-1"
			onchange={updateRgb('g')}
			aria-label="G"
			placeholder="G"
		/>
		<Input
			value={rgb.b}
			maxlength={9}
			class="min-w-0 flex-1"
			onchange={updateRgb('b')}
			aria-label="B"
			placeholder="B"
		/>
		{#if isAlpha}
			<Input
				value={a}
				min={0}
				max={1}
				step={0.01}
				class="min-w-0 flex-1"
				onchange={updateRgb('a')}
				aria-label="A"
				placeholder="A"
			/>
		{/if}
	</ButtonGroup.Root>
{/snippet}

{#snippet hsvInput()}
	<ButtonGroup.Root class="w-full">
		<Input
			value={h}
			maxlength={9}
			class="min-w-0 flex-1"
			onchange={updateHsv('h')}
			aria-label="H"
			placeholder="H"
		/>
		<Input
			value={s}
			maxlength={9}
			class="min-w-0 flex-1"
			onchange={updateHsv('s')}
			aria-label="S"
			placeholder="S"
		/>
		<Input
			value={v}
			maxlength={9}
			class="min-w-0 flex-1"
			onchange={updateHsv('v')}
			aria-label="V"
			placeholder="V"
		/>
		{#if isAlpha}
			<Input
				value={a}
				min={0}
				max={1}
				step={0.01}
				class="min-w-0 flex-1"
				onchange={updateHsv('a')}
				aria-label="A"
				placeholder="A"
			/>
		{/if}
	</ButtonGroup.Root>
{/snippet}

<div class="flex flex-col gap-1.5">
	{@render inputSnippet()}
	{#if textInputModes.length > 1}
		<ToggleGroup.Root type="single" bind:value={mode} variant="outline" class="w-full">
			{#each textInputModes as textInputMode}
				<ToggleGroup.Item value={textInputMode} class="flex-1">
					{textInputMode.toUpperCase()}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	{/if}
</div>
