const cfg=window.ROOFING_CONFIG;
document.documentElement.style.setProperty('--brand',cfg.brand);
document.documentElement.style.setProperty('--brand-dark',cfg.brandDark);
document.querySelectorAll('[data-company]').forEach(e=>e.textContent=cfg.company);
document.querySelectorAll('[data-phone]').forEach(e=>{if(cfg.phone){e.textContent='Public phone: '+cfg.phone}else{e.hidden=true}});
document.querySelector('[data-area]').textContent=cfg.serviceArea;
const state={issue:'',urgency:'',window:''};let step=0;
const steps=[...document.querySelectorAll('.step')];const bars=[...document.querySelectorAll('.progress span')];
function show(n){step=n;steps.forEach((e,i)=>e.classList.toggle('active',i===n));bars.forEach((e,i)=>e.classList.toggle('on',i<=Math.min(n,3)));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.issue').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.issue').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.issue=b.dataset.value;document.querySelector('#issue-next').disabled=false;}));
document.querySelectorAll('.urgency button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.urgency button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.urgency=b.dataset.value;}));
document.querySelectorAll('.slot').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.slot').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.window=b.dataset.value;}));
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{const target=Number(b.dataset.next);if(step===1&&!validateDetails())return;if(step===2&&!state.window){document.querySelector('#slot-error').style.display='block';return}if(target===3)renderReview();show(target);}));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.back))));
function value(id){return document.querySelector(id).value.trim()}
function validateDetails(){const required=['#name','#phone','#email','#address'];let ok=true;required.forEach(id=>{const el=document.querySelector(id);const err=el.nextElementSibling;if(!el.value.trim()){err.style.display='block';ok=false}else err.style.display='none'});if(!state.urgency)state.urgency='Needs assessment';return ok}
function renderReview(){const photo=document.querySelector('#photos').files.length;const pairs=[['Request',state.issue],['Urgency',state.urgency],['Property',value('#address')],...(cfg.reviewFields||[]).map(x=>[x.label,value(x.selector)||'Not supplied']),['Contact',value('#name')+' · '+value('#phone')],['Email',value('#email')],['Photos',photo?photo+' selected':'None added'],['Preferred time',state.window]];const dl=document.createElement('dl');pairs.forEach(([label,content])=>{const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=label;dd.textContent=content;dl.append(dt,dd)});document.querySelector('#review').replaceChildren(dl)}
document.querySelector('#demo-form').addEventListener('submit',e=>{e.preventDefault();show(4)});
show(0);
