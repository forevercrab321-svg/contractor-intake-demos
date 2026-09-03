const data = {
  today: {
    title: 'Today · 4 sample exceptions',
    metrics: { booking: '06', owner: '02', followup: '03' },
    flow: { inbound: '9', booked: '6', owned: '4', ready: '3' },
    queue: [
      { category: 'booking', title: 'Service window unconfirmed', meta: 'Sample call 104 · CSR review', tag: 'Book' },
      { category: 'dispatch', title: 'Assignment balance review', meta: 'Sample job 217 · human gate', tag: 'Own' },
      { category: 'followup', title: 'Happy Call due', meta: 'Sample closeout 083 · follow-up', tag: 'Call' },
      { category: 'route', title: 'Sequence note needs review', meta: 'Sample route B · dispatcher', tag: 'Route' }
    ]
  },
  tomorrow: {
    title: 'Tomorrow · 3 sample exceptions',
    metrics: { booking: '08', owner: '01', followup: '02' },
    flow: { inbound: '10', booked: '8', owned: '7', ready: '5' },
    queue: [
      { category: 'booking', title: 'Arrival window needs confirmation', meta: 'Sample call 118 · CSR review', tag: 'Book' },
      { category: 'dispatch', title: 'Technician assignment pending', meta: 'Sample job 231 · human gate', tag: 'Own' },
      { category: 'route', title: 'First-stop access note missing', meta: 'Sample route D · dispatcher', tag: 'Route' }
    ]
  }
};

const jobs = [
  {
    id: 'BK', category: 'booking', title: 'Call record needs a booking window',
    meta: 'Sample call 104 · no live customer data', tag: 'CSR review',
    body: 'The contact record is complete, but a service window has not been confirmed. Keep it visible without changing the approved scheduling system.',
    owner: 'CSR review', action: 'Confirm window', rule: 'Booking completeness'
  },
  {
    id: 'DS', category: 'dispatch', title: 'Assignment balance needs human review',
    meta: 'Sample job 217 · no live technician data', tag: 'Dispatch',
    body: 'The synthetic board shows one technician carrying the next assignment while another is available. The pilot flags it; the dispatcher decides.',
    owner: 'Dispatcher', action: 'Review assignment', rule: 'Agreed distribution rule'
  },
  {
    id: 'HC', category: 'followup', title: 'Happy Call crossed the sample threshold',
    meta: 'Sample closeout 083 · no live call data', tag: 'Follow-up',
    body: 'A closed synthetic record reached the agreed follow-up threshold without a recorded Happy Call outcome. It remains visible until a person resolves it.',
    owner: 'CSR follow-up', action: 'Record outcome', rule: 'Follow-up exception'
  },
  {
    id: 'RT', category: 'route', title: 'Route sequence note needs confirmation',
    meta: 'Sample route B · no live location data', tag: 'Route',
    body: 'A synthetic stop sequence changed, but its access note did not. The pilot raises the mismatch for confirmation rather than changing the route.',
    owner: 'Dispatcher', action: 'Confirm sequence note', rule: 'Route/order readiness'
  }
];

const queueRoot = document.querySelector('[data-queue]');
const titleRoot = document.querySelector('[data-view-title]');

function renderQueue(day) {
  const selected = data[day];
  titleRoot.textContent = selected.title;
  Object.entries(selected.metrics).forEach(([key, value]) => {
    document.querySelector(`[data-metric="${key}"]`).textContent = value;
  });
  Object.entries(selected.flow).forEach(([key, value]) => {
    document.querySelector(`[data-flow="${key}"]`).textContent = value;
  });
  queueRoot.replaceChildren(...selected.queue.map((item) => {
    const row = document.createElement('div');
    row.className = `queue-item ${item.category}`;
    row.innerHTML = `<i aria-hidden="true"></i><div><b>${item.title}</b><small>${item.meta}</small></div><span>${item.tag}</span>`;
    return row;
  }));
  document.querySelector('[data-queue-count]').textContent = `${selected.queue.length} shown`;
}

document.querySelectorAll('.day-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.day-toggle').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderQueue(button.dataset.day);
  });
});

const jobsRoot = document.querySelector('[data-jobs]');
let currentFilter = 'all';
let currentJobId = jobs[0].id;

function updateDetail(job) {
  currentJobId = job.id;
  document.querySelector('[data-detail-type]').textContent = `SELECTED · ${job.category.toUpperCase()}`;
  document.querySelector('[data-detail-title]').textContent = job.title;
  document.querySelector('[data-detail-body]').textContent = job.body;
  document.querySelector('[data-detail-owner]').textContent = job.owner;
  document.querySelector('[data-detail-action]').textContent = job.action;
  document.querySelector('[data-detail-rule]').textContent = job.rule;
  document.querySelectorAll('.job').forEach((item) => item.classList.toggle('selected', item.dataset.id === job.id));
}

function renderJobs() {
  const visible = jobs.filter((job) => currentFilter === 'all' || job.category === currentFilter);
  if (!visible.some((job) => job.id === currentJobId)) currentJobId = visible[0]?.id;
  jobsRoot.replaceChildren(...visible.map((job) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `job${job.id === currentJobId ? ' selected' : ''}`;
    button.dataset.category = job.category;
    button.dataset.id = job.id;
    button.innerHTML = `<span class="job-icon">${job.id}</span><span class="job-copy"><b>${job.title}</b><small>${job.meta}</small></span><span class="job-tag">${job.tag}</span>`;
    button.addEventListener('click', () => updateDetail(job));
    return button;
  }));
  const selected = jobs.find((job) => job.id === currentJobId);
  if (selected) updateDetail(selected);
}

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderJobs();
  });
});

const summaryButton = document.querySelector('[data-summary-toggle]');
const summaryPanel = document.querySelector('[data-summary-panel]');
const summaryPlaceholder = document.querySelector('[data-summary-placeholder]');
summaryButton.addEventListener('click', () => {
  const willOpen = summaryPanel.hidden;
  summaryPanel.hidden = !willOpen;
  summaryPlaceholder.hidden = willOpen;
  summaryButton.setAttribute('aria-expanded', String(willOpen));
  summaryButton.firstChild.textContent = willOpen ? 'Hide synthetic daily summary ' : 'Preview synthetic daily summary ';
});

renderQueue('today');
renderJobs();
