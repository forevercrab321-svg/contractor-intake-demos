const officeButtons=[...document.querySelectorAll('.office-tab')];
const queueItems=[...document.querySelectorAll('.queue .item')];
const queueCount=document.querySelector('[data-queue-count]');

function applyOfficeFilter(selectedOffice){
  const activeStatus=document.querySelector('.filter.active')?.dataset.filter||'all';
  let visible=0;
  queueItems.forEach(item=>{
    const officeMatch=selectedOffice==='all'||item.dataset.office===selectedOffice;
    const statusMatch=activeStatus==='all'||item.dataset.status===activeStatus;
    item.classList.toggle('is-office-hidden',!officeMatch);
    item.hidden=!statusMatch;
    if(officeMatch&&statusMatch) visible+=1;
  });
  if(queueCount) queueCount.textContent=`${visible} shown`;
}

officeButtons.forEach(button=>button.addEventListener('click',()=>{
  officeButtons.forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  applyOfficeFilter(button.dataset.office);
}));

document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  const selectedOffice=document.querySelector('.office-tab.active')?.dataset.office||'all';
  requestAnimationFrame(()=>applyOfficeFilter(selectedOffice));
}));

applyOfficeFilter('all');
