/**
 * Minimal vitest shim so the Supabase CLI's own sql-split.unit.test.ts can run
 * against the local port without installing vitest.
 */
let passed = 0;
const failures: string[] = [];
let context = '';

const deepEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

const describe = (name: string, fn: () => void) => {
  const prev = context;
  context = prev ? `${prev} > ${name}` : name;
  fn();
  context = prev;
};

const itBase = (name: string, fn: (...args: unknown[]) => void) => {
  const full = `${context} > ${name}`;
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${full}\n      ${(error as Error).message.split('\n').join('\n      ')}`);
  }
};

interface ItFn {
  (name: string, fn: (...args: any[]) => void): void;
  each(cases: ReadonlyArray<unknown>): (name: string, fn: (...args: any[]) => void) => void;
}

const it: ItFn = Object.assign((name: string, fn: (...args: any[]) => void) => itBase(name, fn), {
  each(cases: ReadonlyArray<unknown>) {
    return (name: string, fn: (...args: any[]) => void) => {
      for (const item of cases) {
        const args = Array.isArray(item) ? item : [item];
        itBase(`${name} :: ${JSON.stringify(item)}`, () => fn(...args));
      }
    };
  },
});

const expect = (actual: unknown) => ({
  toEqual(expected: unknown) {
    if (!deepEqual(actual, expected)) {
      throw new Error(`expected ${JSON.stringify(expected)}\n    received ${JSON.stringify(actual)}`);
    }
  },
  toBe(expected: unknown) {
    if (actual !== expected) {
      throw new Error(`expected ${JSON.stringify(expected)}\n    received ${JSON.stringify(actual)}`);
    }
  },
  toBeUndefined() {
    if (actual !== undefined) throw new Error(`expected undefined, received ${JSON.stringify(actual)}`);
  },
  toBeDefined() {
    if (actual === undefined) throw new Error('expected defined');
  },
});

process.on('exit', () => {
  console.log(`\npassed: ${passed}, failed: ${failures.length}`);
  for (const f of failures) console.log(`FAIL ${f}`);
  if (failures.length > 0) process.exitCode = 1;
});

export { describe, expect, it };
