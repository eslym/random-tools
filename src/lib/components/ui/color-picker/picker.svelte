<script lang="ts">
	import { PopoverContent } from '../popover/index.js';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { ColorPickerContext } from './context.js';
	import wrapper from './wrapper.svelte';
	import nullabilityCheckbox from './nullable.svelte';
	import textInput from './text-input.svelte';

	const rootProps = ColorPickerContext.get();

	let { align = 'center' }: { align?: 'start' | 'center' | 'end' } = $props();
</script>

<PopoverContent {align}>
	<ColorPicker
		{...rootProps.pickerProps}
		bind:hex={rootProps.value}
		isDialog={false}
		components={{ wrapper, nullabilityCheckbox, textInput }}
		textInputModes={['hex']}
	/>
</PopoverContent>
