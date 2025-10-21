<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { SunIcon, MoonIcon, PaletteIcon, GithubIcon } from '@lucide/svelte';
	import { theme } from '$lib/theme.svelte';
	import {
		PUBLIC_APP_URL,
		PUBLIC_PUBLISHER_NAME,
		PUBLIC_PUBLISHER_URL,
		PUBLIC_REPO_URL
	} from '$env/static/public';
	import { page } from '$app/state';
	import JsonLd from '$lib/components/utils/json-ld.svelte';

	let { group, title, description }: { group?: string; title: string; description?: string } =
		$props();

	let icons = {
		light: SunIcon,
		dark: MoonIcon,
		system: PaletteIcon
	};

	let ThemeIcon = $derived(icons[theme.value]);

	let origin = $derived.by(() => {
		if (!import.meta.env.SSR) {
			return page.url.origin;
		}
		return page.url.origin === 'http://sveltekit-prerender' ? PUBLIC_APP_URL : page.url.origin;
	});
</script>

<svelte:head>
	<title>{title} | Random Tools</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	<JsonLd
		data={{
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: `${title} | Random Tools`,
			description,
			url: new URL(page.url.pathname, origin).href,
			publisher: {
				'@type': 'Person',
				name: PUBLIC_PUBLISHER_NAME,
				url: PUBLIC_PUBLISHER_URL
			}
		}}
	/>
</svelte:head>

<header class="flex h-16 shrink-0 items-center gap-2 border-b">
	<div class="flex w-full items-center gap-2 px-3">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="mx-2 h-16!" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				{#if group}
					<Breadcrumb.Item class="max-md:hidden">{group}</Breadcrumb.Item>
					<Breadcrumb.Separator class="max-md:hidden" />
				{/if}
				<Breadcrumb.Page>{title}</Breadcrumb.Page>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<Separator orientation="vertical" class="mr-2 ml-auto h-16!" />
		<Button
			href={PUBLIC_REPO_URL}
			target="_blank"
			class="size-7 max-sm:hidden"
			variant="ghost"
			size="icon"
		>
			<GithubIcon />
		</Button>
		<Separator orientation="vertical" class="mx-2 h-16! max-sm:hidden" />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'size-7' })}
			>
				<ThemeIcon />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.RadioGroup bind:value={theme.value}>
						<DropdownMenu.RadioItem value="system">
							<PaletteIcon class="mr-2 size-4" />
							System
						</DropdownMenu.RadioItem>
						<DropdownMenu.RadioItem value="light">
							<SunIcon class="mr-2 size-4" />
							Light
						</DropdownMenu.RadioItem>
						<DropdownMenu.RadioItem value="dark">
							<MoonIcon class="mr-2 size-4" />
							Dark
						</DropdownMenu.RadioItem>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
