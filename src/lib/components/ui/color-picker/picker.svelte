<script lang="ts">
	import { PopoverContent } from '../popover/index.js';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { ColorPickerContext } from './context.js';
	import wrapper from './wrapper.svelte';
	import nullabilityCheckbox from './nullable.svelte';
	import textInput from './text-input.svelte';
	import type { ComponentProps } from 'svelte';

	const rootProps = ColorPickerContext.get();

	let {
		align = 'center',
		textInputModes = undefined,
		isAlpha = true
	}: {
		align?: 'start' | 'center' | 'end';
	} & Pick<ComponentProps<typeof ColorPicker>, 'textInputModes' | 'isAlpha'> = $props();
</script>

<PopoverContent
	{align}
	class={[
		'min-w-0',
		isAlpha ? 'w-[calc(240px+var(--spacing)*8)]' : 'w-[calc(224px+var(--spacing)*8)]'
	]}
>
	<ColorPicker
		{...rootProps.pickerProps}
		bind:hex={rootProps.value}
		isDialog={false}
		components={{ wrapper, nullabilityCheckbox, textInput }}
		{textInputModes}
		{isAlpha}
	/>
</PopoverContent>
