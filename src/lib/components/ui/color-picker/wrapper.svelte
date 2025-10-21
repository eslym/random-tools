<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		wrapper = $bindable(undefined!),
		children = undefined,
		..._
	}: { wrapper?: HTMLElement; children?: Snippet<[]> } = $props();
</script>

<div bind:this={wrapper} class="contents">
	{@render children?.()}
</div>
