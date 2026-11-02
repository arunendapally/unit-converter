import { convert, UNITS } from './convert.mjs';

const $ = (id) => document.getElementById(id);
const fill = (id, units, selected) => {
  $(id).replaceChildren(...units.map((u) => new Option(u, u, false, u === selected)));
};

function update() {
  const r = convert($('category').value, $('value').value, $('from').value, $('to').value);
  $('result').textContent = r.message ?? `${r.result} ${$('to').value}`;
}

$('category').addEventListener('change', () => {
  const units = UNITS[$('category').value];
  fill('from', units, units[0]);
  fill('to', units, units[1]);
});
document.addEventListener('input', update);
document.addEventListener('change', update);
