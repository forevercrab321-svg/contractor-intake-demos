document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{const root=button.closest('.command');root.querySelectorAll('.filter').forEach(item=>item.classList.remove('active'));button.classList.add('active');root.querySelectorAll('.item').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.status!==button.dataset.filter})}));

document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{const panel=button.closest('.panel');panel.querySelectorAll('[data-view]').forEach(item=>item.classList.remove('active'));button.classList.add('active');panel.querySelectorAll('.state').forEach(state=>state.hidden=state.dataset.state!==button.dataset.view)}));

document.querySelectorAll('[data-roi]').forEach(slider=>{const root=slider.closest('.roi');const volume=root.querySelector('[data-volume]');const value=root.querySelector('[data-value]');const update=()=>{const missed=Number(slider.value);const closeRate=Number(root.dataset.closeRate);const jobValue=Number(root.dataset.jobValue);volume.textContent=missed;value.textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(missed*closeRate*jobValue*4.33)};slider.addEventListener('input',update);update()});

const metricSets={
  'theme-woods':[['capacity','82','%','82%'],['ready','14','/17','58%'],['at risk','03','','34%']],
  'theme-bizzy':[['routed','19','/22','76%'],['ready','16','','64%'],['at risk','04','','28%']],
  'theme-roscoe':[['3-day load','88','%','88%'],['ready','21','/24','71%'],['blocked','03','','31%']],
  'theme-comforttemp':[['fleet load','86','%','86%'],['ready','31','/36','73%'],['at risk','05','','24%']],
  'theme-day':[['board load','79','%','79%'],['ready','12','/15','62%'],['returns','03','','34%']],
  'theme-absolute':[['2-site load','73','%','73%'],['ready','09','/12','54%'],['follow-up','04','','42%']]
};
if(document.body.classList.contains('v2')){const key=Object.keys(metricSets).find(name=>document.body.classList.contains(name));const anchor=document.querySelector('.command>p');if(key&&anchor){const metrics=document.createElement('div');metrics.className='metrics';metrics.setAttribute('aria-label','Illustrative operations metrics');metrics.innerHTML=metricSets[key].map(([label,value,suffix,fill])=>`<div class="metric fill-${fill.replace('%','')}"><small>${label}</small><b>${value}<em>${suffix}</em></b></div>`).join('');anchor.after(metrics)}}
