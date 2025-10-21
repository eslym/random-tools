<script lang="ts">
	import { Input } from '../input/index.js';

	const HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{8})$/i;

	let {
		hex = $bindable(),
		onInput
	}: {
		hex: string;
		onInput: (event: { hex: string }) => void;
	} = $props();

	function update(newVal: string) {
		if (HEX_COLOR_REGEX.test(newVal)) {
			hex = newVal;
			onInput({ hex });
		}
	}
</script>

<Input
	value={hex}
	placeholder="Hex Color"
	maxlength={9}
	class="w-full max-w-full min-w-0"
	onchange={(e) => update(e.currentTarget.value)}
/>
