const countyData={
  all:{unowned:'3',emergency:'2',readiness:'7',callback:'1'},
  cobb:{unowned:'1',emergency:'1',readiness:'8',callback:'0'},
  cherokee:{unowned:'0',emergency:'0',readiness:'7',callback:'1'},
  fulton:{unowned:'1',emergency:'1',readiness:'6',callback:'0'},
  dekalb:{unowned:'1',emergency:'0',readiness:'7',callback:'0'},
  gwinnett:{unowned:'0',emergency:'0',readiness:'8',callback:'1'}
};

function selectCounty(county){
  const values=countyData[county];
  document.querySelectorAll('.county-tab').forEach(tab=>{
    const active=tab.dataset.county===county;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  document.querySelectorAll('.county-node').forEach(node=>node.classList.toggle('hot',county!=='all'&&node.dataset.node===county));
  Object.entries(values).forEach(([key,value])=>{document.querySelector(`[data-${key}]`).textContent=value});
}

document.querySelectorAll('.county-tab').forEach(button=>button.addEventListener('click',()=>selectCounty(button.dataset.county)));
document.querySelectorAll('.county-node').forEach(button=>button.addEventListener('click',()=>selectCounty(button.dataset.node)));

document.querySelectorAll('.concept-filter').forEach(button=>button.addEventListener('click',()=>{
  const root=button.closest('.queue-panel');
  root.querySelectorAll('.concept-filter').forEach(item=>item.classList.toggle('active',item===button));
  root.querySelectorAll('.item').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.status!==button.dataset.filter});
}));

const readinessButton=document.querySelector('[data-readiness-button]');
const readinessDetail=document.querySelector('[data-readiness-detail]');
readinessButton.addEventListener('click',()=>{
  const willShow=readinessDetail.hidden;
  readinessDetail.hidden=!willShow;
  readinessButton.firstChild.textContent=willShow?'Hide three sample gaps ':'Show three sample gaps ';
});
