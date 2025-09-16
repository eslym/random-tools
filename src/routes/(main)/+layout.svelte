<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children, data } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar menu={data.menu} />
	<Sidebar.Inset class="overflow-none h-dvh">
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
