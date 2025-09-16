export function preventDefault<T extends Event>(fn: (event: T) => void) {
	return (event: T) => {
		event.preventDefault();
		fn(event);
	};
}

export function stopPropagation<T extends Event>(fn: (event: T) => void) {
	return (event: T) => {
		event.stopPropagation();
		fn(event);
	};
}

export function currentOnly<T extends Event>(
	fn: (event: Omit<T, 'target'> & { target: T['currentTarget'] }) => void
) {
	return (event: T) => {
		if (event.target !== event.currentTarget) return;
		fn(event as any);
	};
}
