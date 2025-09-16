const groups = import.meta.glob<
	true,
	string,
	{
		_meta: {
			title: string;
			description: string;
			items: { title: string; description: string; path: string }[];
		};
	}
>('./*/+page.ts', { eager: true });

const menu = Object.entries(groups)
	.map(([path, { _meta }]) => ({
		..._meta,
		path: path.replace('.', '').replace('/+page.ts', '')
	}))
	.sort((a, b) => a.title.localeCompare(b.title));

export function load() {
	return { menu };
}
