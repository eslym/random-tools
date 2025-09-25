<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/state';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { HammerIcon, SearchIcon } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import type { LayoutProps } from '../../routes/(main)/$types';
	import { Label } from '$lib/components/ui/label';
	import { isMatch } from '$lib/filter';

	type Menu = LayoutProps['data']['menu'];

	let {
		ref = $bindable(null),
		menu,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { menu: Menu } = $props();

	let keyword = $state('');
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
								<span class="text-muted-foreground">rev-{version.substring(0, 7)}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<Sidebar.Group>
			<Sidebar.GroupContent class="relative">
				<Label for="search" class="sr-only">Search</Label>
				<Sidebar.Input
					id="search"
					placeholder="Search the tools..."
					class="pl-8"
					bind:value={keyword}
				/>
				<SearchIcon
					class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none"
				/>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu class="peer">
				{#each menu as group (group.title)}
					<Sidebar.MenuItem class="not-[:has([data-hidden=false])]:hidden">
						<Sidebar.MenuButton class="font-medium" isActive={group.path === page.url.pathname}>
							{#snippet child({ props })}
								<a href={group.path} {...props}>{group.title}</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if group.items}
							<Sidebar.MenuSub>
								{#each group.items as tool (tool.title)}
									{@const path = group.path + tool.path}
									<Sidebar.MenuSubItem
										class="data-[hidden=true]:hidden"
										data-hidden={!isMatch(keyword, tool)}
									>
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
			<Sidebar.Menu class="hidden peer-[:not(:has([data-hidden=false]))]:block">
				<Sidebar.MenuItem>
					<Sidebar.MenuButton class="pointer-events-none justify-center text-muted-foreground">
						No tools found
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
