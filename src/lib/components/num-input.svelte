<script lang="ts">
	import type { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { cn } from '$lib/utils';
	import { MinusIcon, PlusIcon } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		value?: number | null;
		min?: number | null;
		max?: number | null;
		step?: number;
		'input-class'?: ClassValue | null;
	};

	let {
		value = $bindable(null),
		min = -Infinity,
		max = Infinity,
		step = 1,
		disabled = false,
		class: kelas = null,
		'input-class': inputClass = null,
		...attrs
	}: Props & Omit<ComponentProps<typeof Input>, keyof Props | 'type' | 'files'> = $props();

	let _min = $derived(min ?? -Infinity);
	let _max = $derived(max ?? Infinity);

	$effect.pre(() => {
		[value, min, max];
		if (value !== null) {
			if (value < _min) {
				value = min;
			} else if (value > _max) {
				value = max;
			}
		}
	});
</script>

<InputGroup.Root inert={disabled} class={cn('bg-background', kelas)}>
	<InputGroup.Input {...attrs} type="number" class={cn('appearance-none', inputClass)} bind:value />
	<InputGroup.Addon>
		<InputGroup.Button
			aria-label="Minus"
			title="Minus"
			size="icon-xs"
			onclick={() =>
				value
					? (value = Math.max(value - step, _min))
					: (value = _min === -Infinity ? -step : _min)}
			disabled={disabled || (value !== null && value <= _min)}
		>
			<MinusIcon />
		</InputGroup.Button>
	</InputGroup.Addon>
	<InputGroup.Addon align="inline-end">
		<InputGroup.Button
			aria-label="Plus"
			title="Plus"
			size="icon-xs"
			onclick={() =>
				value ? (value = Math.min(value + step, _max)) : (value = _max === Infinity ? step : _max)}
			disabled={disabled || (value !== null && value >= _max)}
		>
			<PlusIcon />
		</InputGroup.Button>
	</InputGroup.Addon>
</InputGroup.Root>
