<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/state';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { HammerIcon } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import type { LayoutProps } from '../../routes/(main)/$types';

	type Menu = LayoutProps['data']['menu'];

	let {
		ref = $bindable(null),
		menu,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { menu: Menu } = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<HammerIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">Random Tools</span>
								<span class="text-secondary-foreground">rev-{version.substring(0, 7)}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each menu as group (group.title)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton class="font-medium">
							{group.title}
						</Sidebar.MenuButton>
						{#if group.items}
							<Sidebar.MenuSub>
								{#each group.items as tool (tool.title)}
									{@const path = group.path + tool.path}
									<Sidebar.MenuSubItem>
										<Sidebar.MenuSubButton isActive={path === page.url.pathname}>
											{#snippet child({ props })}
												<a href={path} {...props}>{tool.title}</a>
											{/snippet}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{/if}
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
