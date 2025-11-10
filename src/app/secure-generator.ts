// src/app/secure-generator.ts
export interface PWOptions {
  length: number;
  useLower: boolean;
  useUpper: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean;
  pronounceable: boolean; // option simple (less entropy)
}

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?|~'
};

const AMBIGUOUS = new Set(['0','O','o','I','l','1']);

function buildCharset(opts: PWOptions): string {
  if (opts.pronounceable) {
    // simple pronounceable reduced set (less secure)
    return 'aeioubcdfghjklmnpqrstvwxyz';
  }
  let cs = '';
  if (opts.useLower) cs += SETS.lower;
  if (opts.useUpper) cs += SETS.upper;
  if (opts.useNumbers) cs += SETS.numbers;
  if (opts.useSymbols) cs += SETS.symbols;
  if (opts.excludeAmbiguous) {
    cs = cs.split('').filter(ch => !AMBIGUOUS.has(ch)).join('');
  }
  return cs;
}

/**
 * Génère un mot de passe en utilisant crypto.getRandomValues (cryptographically secure)
 */
export function generateSecurePassword(opts: PWOptions): string {
  const length = Math.max(1, Math.floor(opts.length));
  const charset = buildCharset(opts);
  if (!charset || charset.length === 0) return '';

  // Pronounceable generator (simple CV pattern)
  if (opts.pronounceable) {
    const vowels = 'aeiouy';
    const consonants = charset.split('').filter(c => !vowels.includes(c)).join('');
    const arr: string[] = [];
    for (let i = 0; i < length; i++) {
      const pool = (i % 2 === 0) ? consonants : vowels;
      const idx = cryptoRandomIndex(pool.length);
      arr.push(pool[idx]);
    }
    return arr.join('').slice(0, length);
  }

  // Ensure at least one char from each requested set (if length allows)
  const pools: string[] = [];
  if (opts.useLower) pools.push(opts.excludeAmbiguous ? SETS.lower.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.lower);
  if (opts.useUpper) pools.push(opts.excludeAmbiguous ? SETS.upper.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.upper);
  if (opts.useNumbers) pools.push(opts.excludeAmbiguous ? SETS.numbers.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.numbers);
  if (opts.useSymbols) pools.push(opts.excludeAmbiguous ? SETS.symbols.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.symbols);

  const result: string[] = [];
  // include one char from each pool to satisfy complexity requirement
  for (let i = 0; i < pools.length && result.length < length; i++) {
    const pool = pools[i];
    if (pool.length > 0) result.push(pool[cryptoRandomIndex(pool.length)]);
  }

  // fill the rest from the combined charset
  const remaining = length - result.length;
  for (let i = 0; i < remaining; i++) {
    result.push(charset[cryptoRandomIndex(charset.length)]);
  }

  // shuffle using Fisher-Yates with crypto randomness
  shuffleCrypto(result);
  return result.join('');
}

function cryptoRandomIndex(max: number): number {
  // returns integer in [0, max-1]
  if (max <= 0) return 0;
  const rand = new Uint32Array(1);
  crypto.getRandomValues(rand);
  // modulo bias is acceptable for non-extreme sizes; for absolute perfection use rejection sampling
  return rand[0] % max;
}

function shuffleCrypto<T>(arr: T[]): void {
  const n = arr.length;
  const rand = new Uint32Array(n);
  crypto.getRandomValues(rand);
  for (let i = n - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
