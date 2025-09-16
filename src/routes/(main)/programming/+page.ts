const tools = import.meta.glob<
	true,
	string,
	{
		_meta: { title: string; description: string };
	}
>('./*/+page.ts', { eager: true });

export const _meta = {
	title: 'Programming Tools',
	description: 'A collection of tools for programming tasks.',
	items: Object.entries(tools)
		.map(([path, { _meta }]) => ({
			..._meta,
			path: path.replace('.', '').replace('/+page.ts', '')
		}))
		.sort((a, b) => a.title.localeCompare(b.title))
};

export function load() {
	return _meta;
}
