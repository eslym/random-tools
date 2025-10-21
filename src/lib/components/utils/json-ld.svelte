<script lang="ts">
	import type { WithContext, Thing } from 'schema-dts';

	let {
		data
	}: {
		data: WithContext<Thing>;
	} = $props();

	let safe = $derived(
		JSON.stringify(data)
			.replace(/</g, '\\u003C')
			.replace(/\u2028/g, '\\u2028')
			.replace(/\u2029/g, '\\u2029')
	);

	let raw = $derived(`<script type="application/ld+json">${safe}\x3c/script>`);
</script>

{@html raw}
