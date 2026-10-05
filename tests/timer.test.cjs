// Pure state tests; intentionally not a substitute for browser rendering tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
function harness(saved = {}) {
  const items = new Map(Object.entries(saved));
  const elements = new Map();
  const element = s => {
    if (!elements.has(s)) elements.set(s, { textContent: '', style: {}, setAttribute() {} });
    return elements.get(s);
  };
  const intervals = [];
  let now = 100000;
  const context = vm.createContext({
    $: element, $$: () => [], json: (k, fallback) => items.get(k) ?? fallback,
    storage: { set(k, v) { items.set(k, JSON.parse(v)); } },
    Date: class extends Date { constructor(...a) { super(...(a.length ? a : [now])); } static now() { return now; } },
    document: { title: '', addEventListener() {} },
    setInterval: fn => intervals.push(fn), toast() {},
  });
  vm.runInContext(source.slice(source.indexOf("let timer=json('emir-timer-v2'"), source.indexOf('// Audio is generated')), context);
  return { elements, items, run: code => vm.runInContext(code, context), advance(ms) { now += ms; intervals.forEach(fn => fn()); } };
}
test('timer uses a deadline and handles background elapsed time', () => {
  const h = harness(); h.run('toggleTimer()'); h.advance(62000);
  assert.equal(h.elements.get('#timer').textContent, '23:58');
  h.run('toggleTimer()'); h.advance(500000);
  assert.equal(h.elements.get('#timer').textContent, '23:58');
  h.run('toggleTimer()'); h.advance(1438000);
  assert.equal(h.elements.get('#timer').textContent, '00:00');
  assert.equal(h.elements.get('#sessionCount').textContent, '1 seans');
  h.advance(10000); assert.equal(h.elements.get('#sessionCount').textContent, '1 seans');
});
test('deadline survives a reload and completes exactly once', () => {
  const h = harness({'emir-timer-v2': {minutes:25,left:1500000,end:99000}});
  assert.equal(h.elements.get('#sessionCount').textContent, '1 seans');
  const reloaded = harness(Object.fromEntries(h.items));
  assert.equal(reloaded.elements.get('#sessionCount').textContent, '1 seans');
});
test('malformed saved state falls back safely', () => {
  for (const state of [{minutes:99,left:1,end:null},{minutes:25,left:-3,end:null},{minutes:25,left:2,end:'bad'}]) {
    const h=harness({'emir-timer-v2':state}); assert.equal(h.elements.get('#timer').textContent,'25:00');
  }
});
test('a completed break does not count as focus', () => {
  const h=harness({'emir-timer-v2':{minutes:5,left:100,end:99999}});
  assert.equal(h.elements.get('#sessionCount').textContent,'0 seans');
});
test('reset clears the running deadline', () => {
  const h=harness(); h.run('toggleTimer()'); h.advance(30000); h.elements.get('#timerReset').onclick(); h.advance(30000);
  assert.equal(h.elements.get('#timer').textContent,'25:00'); assert.equal(h.items.get('emir-timer-v2').end,null);
});
