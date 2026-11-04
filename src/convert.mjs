export const UNITS = {
  length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
  weight: ['mg', 'g', 'kg', 'oz', 'lb', 'st'],
  temperature: ['C', 'F', 'K'],
};

// Factors to the base unit: metres for length, kilograms for weight.
const LB = 0.45359237;
const FACTORS = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
  mg: 1e-6, g: 0.001, kg: 1, oz: LB / 16, lb: LB, st: LB * 14,
};
const TO_C = { C: (x) => x, F: (x) => ((x - 32) * 5) / 9, K: (x) => x - 273.15 };
const FROM_C = { C: (c) => c, F: (c) => (c * 9) / 5 + 32, K: (c) => c + 273.15 };
const ZERO = { C: -273.15, F: -459.67, K: 0 }; // absolute zero in each temperature unit
const NUMBER = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

export function convert(category, input, from, to) {
  const units = UNITS[category];
  if (!units || !units.includes(from) || !units.includes(to)) return { message: 'Choose units from the same category' };
  const text = input.trim();
  if (text === '') return { message: 'Enter a number' };
  if (!NUMBER.test(text)) return { message: 'Enter a valid number' };
  const x = Number(text);
  if (Math.abs(x) > 1e15) return { message: 'Number too large' };
  let out;
  if (category === 'temperature') {
    // Compared in the input's own unit, so exact absolute zero is allowed and nothing below it.
    if (x < ZERO[from]) return { message: 'Below absolute zero' };
    out = from === to ? x : FROM_C[to](TO_C[from](x));
  } else {
    if (x < 0) return { message: 'Length and weight cannot be negative' };
    out = (x * FACTORS[from]) / FACTORS[to];
  }
  const n = Number(out.toPrecision(6));
  // String() prints 1e15 in full; the contract wants exponent form from 1e15 up.
  return { result: Math.abs(n) >= 1e15 ? n.toExponential() : String(n === 0 ? 0 : n) };
}
