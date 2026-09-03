'use strict';

const form = document.querySelector('[data-form]');
const fields = Object.fromEntries([...form.elements].filter(Boolean).map(el => [el.name, el]));
const officeLabels = { tampa: 'Tampa sample', orlando: 'Orlando sample', unknown: 'Office review required' };
const ownerLabels = { tampa: 'Tampa SAM queue', orlando: 'Orlando SAM queue', unknown: 'Routing review queue' };
const serviceLabels = { leak: 'Active roof leak', inspection: 'Inspection request', repair: 'Repair request', estimate: 'Estimate request' };
const urgencyLabels = { standard: 'Standard review', priority: 'Priority / active impact', safety: 'Possible safety issue' };

let recordCounter = 1;
let stage = 0;

function classify(input) {
  const owner = ownerLabels[input.office] || ownerLabels.unknown;
  const proposalAge = Number(input.proposalAge || 0);
  const invoiceAge = Number(input.invoiceAge || 0);
  const requiresRouteReview = input.office === 'unknown';
  const safetyGate = input.urgency === 'safety';
  let state = safetyGate ? 'HUMAN NOW' : requiresRouteReview ? 'ROUTE CHECK' : 'READY';
  let action = safetyGate ? 'Escalate wording to a human owner' : requiresRouteReview ? 'Confirm office and SAM owner' : 'Review request and confirm SAM owner';
  let detail = `${owner} proposed · ${urgencyLabels[input.urgency]}`;
  if (invoiceAge >= 30) {
    state = 'AR EXCEPTION'; action = 'Finance owner reviews invoice exception'; detail = `${invoiceAge} synthetic days · no collection action automated`;
  } else if (invoiceAge > 0) {
    state = 'INVOICE REVIEW'; action = 'Office owner reviews invoice status'; detail = `${invoiceAge} synthetic days · current accounting system stays authoritative`;
  } else if (proposalAge >= 7) {
    state = 'FOLLOW-UP DUE'; action = 'SAM reviews proposal follow-up'; detail = `${proposalAge} synthetic days · no customer message sent`;
  } else if (proposalAge > 0) {
    state = 'PROPOSAL OPEN'; action = 'SAM confirms proposal status'; detail = `${proposalAge} synthetic days · follow-up threshold not reached`;
  }
  return { owner, proposalAge, invoiceAge, state, action, detail };
}

function currentInput() {
  return Object.fromEntries(Object.entries(fields).map(([key, el]) => [key, el.value]));
}

function render(input = currentInput(), advanceStage = 0) {
  const result = classify(input);
  stage = advanceStage;
  document.querySelector('[data-record-id]').textContent = `Request RC-SYN-${String(recordCounter).padStart(3, '0')}`;
  document.querySelector('[data-state]').textContent = result.state;
  document.querySelector('[data-state]').className = `state ${result.state.includes('EXCEPTION') || result.state.includes('HUMAN') ? 'alert' : result.state.includes('DUE') || result.state.includes('CHECK') ? 'warn' : ''}`;
  document.querySelector('[data-action]').textContent = result.action;
  document.querySelector('[data-detail]').textContent = result.detail;
  document.querySelector('[data-site]').textContent = input.site || 'Synthetic site';
  document.querySelector('[data-office]').textContent = officeLabels[input.office];
  document.querySelector('[data-service]').textContent = serviceLabels[input.service];
  document.querySelector('[data-owner]').textContent = result.owner;
  document.querySelector('[data-proposal]').textContent = result.proposalAge ? `${result.proposalAge} synthetic days` : 'Not yet proposed';
  document.querySelector('[data-invoice]').textContent = result.invoiceAge ? `${result.invoiceAge} synthetic days` : 'Not yet invoiced';
  document.querySelectorAll('[data-stage-line] li').forEach((li, index) => {
    li.classList.toggle('done', index < stage);
    li.classList.toggle('current', index === stage);
  });
  const next = ['Advance to SAM review →','Advance to proposal review →','Advance to invoice review →','Advance to AR review →','Restart synthetic flow ↺'][stage];
  document.querySelector('[data-advance]').textContent = next;
  return result;
}

document.querySelector('[data-prepare]').addEventListener('click', () => { recordCounter += 1; render(currentInput(), 0); });
document.querySelector('[data-advance]').addEventListener('click', () => { stage = stage >= 4 ? 0 : stage + 1; render(currentInput(), stage); });

const boardRecords = [
  { id:'SYN-2401', office:'Tampa', owner:'Tampa SAM queue', lane:'clear', stage:'Request assigned', age:'0d', action:'Confirm service window' },
  { id:'SYN-2402', office:'Orlando', owner:'Orlando SAM queue', lane:'proposal', stage:'Proposal follow-up', age:'8d', action:'SAM review due' },
  { id:'SYN-2403', office:'Tampa', owner:'Tampa SAM queue', lane:'proposal', stage:'Proposal follow-up', age:'15d', action:'SAM review due' },
  { id:'SYN-2404', office:'Orlando', owner:'Office finance queue', lane:'clear', stage:'Invoice open', age:'12d', action:'No exception' },
  { id:'SYN-2405', office:'Tampa', owner:'Office finance queue', lane:'ar', stage:'AR exception', age:'36d', action:'Finance review due' }
];

function renderBoard(filter = 'all') {
  const visible = filter === 'all' ? boardRecords : boardRecords.filter(r => r.lane === filter);
  document.querySelector('[data-board]').innerHTML = visible.map(r => `<tr><td><b>${r.id}</b><small>synthetic record</small></td><td><b>${r.office}</b><small>${r.owner}</small></td><td><span class="queue-pill ${r.lane}">${r.stage}</span></td><td><b>${r.age}</b><small>synthetic age</small></td><td>${r.action}</td></tr>`).join('');
}

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === button));
  renderBoard(button.dataset.filter);
}));

const tests = [
  { id:'T01', title:'Tampa request route', input:{office:'tampa',urgency:'standard',proposalAge:'0',invoiceAge:'0'}, expected:'Tampa SAM queue · READY', check:r=>r.owner==='Tampa SAM queue'&&r.state==='READY' },
  { id:'T02', title:'Orlando priority route', input:{office:'orlando',urgency:'priority',proposalAge:'0',invoiceAge:'0'}, expected:'Orlando SAM queue · READY', check:r=>r.owner==='Orlando SAM queue'&&r.state==='READY' },
  { id:'T03', title:'Unknown office gate', input:{office:'unknown',urgency:'standard',proposalAge:'0',invoiceAge:'0'}, expected:'Routing review queue · ROUTE CHECK', check:r=>r.owner==='Routing review queue'&&r.state==='ROUTE CHECK' },
  { id:'T04', title:'Proposal aging threshold', input:{office:'orlando',urgency:'standard',proposalAge:'8',invoiceAge:'0'}, expected:'FOLLOW-UP DUE · 8 synthetic days', check:r=>r.state==='FOLLOW-UP DUE'&&r.proposalAge===8 },
  { id:'T05', title:'Invoice / AR exception', input:{office:'tampa',urgency:'standard',proposalAge:'8',invoiceAge:'36'}, expected:'AR EXCEPTION · 36 synthetic days', check:r=>r.state==='AR EXCEPTION'&&r.invoiceAge===36 }
];

let runCount = 0;
function runTest(index) {
  const test = tests[index];
  const card = document.querySelector(`[data-test="${index}"]`);
  const passed = Boolean(test.check(classify(test.input)));
  card.classList.remove('pass','fail'); card.classList.add(passed ? 'pass' : 'fail');
  card.querySelector('.result').textContent = passed ? 'PASS' : 'FAIL';
  if (!card.dataset.ran) { card.dataset.ran = 'true'; runCount += 1; }
  const passedCount = document.querySelectorAll('.test.pass').length;
  document.querySelector('[data-test-summary]').textContent = `${passedCount} pass · ${runCount} / 5 run`;
}

document.querySelector('[data-tests]').innerHTML = tests.map((t,i)=>`<article class="test" data-test="${i}"><span>${t.id}</span><h3>${t.title}</h3><p>${Object.values(t.input).join(' · ')}</p><div class="expected"><small>EXPECTED</small><b>${t.expected}</b></div><button type="button" data-run="${i}">Run case</button><div class="result">NOT RUN</div></article>`).join('');
document.querySelectorAll('[data-run]').forEach(button => button.addEventListener('click', () => runTest(Number(button.dataset.run))));
document.querySelector('[data-run-all]').addEventListener('click', () => tests.forEach((_,i)=>runTest(i)));

renderBoard();
render();
