export type LottoMode = 'pure' | 'birthday';

export interface LottoResult {
  sixDigits: string;
  threeDigits: string;
  twoDigits: string;
  timestamp: number;
  mode: LottoMode;
}

/**
 * Randomly picks a digit from 0-9.
 * If seedDigits are provided, there's a 40% chance to pick from the seed.
 */
function randomDigit(seedDigits: string[] = [], mode: LottoMode = 'pure'): string {
  if (mode === 'birthday' && seedDigits.length > 0) {
    const useSeed = Math.random() < 0.4; // 40% weighting
    if (useSeed) {
      const randomIndex = Math.floor(Math.random() * seedDigits.length);
      return seedDigits[randomIndex];
    }
  }
  return Math.floor(Math.random() * 10).toString();
}

function makeNumber(length: number, seedDigits: string[] = [], mode: LottoMode = 'pure'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomDigit(seedDigits, mode);
  }
  return result;
}

export function generateLotto(
  mode: LottoMode = 'pure',
  birthday: string = '',
  count: number = 1
): LottoResult[] {
  const results: LottoResult[] = [];
  const seedDigits = birthday.replace(/[^0-9]/g, '').split('');

  for (let i = 0; i < count; i++) {
    results.push({
      sixDigits: makeNumber(6, seedDigits, mode),
      threeDigits: makeNumber(3, seedDigits, mode),
      twoDigits: makeNumber(2, seedDigits, mode),
      timestamp: Date.now(),
      mode
    });
  }

  return results;
}
