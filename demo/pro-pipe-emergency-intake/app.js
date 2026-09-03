const sampleRequests = [
  { id: 'PP-2408', priority: 'urgent', status: 'open', age: '7 min ago', aged: false, title: 'Active kitchen supply leak', copy: 'Water shutoff attempted; leak is still active under the sink.', location: 'Sample address · 00000', window: 'As soon as possible' },
  { id: 'PP-2405', priority: 'urgent', status: 'open', age: '42 min ago', aged: false, title: 'Main-line backup reported', copy: 'Multiple fixtures are backing up in this synthetic request.', location: 'Sample address · 00000', window: 'Within 30 minutes' },
  { id: 'PP-2391', priority: 'standard', status: 'open', age: '26 hr ago', aged: true, title: 'Water heater inspection', copy: 'Customer requested an inspection and repair estimate.', location: 'Sample address · 00000', window: 'Tomorrow morning' },
  { id: 'PP-2384', priority: 'standard', status: 'resolved', age: 'Yesterday', aged: false, title: 'Slow bathroom drain', copy: 'Sample dispatcher recorded a completed callback.', location: 'Sample address · 00000', window: 'This afternoon' }
];

const form = document.querySelector('#intake-form');
const confirmation = document.querySelector('[data-confirmation]');
const pathInputs = document.querySelectorAll('input[name="path"]');
const emergencyCallout = document.querySelector('[data-emergency-callout]');
const submitLabel = document.querySelector('[data-submit-label]');
let selectedId = sampleRequests[0].id;
let activeFilter = 'all';

function syncPath() {
  const path = document.querySelector('input[name="path"]:checked').value;
  document.querySelectorAll('.path-option').forEach((option) => option.classList.toggle('selected', option.querySelector('input').checked));
  emergencyCallout.hidden = path !== 'emergency';
  submitLabel.textContent = path === 'emergency' ? 'Send priority callback request' : 'Send standard callback request';
}

pathInputs.forEach((input) => input.addEventListener('change', syncPath));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const urgent = values.get('path') === 'emergency';
  const request = {
    id: `PP-${String(Math.floor(2500 + Math.random() * 400)).padStart(4, '0')}`,
    priority: urgent ? 'urgent' : 'standard', status: 'open', age: 'just now', aged: false,
    title: String(values.get('issue')).slice(0, 52),
    copy: String(values.get('issue')),
    location: `${values.get('address')} · ${values.get('zip')}`,
    window: String(values.get('window'))
  };
  sampleRequests.unshift(request);
  selectedId = request.id;
  document.querySelector('[data-confirm-id]').textContent = request.id;
  document.querySelector('[data-confirm-priority]').textContent = urgent ? 'Urgent' : 'Standard';
  document.querySelector('[data-confirm-target]').textContent = urgent ? 'Immediate staff review' : request.window;
  document.querySelector('[data-sla-title]').textContent = urgent ? 'Priority callback target' : 'Standard callback window';
  document.querySelector('[data-sla-copy]').textContent = urgent
    ? 'This demo marks the request for immediate staff review. It does not guarantee arrival or service.'
    : `This demo records “${request.window}” as the preferred callback window. A dispatcher still confirms availability.`;
  form.hidden = true;
  confirmation.hidden = false;
  confirmation.focus();
  activeFilter = 'all';
  syncFilters();
  renderQueue();
  updateDetail(request);
});

document.querySelector('[data-reset]').addEventListener('click', () => {
  form.reset();
  document.querySelector('input[name="path"][value="emergency"]').checked = true;
  confirmation.hidden = true;
  form.hidden = false;
  syncPath();
  form.querySelector('input[name="address"]').focus();
});

function filteredRequests() {
  if (activeFilter === 'urgent') return sampleRequests.filter((request) => request.priority === 'urgent');
  if (activeFilter === 'open') return sampleRequests.filter((request) => request.status === 'open');
  return sampleRequests;
}

function updateCounts() {
  document.querySelector('[data-count="all"]').textContent = sampleRequests.length;
  document.querySelector('[data-count="urgent"]').textContent = sampleRequests.filter((request) => request.priority === 'urgent').length;
  document.querySelector('[data-count="open"]').textContent = sampleRequests.filter((request) => request.status === 'open').length;
}

function updateDetail(request) {
  selectedId = request.id;
  document.querySelector('[data-detail-id]').textContent = request.id;
  const badge = document.querySelector('[data-detail-badge]');
  badge.textContent = request.priority === 'urgent' ? 'URGENT' : 'STANDARD';
  badge.classList.toggle('standard', request.priority !== 'urgent');
  document.querySelector('[data-detail-time]').textContent = `${request.status.toUpperCase()} · ${request.age.toUpperCase()}`;
  document.querySelector('[data-detail-title]').textContent = request.title;
  document.querySelector('[data-detail-copy]').textContent = request.copy;
  document.querySelector('[data-detail-location]').textContent = request.location;
  document.querySelector('[data-detail-window]').textContent = request.window;
  const button = document.querySelector('[data-resolve]');
  button.textContent = request.status === 'open' ? 'Mark sample resolved' : 'Reopen sample request';
  document.querySelectorAll('.queue-item').forEach((item) => item.classList.toggle('selected', item.dataset.id === request.id));
}

function renderQueue() {
  const root = document.querySelector('[data-queue-list]');
  const visible = filteredRequests();
  root.replaceChildren(...visible.map((request) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `queue-item ${request.priority}${request.status === 'resolved' ? ' resolved' : ''}${request.id === selectedId ? ' selected' : ''}`;
    button.dataset.id = request.id;
    const dot = document.createElement('i');
    dot.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    const title = document.createElement('b');
    title.textContent = request.title;
    const meta = document.createElement('small');
    meta.textContent = `${request.id} · ${request.status} · ${request.age}`;
    const badge = document.createElement('strong');
    badge.textContent = request.priority;
    copy.append(title, meta);
    button.append(dot, copy, badge);
    button.addEventListener('click', () => updateDetail(request));
    return button;
  }));
  if (!visible.some((request) => request.id === selectedId) && visible[0]) updateDetail(visible[0]);
  updateCounts();
  renderSummary();
}

function syncFilters() {
  document.querySelectorAll('.filter').forEach((button) => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  syncFilters();
  renderQueue();
}));

document.querySelector('[data-resolve]').addEventListener('click', () => {
  const request = sampleRequests.find((item) => item.id === selectedId);
  if (!request) return;
  request.status = request.status === 'open' ? 'resolved' : 'open';
  updateDetail(request);
  renderQueue();
});

function renderSummary() {
  const open = sampleRequests.filter((request) => request.status === 'open');
  document.querySelector('[data-summary-open]').textContent = String(open.length).padStart(2, '0');
  document.querySelector('[data-summary-urgent]').textContent = String(open.filter((request) => request.priority === 'urgent').length).padStart(2, '0');
  document.querySelector('[data-summary-aged]').textContent = String(open.filter((request) => request.aged).length).padStart(2, '0');
  document.querySelector('[data-summary-list]').replaceChildren(...open.slice(0, 3).map((request) => {
    const item = document.createElement('li');
    const title = document.createElement('b');
    title.textContent = `${request.id} · ${request.title}`;
    const age = document.createElement('span');
    age.textContent = request.age;
    item.append(title, age);
    return item;
  }));
}

const summaryToggle = document.querySelector('[data-summary-toggle]');
const summaryCard = document.querySelector('[data-summary-card]');
const summaryPlaceholder = document.querySelector('[data-summary-placeholder]');
summaryToggle.addEventListener('click', () => {
  const opening = summaryCard.hidden;
  summaryCard.hidden = !opening;
  summaryPlaceholder.hidden = opening;
  summaryToggle.setAttribute('aria-expanded', String(opening));
  summaryToggle.firstChild.textContent = opening ? 'Hide sample summary ' : 'Preview sample summary ';
});

syncPath();
syncFilters();
renderQueue();
updateDetail(sampleRequests[0]);
