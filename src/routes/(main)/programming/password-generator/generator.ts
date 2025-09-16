// Character pools
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERIC = '0123456789';
const URLSAFE = '.-_~';
const SYMBOLS = '!@#$%^&*()[]{}<>?/|\\\'"`,;:+=';

export type GenOptions = {
	alpha?: boolean;
	numeric?: boolean;
	symbols?: boolean; // master switch for symbol inclusion
	urlSafe?: boolean; // when symbols=true: true => only URLSAFE; false => all SYMBOLS
	exclude?: string;
	requireEach?: boolean; // ensure ≥1 from each selected pool
	noRepeatWindow?: number; // N: same char cannot appear within last N output chars
};

export type PoolValidationResult = {
	categories: {
		alpha: { selected: boolean; sizeBeforeExclude: number; sizeAfterExclude: number; ok: boolean };
		numeric: {
			selected: boolean;
			sizeBeforeExclude: number;
			sizeAfterExclude: number;
			ok: boolean;
		};
		symbols: {
			selected: boolean;
			mode: 'none' | 'all' | 'urlSafeOnly';
			sizeBeforeExclude: number;
			sizeAfterExclude: number;
			ok: boolean;
		};
	};
	activeCategoryCount: number;
	totalCandidates: number; // sum of selected pools (after exclude)
	uniqueCandidates: number; // unique chars across all selected pools (after exclude)
	emptyPool: boolean;
	noRepeatWindow: number;
	maxLength: number; // Infinity if unbounded
	errors: string[];
	warnings: string[];
};

export class PasswordGenerator {
	// ===== private state =====
	#u32: Uint32Array;
	#i = 0;

	constructor(bufferSize = 32) {
		if (!Number.isInteger(bufferSize) || bufferSize < 1) {
			throw new Error('bufferSize must be a positive integer');
		}
		this.#u32 = new Uint32Array(bufferSize);
		crypto.getRandomValues(this.#u32);
	}

	// ===== private helpers =====
	#nextU32(): number {
		if (this.#i >= this.#u32.length) {
			crypto.getRandomValues(this.#u32);
			this.#i = 0;
		}
		return this.#u32[this.#i++];
	}

	// unbiased 0..max-1 via rejection sampling
	#randInt(max: number): number {
		if (max <= 0) throw new Error('max must be > 0');
		const limit = 0x100000000 - (0x100000000 % max);
		while (true) {
			const x = this.#nextU32();
			if (x < limit) return x % max;
		}
	}

	#shuffle<T>(arr: T[]): void {
		for (let k = arr.length - 1; k > 0; k--) {
			const j = this.#randInt(k + 1);
			[arr[k], arr[j]] = [arr[j], arr[k]];
		}
	}

	#filterByExclude(s: string, exclude?: string): string {
		if (!exclude) return s;
		const ex = new Set(exclude);
		return [...s].filter((ch) => !ex.has(ch)).join('');
	}

	/** Build pools honoring the requested symbols/urlSafe semantics */
	#buildPools(opts: GenOptions) {
		const alphaSelected = !!opts.alpha;
		const numericSelected = !!opts.numeric;
		const symbolsSelected = !!opts.symbols;

		// symbols mode resolution
		const symbolsMode: 'none' | 'all' | 'urlSafeOnly' = !symbolsSelected
			? 'none'
			: opts.urlSafe
				? 'urlSafeOnly'
				: 'all';

		const symbolsRaw =
			symbolsMode === 'urlSafeOnly' ? URLSAFE : symbolsMode === 'all' ? SYMBOLS : '';

		const raw = {
			alpha: ALPHA,
			numeric: NUMERIC,
			symbols: symbolsRaw // reflects resolved mode
		};

		const selected = {
			alpha: alphaSelected,
			numeric: numericSelected,
			symbols: symbolsSelected && symbolsMode !== 'none'
		};

		const filtered = {
			alpha: alphaSelected ? this.#filterByExclude(raw.alpha, opts.exclude) : '',
			numeric: numericSelected ? this.#filterByExclude(raw.numeric, opts.exclude) : '',
			symbols: selected.symbols ? this.#filterByExclude(raw.symbols, opts.exclude) : ''
		};

		const activePools: string[] = [];
		if (filtered.alpha.length) activePools.push(filtered.alpha);
		if (filtered.numeric.length) activePools.push(filtered.numeric);
		if (filtered.symbols.length) activePools.push(filtered.symbols);

		const allCandidates = activePools.join('');
		const uniqueCandidates = Array.from(new Set(allCandidates)).join('');

		return {
			raw,
			selected,
			filtered,
			activePools,
			allCandidates,
			uniqueCandidates,
			symbolsMode
		};
	}

	/** Compute max feasible length given unique count & window */
	#computeMaxLength(uniqueCount: number, windowN: number): number {
		if (uniqueCount === 0) return 0;
		if (windowN <= 0) return Number.POSITIVE_INFINITY;
		return uniqueCount >= windowN + 1 ? Number.POSITIVE_INFINITY : uniqueCount;
	}

	// ===== public validation =====
	public validatePool(opts: GenOptions, length?: number): PoolValidationResult {
		const { raw, selected, filtered, activePools, allCandidates, uniqueCandidates, symbolsMode } =
			this.#buildPools(opts);
		const windowN = Math.max(0, Math.floor(opts.noRepeatWindow ?? 0));

		const mk = (key: 'alpha' | 'numeric') => ({
			selected: selected[key],
			sizeBeforeExclude: (raw as any)[key].length,
			sizeAfterExclude: (filtered as any)[key].length,
			ok: !selected[key] || (filtered as any)[key].length > 0
		});

		const symbolsInfo = {
			selected: selected.symbols,
			mode: symbolsMode,
			sizeBeforeExclude: raw.symbols.length,
			sizeAfterExclude: filtered.symbols.length,
			ok: !selected.symbols || filtered.symbols.length > 0
		};

		const result: PoolValidationResult = {
			categories: {
				alpha: mk('alpha'),
				numeric: mk('numeric'),
				symbols: symbolsInfo
			},
			activeCategoryCount: activePools.length,
			totalCandidates: allCandidates.length,
			uniqueCandidates: uniqueCandidates.length,
			emptyPool: uniqueCandidates.length === 0,
			noRepeatWindow: windowN,
			maxLength: this.#computeMaxLength(uniqueCandidates.length, windowN),
			errors: [],
			warnings: []
		};

		// Per-category errors
		for (const [name, info] of Object.entries(result.categories)) {
			if ((info as any).selected && (info as any).sizeAfterExclude === 0) {
				result.errors.push(`Selected category "${name}" has no candidates after exclusions.`);
			}
		}
		if (result.emptyPool) {
			result.errors.push('No characters available after applying options/exclusions.');
		}

		// Policy checks if length provided
		if (Number.isFinite(length)) {
			const L = length as number;

			if (opts.requireEach) {
				const needed = activePools.length;
				if (needed === 0)
					result.errors.push('requireEach is set but there are no active categories.');
				else if (L < needed)
					result.errors.push(`length must be at least ${needed} to satisfy requireEach.`);
			}

			if (windowN > 0) {
				const neededUnique = Math.min(L, windowN + 1);
				if (uniqueCandidates.length < neededUnique) {
					result.errors.push(
						`With noRepeatWindow=${windowN}, need at least ${neededUnique} distinct characters (have ${uniqueCandidates.length}).`
					);
				}
			} else if (uniqueCandidates.length < 2) {
				result.warnings.push('Candidate set contains fewer than 2 distinct characters (weak).');
			}
		} else {
			if (windowN > 0 && uniqueCandidates.length < windowN + 1) {
				result.warnings.push(
					`For long outputs with noRepeatWindow=${windowN}, aim for ≥ ${windowN + 1} distinct characters (have ${uniqueCandidates.length}).`
				);
			}
		}

		return result;
	}

	/** Minimum length implied by config (requireEach only). */
	public calculateMinLength(opts: GenOptions): number {
		const { activePools, uniqueCandidates } = this.#buildPools(opts);
		if (uniqueCandidates.length === 0) {
			throw new Error('No characters available after applying options/exclusions.');
		}
		return opts.requireEach ? activePools.length : 1;
	}

	/** Constraints helper. maxLength finite only when unique < N+1. */
	public getConstraints(opts: GenOptions): { minLength: number; maxLength: number } {
		const { activePools, uniqueCandidates } = this.#buildPools(opts);
		if (uniqueCandidates.length === 0) {
			throw new Error('No characters available after applying options/exclusions.');
		}
		const windowN = Math.max(0, Math.floor(opts.noRepeatWindow ?? 0));
		const minLength = opts.requireEach ? activePools.length : 1;
		const maxLength = this.#computeMaxLength(uniqueCandidates.length, windowN);
		return { minLength, maxLength };
	}

	// ===== main generation =====
	public generate(length: number, opts: GenOptions = {}): string {
		if (!Number.isFinite(length) || length % 1 !== 0 || length < 1) {
			throw new Error('length must be a positive integer');
		}

		const report = this.validatePool(opts, length);
		if (report.errors.length) {
			throw new Error(`Invalid generator configuration:\n- ${report.errors.join('\n- ')}`);
		}

		const { activePools, allCandidates, uniqueCandidates } = this.#buildPools(opts);
		const windowN = Math.max(0, Math.floor(opts.noRepeatWindow ?? 0));
		const out: string[] = [];

		const uniqueArr = [...uniqueCandidates];
		const allArr = [...allCandidates];

		// cooldown queue for noRepeatWindow
		const cooldown: string[] = [];
		const inCooldown = new Set<string>();
		const pushWithCooldown = (ch: string) => {
			out.push(ch);
			if (windowN > 0) {
				cooldown.push(ch);
				inCooldown.add(ch);
				if (cooldown.length > windowN) {
					const old = cooldown.shift()!;
					inCooldown.delete(old);
				}
			}
		};

		// 1) requireEach: pick one from each active pool, shuffled
		if (opts.requireEach) {
			const picks: string[] = [];
			for (const pool of activePools) {
				picks.push(pool[this.#randInt(pool.length)]);
			}
			this.#shuffle(picks);
			for (const ch of picks) pushWithCooldown(ch);
		}

		// 2) fill remaining under window rule
		const remaining = length - out.length;
		if (remaining < 0) throw new Error('length smaller than required categories.');

		if (windowN > 0) {
			for (let k = 0; k < remaining; k++) {
				const allowed = uniqueArr.filter((ch) => !inCooldown.has(ch));
				if (!allowed.length) {
					throw new Error(
						'No available characters due to noRepeatWindow; broaden pools or reduce the window.'
					);
				}
				const ch = allowed[this.#randInt(allowed.length)];
				pushWithCooldown(ch);
			}
			// No shuffle: preserve noRepeatWindow property
			return out.join('');
		} else {
			for (let k = 0; k < remaining; k++) {
				out.push(allArr[this.#randInt(allArr.length)]);
			}
			this.#shuffle(out); // hide requireEach placement
			return out.join('');
		}
	}
}
