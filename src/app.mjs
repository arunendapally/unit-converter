import { convert, UNITS } from './convert.mjs';

const $ = (id) => document.getElementById(id);
const fill = (id, units, selected) => {
  $(id).replaceChildren(...units.map((u) => new Option(u, u, false, u === selected)));
};

function update() {
  const r = convert($('category').value, $('value').value, $('from').value, $('to').value);
  $('result').textContent = r.message ?? `${r.result} ${$('to').value}`;
}

// Fill the unit lists from the category. 'input' fires before the document listener below, so the lists
// match the category before update() runs. After Back, the browser may restore a category whose lists
// the HTML does not hold; it restores the form after this module runs, so the check waits for pageshow.
function syncUnits(force) {
  const units = UNITS[$('category').value];
  const shown = [...$('from').options].map((o) => o.value);
  if (force || shown.join() !== units.join()) {
    fill('from', units, units[0]);
    fill('to', units, units[1]);
  }
}
$('category').addEventListener('input', () => syncUnits(true));
document.addEventListener('input', update);
window.addEventListener('pageshow', () => {
  syncUnits(false);
  if ($('value').value) update();
});
