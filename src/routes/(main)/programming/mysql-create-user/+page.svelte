<script lang="ts" module>
	function randomPass() {
		const arr = crypto.getRandomValues(new Uint8Array(15));
		return btoa(String.fromCharCode(...arr));
	}

	function escapeEnv(str?: string) {
		if (!str) return '""';
		const val = str.replace(/["\$\\]/g, '\\$&');
		if (/\s|"/.test(str)) {
			return `"${val}"`;
		}
		return val;
	}

	function escapeSqlColumn(str?: string) {
		if (!str) return '';
		return str.replace(/`/g, '``');
	}

	function escapeSqlString(str?: string) {
		if (!str) return '';
		return str.replace(/'/g, "\\'");
	}

	function defaultData() {
		return {
			username: 'laravel',
			userhost: '127.0.0.1',
			database: 'laravel',
			host: 'localhost',
			port: 3306,
			jdbc: false
		};
	}

	const data = new PersistedState('mysql-create-user', defaultData());
</script>

<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { RefreshCwIcon } from '@lucide/svelte';
	import * as Code from '$lib/components/ui/code';
	import AppMain from '$lib/components/app-main.svelte';
	import { PersistedState } from 'runed';
	import { Snippet } from '$lib/components/ui/snippet';
	import { Switch } from '$lib/components/ui/switch';
	import * as InputGroup from '$lib/components/ui/input-group';

	let { data: meta } = $props();

	let password: string = $state('');

	let sql: string = $derived.by(() => {
		const escapedDatabase = escapeSqlColumn(data.current.database);
		const escapedUsername = escapeSqlString(data.current.username);
		const escapedHost = escapeSqlString(data.current.userhost);
		const escapedPassword = escapeSqlString(password);

		return (
			`CREATE DATABASE \`${escapedDatabase}\`;\n` +
			`CREATE USER '${escapedUsername}'@'${escapedHost}' IDENTIFIED BY '${escapedPassword}';\n` +
			`GRANT ALL PRIVILEGES ON \`${escapedDatabase}\`.* TO '${escapedUsername}'@'${escapedHost}';\n` +
			`FLUSH PRIVILEGES;`
		);
	});

	let dotenv = $derived(
		`DB_DATABASE=${escapeEnv(data.current.database)}\n` +
			`DB_USERNAME=${escapeEnv(data.current.username)}\n` +
			`DB_PASSWORD=${escapeEnv(password)}`
	);

	let connString = $derived.by(() => {
		const url = new URL(`mysql://temp`);
		url.username = data.current.username;
		url.password = password;
		url.hostname = data.current.host;
		url.port = data.current.port.toString();
		url.pathname = `/${data.current.database}`;
		if (data.current.jdbc) {
			return `jdbc:${url.toString()}`;
		}
		return url.toString();
	});

	onMount(() => {
		password = randomPass();
	});
</script>

<AppHeader {...meta} group="Programming Tools" />

<svelte:boundary onerror={() => (data.current = defaultData())}>
	<AppMain class="w-xl" wrapperClass="px-4 pt-4 pb-16">
		<Card.Root>
			<Card.Header>
				<Card.Description>
					{meta.description}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 @max-md:grid-cols-1">
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="username">Username</Label>
						<Input id="username" type="text" bind:value={data.current.username} />
					</div>
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="host">User Host</Label>
						<Input id="host" type="text" bind:value={data.current.userhost} />
					</div>
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="password">Password</Label>
						<InputGroup.Root class="bg-background dark:bg-input/30">
							<InputGroup.Input id="password" type="text" bind:value={password} />
							<InputGroup.Addon align="inline-end">
								<InputGroup.Button size="icon-xs" onclick={() => (password = randomPass())}>
									<RefreshCwIcon />
								</InputGroup.Button>
							</InputGroup.Addon>
						</InputGroup.Root>
						<div class="col-start-2 text-xs text-muted-foreground @max-md:col-start-1">
							This password will not stored anywhere, if you don't note it down you will lose it.
						</div>
					</div>
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="database">Database</Label>
						<Input id="database" type="text" bind:value={data.current.database} />
					</div>
				</div>
				<Label class="mt-8">SQL</Label>
				<Code.Root code={sql} lang="sql" class="mt-2">
					<Code.CopyButton />
				</Code.Root>
				<Label class="mt-4">.env</Label>
				<Code.Root code={dotenv} lang="dotenv" class="mt-2">
					<Code.CopyButton />
				</Code.Root>
			</Card.Content>
		</Card.Root>
		<Card.Root class="mx-auto mt-8 max-w-xl">
			<Card.Header>
				<Card.Title id="connection-string">Connection String</Card.Title>
				<Card.Description
					>Generate connection string for MySQL client or libraries.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 @max-md:grid-cols-1">
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="host2">Host</Label>
						<Input id="host2" type="text" bind:value={data.current.host} />
					</div>
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="port">Port</Label>
						<Input id="port" type="number" bind:value={data.current.port} />
					</div>
					<div class="col-start-2 mt-2 @max-md:col-start-1">
						<Label for="jdbc" class="w-full"
							><Switch id="jdbc" bind:checked={data.current.jdbc} /> JDBC</Label
						>
					</div>
				</div>
				<Snippet class="mt-8" text={connString} />
			</Card.Content>
		</Card.Root>
	</AppMain>
</svelte:boundary>
