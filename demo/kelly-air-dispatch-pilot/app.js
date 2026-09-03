const readinessModes={
  today:{score:'76',ready:'9',total:'12',urgent:'2',aging:'3',summary:'3 decisions before assignment',note:'Owner, skill and parts status need review.'},
  peak:{score:'61',ready:'13',total:'18',urgent:'4',aging:'6',summary:'Peak-load exceptions are rising',note:'Urgency and aging need operator attention.'},
  handoff:{score:'84',ready:'11',total:'13',urgent:'1',aging:'2',summary:'Two items need next-shift context',note:'Return date and follow-up owner remain open.'}
};

document.querySelectorAll('.mode-tab').forEach(button=>button.addEventListener('click',()=>{
  const mode=readinessModes[button.dataset.mode];
  document.querySelectorAll('.mode-tab').forEach(tab=>{
    const active=tab===button;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  document.querySelector('[data-score]').textContent=mode.score;
  document.querySelector('.score-ring').style.background=`conic-gradient(var(--cyan) 0 ${mode.score}%,rgba(255,255,255,.08) ${mode.score}% 100%)`;
  document.querySelector('[data-ready]').textContent=mode.ready;
  document.querySelector('[data-total]').textContent=mode.total;
  document.querySelector('[data-urgent]').textContent=mode.urgent;
  document.querySelector('[data-aging]').textContent=mode.aging;
  document.querySelector('[data-summary]').textContent=mode.summary;
  document.querySelector('[data-summary-note]').textContent=mode.note;
  document.querySelector('.score-ring').setAttribute('aria-label',`Synthetic readiness score ${mode.score} percent`);
}));

const routing={
  cape:'Cape Coral',fort:'Fort Myers',naples:'Naples',
  cooling:'cooling',plumbing:'plumbing',commercial:'commercial HVAC'
};
const urgencyCopy={
  routine:{label:'4h target',copy:'Routine review · operator confirms the technician owner.'},
  priority:{label:'90m target',copy:'Priority review · operator confirms availability and arrival window.'},
  urgent:{label:'Review now',copy:'Urgent exception · operator validates severity before assignment.'}
};

document.querySelector('[data-route-button]').addEventListener('click',()=>{
  const location=document.querySelector('[data-location]').value;
  const skill=document.querySelector('[data-skill]').value;
  const urgency=document.querySelector('[data-urgency]').value;
  const result=urgencyCopy[urgency];
  document.querySelector('[data-route-title]').textContent=`${routing[location]} ${routing[skill]} queue`;
  document.querySelector('[data-route-copy]').textContent=result.copy;
  document.querySelector('[data-route-sla]').textContent=result.label;
  const box=document.querySelector('[data-route-result]');
  box.animate([{transform:'translateY(3px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:240,easing:'ease-out'});
});

const filters=document.querySelectorAll('.queue-filter');
const rows=document.querySelectorAll('.queue-row:not(.table-head)');
const empty=document.querySelector('[data-empty]');
const agingRange=document.querySelector('[data-aging-range]');

function applyQueueFilter(filter){
  let visible=0;
  const threshold=Number(agingRange.value);
  rows.forEach(row=>{
    const tags=row.dataset.tags.split(' ');
    const show=filter==='all'||(filter==='aging'?Number(row.dataset.age)>=threshold:tags.includes(filter));
    row.hidden=!show;
    if(show) visible+=1;
  });
  empty.hidden=visible!==0;
}

filters.forEach(button=>button.addEventListener('click',()=>{
  filters.forEach(item=>item.classList.toggle('active',item===button));
  applyQueueFilter(button.dataset.filter);
}));

agingRange.addEventListener('input',()=>{
  document.querySelector('[data-threshold]').textContent=agingRange.value;
  const active=document.querySelector('.queue-filter.active').dataset.filter;
  if(active==='aging') applyQueueFilter('aging');
});

const handoffButton=document.querySelector('[data-handoff]');
const handoffPreview=document.querySelector('[data-handoff-preview]');
handoffButton.addEventListener('click',()=>{
  const willShow=handoffPreview.hidden;
  handoffPreview.hidden=!willShow;
  handoffButton.firstChild.textContent=willShow?'Hide sample handoff ':'Preview sample handoff ';
  handoffButton.setAttribute('aria-expanded',String(willShow));
});
