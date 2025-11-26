<script lang="ts" module>
	import * as duration from 'tinyduration';

	const _data = new PersistedState('durations-8601', {
		negative: false,
		years: 0,
		months: 0,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		serialized: ''
	});

	const data = {} as typeof _data.current;

	for (const key of [
		'negative',
		'years',
		'months',
		'weeks',
		'days',
		'hours',
		'minutes',
		'seconds'
	] as const) {
		Object.defineProperty(data, key, {
			get: () => _data.current[key],
			set: (value) => {
				(_data.current as any)[key] = value;
				try {
					_data.current.serialized = duration.serialize(_data.current);
				} catch {
					_data.current.serialized = '';
				}
			},
			enumerable: true,
			configurable: true
		});
	}

	Object.defineProperty(data, 'serialized', {
		get: () => _data.current.serialized,
		set: (value) => {
			_data.current.serialized = value;
			try {
				const parsed = duration.parse(value);
				_data.current.negative = parsed.negative || false;
				for (const key of [
					'years',
					'months',
					'weeks',
					'days',
					'hours',
					'minutes',
					'seconds'
				] as const) {
					(_data.current as any)[key] = parsed[key] || 0;
				}
			} catch {}
		},
		enumerable: true,
		configurable: true
	});
</script>

<script lang="ts">
	import AppHeader from '$lib/components/app-header.svelte';
	import { PersistedState } from 'runed';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import AppMain from '$lib/components/app-main.svelte';
	import NumInput from '$lib/components/num-input.svelte';

	let { data: meta } = $props();
</script>

<AppHeader {...meta} group="Programming Tools" />

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
					<Label for="years">Years</Label>
					<NumInput id="years" bind:value={data.years} min={0} />
				</div>
				<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="months">Months</Label>
					<NumInput id="months" bind:value={data.months} min={0} />
				</div>
				<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="weeks">Weeks</Label>
					<NumInput id="weeks" bind:value={data.weeks} min={0} />
				</div>
				<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="days">Days</Label>
					<NumInput id="days" bind:value={data.days} min={0} />
				</div>
				<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="hours">Hours</Label>
					<NumInput id="hours" bind:value={data.hours} min={0} />
				</div>
				<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="minutes">Minutes</Label>
					<NumInput id="minutes" bind:value={data.minutes} min={0} />
				</div>
				<div class="col-span-2 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="seconds">Seconds</Label>
					<NumInput id="seconds" bind:value={data.seconds} min={0} />
				</div>
				<div class="col-start-2 flex items-center gap-2 @max-md:col-start-1">
					<Switch id="negative" bind:checked={data.negative} />
					<Label for="negative" class="cursor-pointer select-none">Negative</Label>
				</div>
				<div class="col-span-2 mt-4 grid grid-cols-subgrid gap-y-2 @max-md:col-span-1">
					<Label for="serialized">Duration</Label>
					<Input
						id="serialized"
						type="text"
						placeholder="e.g. P3Y6M4DT12H30M5S"
						bind:value={data.serialized}
						class="font-mono"
					/>
					<p class="col-start-2 text-xs text-muted-foreground @max-md:col-start-1">
						The duration in ISO 8601 format. You can also edit this field directly.
					</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</AppMain>
