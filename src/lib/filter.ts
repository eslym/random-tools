export function isMatch(search: string, meta: { title: string; description: string }) {
	const lowerSearch = search.toLowerCase().trim();
	if (!lowerSearch) return true;
	return (
		meta.title.toLowerCase().includes(lowerSearch) ||
		meta.description.toLowerCase().includes(lowerSearch)
	);
}
