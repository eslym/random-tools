<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PopoverTrigger } from '../popover/index.js';
	import { ColorPickerContext } from './context.js';
	import type { ClassValue } from 'tailwind-variants';
	import { buttonVariants } from '../button/index.js';

	const rootProps = ColorPickerContext.get();

	let {
		children = undefined,
		class: kelas = undefined
	}: { children?: Snippet; class?: ClassValue } = $props();
</script>

<PopoverTrigger class={buttonVariants({ variant: 'outline', class: ['justify-start', kelas] })}>
	<div class="checkerboard size-6 min-w-6 overflow-hidden rounded-full border">
		<div class="size-full" style:background-color={rootProps.value}></div>
	</div>
	{@render children?.()}
</PopoverTrigger>

<style>
	.checkerboard {
		background: repeating-conic-gradient(#fff 0% 25%, #000 0% 50%, #fff 0% 75%, #000 0% 100%);
		background-size: 100% 100%;
		background-clip: padding-box;
	}
</style>
