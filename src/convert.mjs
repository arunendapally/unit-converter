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
const NUMBER = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

export function convert(category, input, from, to) {
  const text = input.trim();
  if (text === '') return { message: 'Enter a number' };
  if (!NUMBER.test(text)) return { message: 'Enter a valid number' };
  const x = Number(text);
  if (Math.abs(x) > 1e15) return { message: 'Number too large' };
  let out;
  if (category === 'temperature') {
    // Rounding kelvin to 9 places absorbs float error so exact absolute zero is allowed.
    const k = Number((TO_C[from](x) + 273.15).toFixed(9));
    if (k < 0) return { message: 'Below absolute zero' };
    out = FROM_C[to](k - 273.15);
  } else {
    if (x < 0) return { message: 'Length and weight cannot be negative' };
    out = (x * FACTORS[from]) / FACTORS[to];
  }
  const n = Number(out.toPrecision(6));
  // String() prints 1e15 in full; the contract wants exponent form from 1e15 up.
  return { result: Math.abs(n) >= 1e15 ? n.toExponential() : String(n === 0 ? 0 : n) };
}
