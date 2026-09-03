const sampleMarkets={
  all:{urgent:'3',conflicts:'2',aging:'4'},
  gulf:{urgent:'2',conflicts:'1',aging:'1'},
  central:{urgent:'1',conflicts:'1',aging:'2'},
  atlantic:{urgent:'0',conflicts:'0',aging:'1'}
};

document.querySelectorAll('.market-tab').forEach(button=>button.addEventListener('click',()=>{
  const values=sampleMarkets[button.dataset.market];
  document.querySelectorAll('.market-tab').forEach(tab=>{
    const active=tab===button;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  Object.entries(values).forEach(([key,value])=>{document.querySelector(`[data-kpi="${key}"]`).textContent=value});
  document.querySelectorAll('.zone').forEach(zone=>zone.classList.toggle('hot',button.dataset.market!=='all'&&zone.classList.contains(button.dataset.market)));
}));

document.querySelectorAll('.exception-filter').forEach(button=>button.addEventListener('click',()=>{
  const root=button.closest('.exception-panel');
  root.querySelectorAll('.exception-filter').forEach(item=>item.classList.toggle('active',item===button));
  root.querySelectorAll('.item').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.status!==button.dataset.filter});
}));

const readinessButton=document.querySelector('[data-readiness]');
const readinessDetail=document.querySelector('[data-readiness-detail]');
readinessButton.addEventListener('click',()=>{
  const willShow=readinessDetail.hidden;
  readinessDetail.hidden=!willShow;
  readinessButton.firstChild.textContent=willShow?'Hide unresolved sample visits ':'Show unresolved sample visits ';
});
