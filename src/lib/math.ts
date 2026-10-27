// Math utilities for the prime numbers lab

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function isComposite(n: number): boolean {
  return n >= 2 && !isPrime(n);
}

// 1 is neither prime nor composite
export function numberType(n: number): 'prime' | 'composite' | 'one' {
  if (n === 1) return 'one';
  return isPrime(n) ? 'prime' : 'composite';
}

export function divisors(n: number): number[] {
  if (n < 1) return [];
  const result: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) result.push(i);
  }
  return result;
}

export function countDivisors(n: number): number {
  if (n < 1) return 0;
  let count = 0;
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) count++;
  }
  return count;
}

// Prime factorization as a flat list of prime factors (sorted ascending)
export function primeFactors(n: number): number[] {
  if (n < 2) return [];
  const factors: number[] = [];
  let current = n;
  let d = 2;
  while (d * d <= current) {
    while (current % d === 0) {
      factors.push(d);
      current = current / d;
    }
    d++;
  }
  if (current > 1) factors.push(current);
  return factors;
}

// Format factors as power notation string, e.g. "2^3 × 3^2"
export function formatPrimeFactors(n: number): string {
  const factors = primeFactors(n);
  if (factors.length === 0) return '—';
  const map = new Map<number, number>();
  factors.forEach((f) => map.set(f, (map.get(f) ?? 0) + 1));
  const parts: string[] = [];
  map.forEach((count, base) => {
    if (count === 1) parts.push(`${base}`);
    else parts.push(`${base}^${count}`);
  });
  return parts.join(' × ');
}

// First N primes (for the sieve steps and reference)
export const FIRST_PRIMES_100: number[] = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97,
];

// Sieve steps: for each prime p whose square <= 100, remove its multiples
export const SIEVE_PRIMES = [2, 3, 5, 7];

export function sieveMultiplesOf(p: number, max = 100): number[] {
  const multiples: number[] = [];
  for (let m = p * 2; m <= max; m += p) {
    multiples.push(m);
  }
  return multiples;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Persian digit conversion
export function toPersianDigits(input: string | number): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (d) => persian[parseInt(d)]);
}

export function toEnglishDigits(input: string): string {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return input.replace(/[۰-۹٠-٩]/g, (d) => map[d] ?? d);
}
