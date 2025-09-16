import { MediaQuery } from 'svelte/reactivity';
import { PersistedState } from 'runed';

const values = new Set(['light', 'dark', 'system']);

const media = new MediaQuery('(prefers-color-scheme: dark)');
const user = new PersistedState<'light' | 'dark' | 'system'>('theme', 'system', {
	serializer: {
		serialize: (value) => value,
		deserialize: (value) => (values.has(value) ? (value as 'light' | 'dark' | 'system') : 'system')
	}
});

let system: 'light' | 'dark' = $derived(media.current ? 'dark' : 'light');

let current: 'light' | 'dark' = $derived(user.current === 'system' ? system : user.current);

export const theme = {
	get current() {
		return current;
	},
	get system() {
		return system;
	},
	get value() {
		return user.current;
	},
	set value(v: 'light' | 'dark' | 'system') {
		user.current = v;
	}
};
