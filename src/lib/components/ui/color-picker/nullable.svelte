<script lang="ts">
	import { Switch } from '../switch/index.js';
	import { Label } from '../label/index.js';

	let { isUndefined = $bindable(false), texts }: { isUndefined?: boolean; texts?: any } = $props();
</script>

<Label>
	<Switch bind:checked={isUndefined} />
	{texts.label.withoutColor}
</Label>
