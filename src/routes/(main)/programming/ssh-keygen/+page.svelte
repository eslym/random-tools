<script lang="ts" module>
	import AppHeader from '$lib/components/app-header.svelte';
	import AppMain from '$lib/components/app-main.svelte';
	import { IsMounted, PersistedState } from 'runed';
	import {
		type ECDSAOptions,
		type Ed25519Options,
		type RSAOptions,
		type SshKeyOptions,
		type SshKeyResult,
		generateSshKey
	} from './generator';

	function defaultOptions(): Omit<RSAOptions, 'algorithm'> &
		Omit<ECDSAOptions, 'algorithm'> &
		Omit<Ed25519Options, 'algorithm'> & {
			algorithm: 'rsa' | 'ecdsa' | 'ed25519';
		} {
		return {
			algorithm: 'rsa',
			comment: 'user@host',

			// rsa
			modulusLength: 3072,
			hash: 'SHA-256',

			// ecdsa
			namedCurve: 'P-256'
		};
	}

	const opts = new PersistedState<SshKeyOptions>('ssh-key-options', defaultOptions());
</script>

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Password from '$lib/components/ui/password';
	import { preventDefault } from '$lib/events';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Code from '$lib/components/ui/code';
	import { Snippet } from '$lib/components/ui/snippet';

	let { data: meta } = $props();

	let passphrase: string = $state('');
	let generation: Promise<SshKeyResult> | null = $state(null);

	const mounted = new IsMounted();
</script>

<AppHeader {...meta} group="Programming Tools" />

<svelte:boundary onerror={() => (opts.current = defaultOptions())}>
	<AppMain class="w-xl" wrapperClass="px-4 pt-4 pb-16">
		<Card.Root>
			<Card.Header>
				<Card.Description>{meta.description}</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					id="ssh-keygen"
					onsubmit={preventDefault(
						() => (generation = generateSshKey({ ...opts.current, passphrase }))
					)}
					class="grid grid-cols-[6rem_1fr] gap-x-6 gap-y-4 @max-md:grid-cols-1"
				>
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label>Algorithm</Label>
						<div
							class={buttonVariants({
								variant: 'outline',
								class: 'items-center'
							})}
						>
							{#if mounted.current}
								<Button
									type="button"
									variant={opts.current.algorithm === 'rsa' ? 'default' : 'ghost'}
									class="h-5 flex-1 p-0 text-xs"
									onclick={() => (opts.current.algorithm = 'rsa')}
								>
									RSA
								</Button>
								<Button
									type="button"
									variant={opts.current.algorithm === 'ecdsa' ? 'default' : 'ghost'}
									class="h-5 flex-1 p-0 text-xs"
									onclick={() => (opts.current.algorithm = 'ecdsa')}
								>
									ECDSA
								</Button>
								<Button
									type="button"
									variant={opts.current.algorithm === 'ed25519' ? 'default' : 'ghost'}
									class="h-5 flex-1 p-0 text-xs"
									onclick={() => (opts.current.algorithm = 'ed25519')}
								>
									Ed25519
								</Button>
							{/if}
						</div>
					</div>
					{#if mounted.current}
						{#if opts.current.algorithm === 'rsa'}
							<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
								<Label for="modulusLength">Bits</Label>
								<Select.Root type="single" bind:value={opts.current.modulusLength as any}>
									<Select.Trigger id="modulusLength" class="w-full">
										{opts.current.modulusLength}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value={2048 as any}>2048</Select.Item>
										<Select.Item value={3072 as any}>3072</Select.Item>
										<Select.Item value={4096 as any}>4096</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
							<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
								<Label for="hash">Hash</Label>
								<Select.Root type="single" bind:value={opts.current.hash as any}>
									<Select.Trigger id="hash" class="w-full">
										{opts.current.hash}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="SHA-256">SHA-256</Select.Item>
										<Select.Item value="SHA-384">SHA-384</Select.Item>
										<Select.Item value="SHA-512">SHA-512</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						{:else if opts.current.algorithm === 'ecdsa'}
							<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
								<Label for="namedCurve">Curve</Label>
								<Select.Root type="single" bind:value={opts.current.namedCurve as any}>
									<Select.Trigger id="namedCurve" class="w-full">
										{opts.current.namedCurve}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="P-256">P-256</Select.Item>
										<Select.Item value="P-384">P-384</Select.Item>
										<Select.Item value="P-521">P-521</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						{/if}
					{/if}
					<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
						<Label for="comment">Comment</Label>
						<Input id="comment" type="text" bind:value={opts.current.comment} />
					</div>
					<Password.Root
						minScore={0}
						class="col-span-2 grid grid-cols-subgrid gap-x-6 gap-y-2 @max-md:col-span-1"
					>
						<Label for="passphrase">Passphrase</Label>
						<Password.Input id="passphrase" bind:value={passphrase} placeholder="(none)">
							<Password.Copy />
							<Password.ToggleVisibility />
						</Password.Input>
						<Password.Strength class="col-start-2 mt-1 @max-md:col-start-1" />
					</Password.Root>
				</form>
			</Card.Content>
			<Card.Footer class="flex justify-end">
				<Button type="submit" form="ssh-keygen">Generate</Button>
			</Card.Footer>
		</Card.Root>
		{#if generation}
			<Card.Root class="mx-auto mt-8 max-w-xl">
				<Card.Header>
					<Card.Description>
						This SSH key pair will not be stored anywhere, please note it down before going away.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					{#await generation}
						<Label>Public Key</Label>
						<Skeleton class="mt-2 h-10.5 w-full" />
						<Label class="mt-4">Private Key</Label>
						<Skeleton class="mt-2 h-20 w-full" />
					{:then result}
						<Label>Public Key</Label>
						<Snippet class="mt-2" text={result.publicOpenSsh} />
						<Label class="mt-4">Private Key</Label>
						<Code.Root code={result.privatePem.replace(/\n+/g, '\n')} lang="text" class="mt-2">
							<Code.CopyButton />
						</Code.Root>
					{/await}
				</Card.Content>
			</Card.Root>
		{/if}
	</AppMain>
</svelte:boundary>
