const boards = {
  morning: {
    title: 'Morning readiness',
    metrics: { queue: '12', unassigned: '03', aging: '02', handoff: '02' },
    stages: { intake: '12 sample', qualify: '10 sample', own: '9 sample', ready: '7 sample' },
    queue: [
      { type: 'routing', title: 'Service-area match needs review', meta: 'Sample call 014 · no live address', tag: 'Route' },
      { type: 'routing', title: 'Urgency needs confirmation', meta: 'Sample call 021 · no live customer', tag: 'Qualify' },
      { type: 'aging', title: 'Unassigned record crossed sample target', meta: 'Sample call 026 · sample age 18m', tag: 'Own' },
      { type: 'handoff', title: 'Invoice / PO handoff incomplete', meta: 'Sample job 052 · no live billing data', tag: 'Handoff' }
    ]
  },
  close: {
    title: 'Close-of-day readiness',
    metrics: { queue: '09', unassigned: '01', aging: '01', handoff: '03' },
    stages: { intake: '9 sample', qualify: '8 sample', own: '8 sample', ready: '5 sample' },
    queue: [
      { type: 'routing', title: 'Tomorrow owner needs confirmation', meta: 'Sample call 033 · no live customer', tag: 'Own' },
      { type: 'aging', title: 'Follow-up crossed sample target', meta: 'Sample call 038 · sample age 26m', tag: 'Review' },
      { type: 'handoff', title: 'Completion note not confirmed', meta: 'Sample job 061 · no live invoice', tag: 'Handoff' }
    ]
  }
};

const records = [
  { id: 'SA', category: 'routing', title: 'Service-area match needs review', meta: 'Sample call 014 · no live address', tag: 'Unassigned', urgency: 'Priority review', owner: 'Unassigned', action: 'Confirm service area', copy: 'The sample address is present, but it does not resolve to an approved service-area rule. The record stays visible for a dispatcher decision.' },
  { id: 'UR', category: 'routing', title: 'Urgency requires a human decision', meta: 'Sample call 021 · no live customer', tag: 'Qualify', urgency: 'Needs confirmation', owner: 'Intake owner', action: 'Set agreed priority', copy: 'The synthetic intake note does not meet an agreed urgency condition. The pilot flags the ambiguity without making a service-priority decision.' },
  { id: 'AG', category: 'aging', title: 'Unassigned item crossed the sample target', meta: 'Sample call 026 · sample age only', tag: 'Aging', urgency: 'Standard sample', owner: 'Unassigned', action: 'Assign or resolve', copy: 'The synthetic record remains without an owner beyond the configured sample threshold. It stays on the board until a person takes action.' },
  { id: 'IV', category: 'handoff', title: 'Invoice handoff field is incomplete', meta: 'Sample job 052 · no live billing data', tag: 'Invoice', urgency: 'Closeout sample', owner: 'Billing handoff', action: 'Confirm completion note', copy: 'The sample job reached closeout without one agreed completion field. The concept shows the exception; it does not create or alter an invoice.' },
  { id: 'PO', category: 'handoff', title: 'PO reference needs confirmation', meta: 'Sample job 061 · no live purchase order', tag: 'PO', urgency: 'Closeout sample', owner: 'Service handoff', action: 'Confirm PO reference', copy: 'A synthetic purchase-order requirement is present but unconfirmed. The record waits for a human check before the operational handoff is considered complete.' }
];

const miniQueue = document.querySelector('[data-mini-queue]');
function renderBoard(view) {
  const board = boards[view];
  document.querySelector('[data-board-title]').textContent = board.title;
  Object.entries(board.metrics).forEach(([key, value]) => document.querySelector(`[data-metric="${key}"]`).textContent = value);
  Object.entries(board.stages).forEach(([key, value]) => document.querySelector(`[data-stage="${key}"]`).textContent = value);
  miniQueue.replaceChildren(...board.queue.map((item) => {
    const row = document.createElement('div');
    row.className = `mini-row ${item.type}`;
    row.innerHTML = `<i aria-hidden="true"></i><div><b>${item.title}</b><small>${item.meta}</small></div><span>${item.tag}</span>`;
    return row;
  }));
  document.querySelector('[data-mini-count]').textContent = `${board.queue.length} shown`;
}

document.querySelectorAll('.view-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.view-button').forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderBoard(button.dataset.view);
}));

const recordList = document.querySelector('[data-record-list]');
let filter = 'all';
let selectedId = records[0].id;

function selectRecord(record) {
  selectedId = record.id;
  document.querySelector('[data-detail-category]').textContent = `${record.category.toUpperCase()} EXCEPTION`;
  document.querySelector('[data-detail-title]').textContent = record.title;
  document.querySelector('[data-detail-copy]').textContent = record.copy;
  document.querySelector('[data-detail-urgency]').textContent = record.urgency;
  document.querySelector('[data-detail-owner]').textContent = record.owner;
  document.querySelector('[data-detail-action]').textContent = record.action;
  document.querySelectorAll('.record').forEach((item) => item.classList.toggle('selected', item.dataset.id === record.id));
}

function renderRecords() {
  const visible = records.filter((record) => filter === 'all' || record.category === filter);
  if (!visible.some((record) => record.id === selectedId)) selectedId = visible[0]?.id;
  recordList.replaceChildren(...visible.map((record) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `record${record.id === selectedId ? ' selected' : ''}`;
    button.dataset.category = record.category;
    button.dataset.id = record.id;
    button.innerHTML = `<span class="record-icon">${record.id}</span><span class="record-copy"><b>${record.title}</b><small>${record.meta}</small></span><span class="record-tag">${record.tag}</span>`;
    button.addEventListener('click', () => selectRecord(record));
    return button;
  }));
  const selected = records.find((record) => record.id === selectedId);
  if (selected) selectRecord(selected);
}

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderRecords();
}));

const handoffContent = {
  invoice: { label: 'INVOICE HANDOFF · SYNTHETIC SAMPLE', title: 'Completion note required', copy: 'The sample record remains visible until a person confirms the agreed completion field. No invoice is created or changed.' },
  po: { label: 'PO HANDOFF · SYNTHETIC SAMPLE', title: 'Purchase-order reference required', copy: 'The sample record remains visible until a person confirms the agreed PO field. No accounting record is created or changed.' }
};
document.querySelectorAll('.handoff-row').forEach((button) => button.addEventListener('click', () => {
  const selected = handoffContent[button.dataset.handoff];
  document.querySelectorAll('.handoff-row').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('[data-handoff-inspect]').hidden = false;
  document.querySelector('[data-handoff-label]').textContent = selected.label;
  document.querySelector('[data-handoff-title]').textContent = selected.title;
  document.querySelector('[data-handoff-copy]').textContent = selected.copy;
}));

const summaryButton = document.querySelector('[data-summary-button]');
const summary = document.querySelector('[data-summary]');
const readinessVisual = document.querySelector('[data-readiness-visual]');
summaryButton.addEventListener('click', () => {
  const willOpen = summary.hidden;
  summary.hidden = !willOpen;
  readinessVisual.hidden = willOpen;
  summaryButton.setAttribute('aria-expanded', String(willOpen));
  summaryButton.firstChild.textContent = willOpen ? 'Hide synthetic shift summary ' : 'Open synthetic shift summary ';
});

renderBoard('morning');
renderRecords();
