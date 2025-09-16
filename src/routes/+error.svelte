<script lang="ts">
	import { page } from '$app/state';
</script>

<div
	class="items-top relative flex min-h-screen justify-center bg-background sm:items-center sm:pt-0"
>
	<div class="mx-auto max-w-xl sm:px-6 lg:px-8">
		<div class="flex items-center pt-8 sm:justify-start sm:pt-0">
			<div class="border-r border-border px-4 text-lg tracking-wider text-foreground">
				{page.status}
			</div>
			<div class="ml-4 text-lg tracking-wider text-muted-foreground uppercase">
				{page.error?.message}
			</div>
		</div>
	</div>
</div>
