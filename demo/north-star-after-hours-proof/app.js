const areaForZip = (zip) => {
  if (!/^\d{5}$/.test(zip)) return { code: 'INVALID', label: 'Invalid ZIP format', state: 'out' };
  if (zip.startsWith('199')) return { code: 'DE', label: `${zip} · DE sample zone`, state: 'in' };
  if (zip.startsWith('218') || zip.startsWith('216')) return { code: 'MD', label: `${zip} · MD Eastern Shore sample zone`, state: 'in' };
  return { code: 'AREA CHECK', label: `${zip} · coverage review`, state: 'out' };
};

const tradeLabels = { hvac: 'HVAC', plumbing: 'Plumbing', electrical: 'Electrical' };
const urgencyLabels = { routine: 'Routine / estimate', priority: 'Service loss / priority', hazard: 'Possible safety hazard' };
let ticketCounter = 1;

function classify({ trade, zip, urgency }) {
  const area = areaForZip(zip);
  if (urgency === 'hazard') {
    return {
      area,
      state: 'HUMAN NOW',
      tone: 'hazard',
      route: `${area.code} · ${tradeLabels[trade]} · Hazard review`,
      action: 'Pause automation. Human dispatcher reviews the original request now.',
      gate: 'Possible hazard language detected. No diagnosis or repair instruction is provided.',
      confirmation: 'Your request was captured for immediate human review. No technician or arrival time has been assigned.'
    };
  }
  if (area.state !== 'in') {
    return {
      area,
      state: 'AREA CHECK',
      tone: 'out',
      route: `Coverage review · ${tradeLabels[trade]}`,
      action: 'Human dispatcher confirms whether this ZIP is served.',
      gate: 'Coverage is not assumed. The request remains unassigned until a person confirms it.',
      confirmation: 'Your request was captured. A North Star team member would confirm service availability and the next step.'
    };
  }
  return {
    area,
    state: urgency === 'priority' ? 'PRIORITY REVIEW' : 'REVIEW',
    tone: '',
    route: `${area.code} · ${tradeLabels[trade]} · ${urgency === 'priority' ? 'Priority' : 'After-hours'} review`,
    action: 'Human dispatcher confirms priority, owner and response timing.',
    gate: 'No technician, time or outcome is promised by this proof.',
    confirmation: 'Request details captured for review. A North Star team member would confirm the next step.'
  };
}

function value(selector) { return document.querySelector(selector).value.trim(); }

function renderTicket(input, increment = true) {
  const result = classify(input);
  if (increment) ticketCounter += 1;
  document.querySelector('[data-ticket-id]').textContent = `NS-SYN-${String(ticketCounter).padStart(3, '0')}`;
  document.querySelector('[data-ticket-state]').textContent = result.state;
  const banner = document.querySelector('[data-route-banner]');
  banner.classList.toggle('hazard', result.tone === 'hazard');
  banner.classList.toggle('out', result.tone === 'out');
  document.querySelector('[data-route]').textContent = result.route;
  document.querySelector('[data-action]').textContent = result.action;
  document.querySelector('[data-ticket-trade]').textContent = tradeLabels[input.trade];
  document.querySelector('[data-ticket-area]').textContent = result.area.label;
  document.querySelector('[data-ticket-urgency]').textContent = urgencyLabels[input.urgency];
  document.querySelector('[data-ticket-customer]').textContent = input.customer === 'yes' ? 'Yes' : 'No / unknown';
  document.querySelector('[data-ticket-need]').textContent = input.need;
  document.querySelector('[data-ticket-window]').textContent = input.window;
  document.querySelector('[data-gate-copy]').textContent = result.gate;
  document.querySelector('[data-confirmation]').textContent = result.confirmation;
  return result;
}

document.querySelector('[data-evaluate]').addEventListener('click', () => renderTicket({
  trade: value('[data-trade]'),
  zip: value('[data-zip]'),
  urgency: value('[data-urgency]'),
  customer: value('[data-customer]'),
  need: value('[data-need]'),
  window: value('[data-window]')
}));

const tests = [
  { id:'T01', trade:'hvac', zip:'19958', urgency:'routine', input:'HVAC · 19958 · estimate', expected:'DE HVAC after-hours review', check:r=>r.area.code==='DE'&&r.state==='REVIEW' },
  { id:'T02', trade:'hvac', zip:'19966', urgency:'priority', input:'HVAC · 19966 · service loss', expected:'DE HVAC priority review', check:r=>r.area.code==='DE'&&r.state==='PRIORITY REVIEW' },
  { id:'T03', trade:'hvac', zip:'21842', urgency:'routine', input:'HVAC · 21842 · routine', expected:'MD HVAC after-hours review', check:r=>r.area.code==='MD'&&r.state==='REVIEW' },
  { id:'T04', trade:'plumbing', zip:'19968', urgency:'priority', input:'Plumbing · 19968 · priority', expected:'DE plumbing priority review', check:r=>r.area.code==='DE'&&r.state==='PRIORITY REVIEW' },
  { id:'T05', trade:'plumbing', zip:'21601', urgency:'routine', input:'Plumbing · 21601 · estimate', expected:'MD plumbing after-hours review', check:r=>r.area.code==='MD'&&r.state==='REVIEW' },
  { id:'T06', trade:'electrical', zip:'19966', urgency:'hazard', input:'Electrical · 19966 · hazard', expected:'Human now; no repair advice', check:r=>r.state==='HUMAN NOW'&&r.gate.includes('No diagnosis') },
  { id:'T07', trade:'hvac', zip:'19720', urgency:'routine', input:'HVAC · 19720 · routine', expected:'Coverage review; unassigned', check:r=>r.state==='AREA CHECK'&&r.gate.includes('unassigned') },
  { id:'T08', trade:'electrical', zip:'21804', urgency:'priority', input:'Electrical · 21804 · priority', expected:'MD electrical priority review', check:r=>r.area.code==='MD'&&r.state==='PRIORITY REVIEW' },
  { id:'T09', trade:'plumbing', zip:'ABCDE', urgency:'routine', input:'Plumbing · invalid ZIP', expected:'Invalid ZIP area check', check:r=>r.area.code==='INVALID'&&r.state==='AREA CHECK' },
  { id:'T10', trade:'hvac', zip:'21842', urgency:'hazard', input:'HVAC · 21842 · hazard', expected:'Human now; MD label retained', check:r=>r.area.code==='MD'&&r.state==='HUMAN NOW' }
];

const rows = document.querySelector('[data-test-rows]');
rows.innerHTML = tests.map((test, index) => `
  <div class="test-row" role="row" data-test-index="${index}">
    <span class="test-id">${test.id}</span>
    <span class="test-input"><b>${test.input}</b><small>synthetic input</small></span>
    <span class="test-expected"><b>${test.expected}</b><small>pre-agreed expected state</small></span>
    <span class="test-status" data-test-status>NOT RUN</span>
    <button class="test-run" type="button" data-run-test="${index}">Run</button>
  </div>`).join('');

const runState = new Array(tests.length).fill(null);
function updateSummary() {
  const run = runState.filter(value => value !== null).length;
  const pass = runState.filter(Boolean).length;
  document.querySelector('[data-test-summary]').textContent = `${pass} pass · ${run} / 10 run`;
}

function runTest(index) {
  const test = tests[index];
  const result = classify(test);
  const passed = Boolean(test.check(result));
  runState[index] = passed;
  const status = document.querySelector(`[data-test-index="${index}"] [data-test-status]`);
  status.textContent = passed ? 'PASS' : 'FAIL';
  status.className = `test-status ${passed ? 'pass' : 'fail'}`;
  updateSummary();
  return passed;
}

document.querySelectorAll('[data-run-test]').forEach(button => button.addEventListener('click', () => runTest(Number(button.dataset.runTest))));
document.querySelector('[data-run-all]').addEventListener('click', () => tests.forEach((_, index) => runTest(index)));

document.querySelector('[data-handoff]').addEventListener('click', event => {
  const preview = document.querySelector('[data-handoff-preview]');
  preview.hidden = !preview.hidden;
  event.currentTarget.querySelector('span').textContent = preview.hidden ? '+' : '−';
});

renderTicket({trade:'hvac',zip:'19958',urgency:'routine',customer:'yes',need:'No cooling after business hours',window:'As soon as a dispatcher is available'}, false);
