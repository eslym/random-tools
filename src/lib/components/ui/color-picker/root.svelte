<script lang="ts">
	import { Popover } from '../popover/index.js';
	import type { WithChildren } from 'bits-ui';
	import { ColorPickerContext, createContext, type ColorPickerRootProps } from './context.js';

	let {
		value = $bindable(),
		children = undefined,
		...rootProps
	}: WithChildren<ColorPickerRootProps> = $props();

	ColorPickerContext.set(
		createContext(
			() => value,
			(v) => (value = v),
			() => rootProps
		)
	);
</script>

<Popover>
	{@render children?.()}
</Popover>
