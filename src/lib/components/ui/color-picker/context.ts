import { Context } from 'runed';
import { untrack } from 'svelte';

type PickerProps = {
	rgb?: Record<'r' | 'g' | 'b' | 'a', number> | null;
	hsv?: Record<'h' | 's' | 'v' | 'a', number> | null;
	onInput?: (event: {
		hsv: Record<'h' | 's' | 'v' | 'a', number> | null;
		rgb: Record<'r' | 'g' | 'b' | 'a', number> | null;
		hex: string | null;
		color: unknown | null;
	}) => void;
	isDark?: boolean;
	isAlpha?: boolean;
};

export type ColorPickerRootProps = (
	| {
			value?: string;
			nullable?: false;
	  }
	| {
			value?: string | null;
			nullable: true;
	  }
) &
	PickerProps;

export type ContextProps = {
	value: string | null | undefined;
	pickerProps: { nullable?: boolean } & PickerProps;
};

export function createContext(
	getval: () => string | null | undefined,
	setval: (val: string | null | undefined) => void,
	pickerProps: () => PickerProps
) {
	return {
		get value() {
			return getval();
		},
		set value(val: string | null | undefined) {
			if (val !== untrack(getval)) setval(val);
		},
		get pickerProps() {
			return pickerProps();
		}
	};
}

export const ColorPickerContext = new Context<ContextProps>('color-picker');
