const routeData={
  all:{owner:'3',priority:'2',handoff:'4',label:'All sample routes'},
  north:{owner:'1',priority:'1',handoff:'1',label:'North route · synthetic sample'},
  central:{owner:'2',priority:'1',handoff:'2',label:'Central route · synthetic sample'},
  south:{owner:'0',priority:'0',handoff:'1',label:'South route · synthetic sample'}
};

document.querySelectorAll('.route-tab').forEach(button=>button.addEventListener('click',()=>{
  const route=button.dataset.route;
  const values=routeData[route];
  document.querySelectorAll('.route-tab').forEach(tab=>{
    const active=tab===button;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  document.querySelector('[data-owner-count]').textContent=values.owner;
  document.querySelector('[data-priority-count]').textContent=values.priority;
  document.querySelector('[data-handoff-count]').textContent=values.handoff;
  document.querySelector('[data-route-label]').textContent=values.label;
  document.querySelector('.route-visual').dataset.active=route;
}));

document.querySelectorAll('.pilot-filter').forEach(button=>button.addEventListener('click',()=>{
  const root=button.closest('.queue-panel');
  root.querySelectorAll('.pilot-filter').forEach(item=>item.classList.toggle('active',item===button));
  root.querySelectorAll('.item').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.status!==button.dataset.filter});
}));

const handoffButton=document.querySelector('[data-handoff-button]');
const handoffPreview=document.querySelector('[data-handoff-preview]');
handoffButton.addEventListener('click',()=>{
  const willShow=handoffPreview.hidden;
  handoffPreview.hidden=!willShow;
  handoffButton.firstChild.textContent=willShow?'Hide sample handoff ':'Preview sample handoff ';
});
