let updated = $state(false);

export const update = {
	get found() {
		return updated;
	},
	set found(value: boolean) {
		updated = value;
	}
};
