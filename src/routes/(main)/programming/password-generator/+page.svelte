<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';

	let { data: meta } = $props();
</script>

<AppHeader {...meta} group="Programming" />
