const cfg=window.ROOFING_CONFIG;
document.documentElement.style.setProperty('--brand',cfg.brand);
document.documentElement.style.setProperty('--brand-dark',cfg.brandDark);
document.querySelectorAll('[data-company]').forEach(e=>e.textContent=cfg.company);
document.querySelectorAll('[data-phone]').forEach(e=>{if(cfg.phone){e.textContent='Public phone: '+cfg.phone}else{e.hidden=true}});
document.querySelector('[data-area]').textContent=cfg.serviceArea;
const state={issue:'',urgency:'',window:''};let step=0;
const steps=[...document.querySelectorAll('.step')];const bars=[...document.querySelectorAll('.progress span')];
document.querySelectorAll('.error').forEach(e=>{e.setAttribute('role','alert');e.setAttribute('aria-live','polite')});
function show(n){step=n;steps.forEach((e,i)=>{const active=i===n;e.classList.toggle('active',active);e.setAttribute('aria-hidden',String(!active))});bars.forEach((e,i)=>e.classList.toggle('on',i<=Math.min(n,3)));window.scrollTo({top:0,behavior:'smooth'});if(n>0){const heading=steps[n].querySelector('h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true})}}
function selectOne(selector,button){document.querySelectorAll(selector).forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});button.classList.add('selected');button.setAttribute('aria-pressed','true')}
document.querySelectorAll('.issue').forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{selectOne('.issue',b);state.issue=b.dataset.value;document.querySelector('#issue-next').disabled=false;})});
document.querySelectorAll('.urgency button').forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{selectOne('.urgency button',b);state.urgency=b.dataset.value;})});
document.querySelectorAll('.slot').forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{selectOne('.slot',b);state.window=b.dataset.value;document.querySelector('#slot-error').style.display='none';})});
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{const target=Number(b.dataset.next);if(step===1&&!validateDetails())return;if(step===2&&!state.window){document.querySelector('#slot-error').style.display='block';return}if(target===3)renderReview();show(target);}));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.back))));
function value(id){return document.querySelector(id).value.trim()}
function validateDetails(){const required=['#name','#phone','#email','#address'];let ok=true;let firstInvalid=null;required.forEach(id=>{const el=document.querySelector(id);const err=el.nextElementSibling;const valid=Boolean(el.value.trim())&&el.checkValidity();err.textContent=id==='#email'&&el.value.trim()?'Enter a valid email address.':err.dataset.default||err.textContent;err.dataset.default=err.dataset.default||err.textContent;err.style.display=valid?'none':'block';el.setAttribute('aria-invalid',String(!valid));if(!valid){ok=false;firstInvalid=firstInvalid||el}});if(firstInvalid)firstInvalid.focus();if(!state.urgency)state.urgency='Needs assessment';return ok}
function renderReview(){const photo=document.querySelector('#photos').files.length;const pairs=[['Request',state.issue],['Urgency',state.urgency],['Property',value('#address')],...(cfg.reviewFields||[]).map(x=>[x.label,value(x.selector)||'Not supplied']),['Contact',value('#name')+' · '+value('#phone')],['Email',value('#email')],['Photos',photo?photo+' selected':'None added'],['Preferred time',state.window]];const dl=document.createElement('dl');pairs.forEach(([label,content])=>{const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=label;dd.textContent=content;dl.append(dt,dd)});document.querySelector('#review').replaceChildren(dl)}
document.querySelector('#demo-form').addEventListener('submit',e=>{e.preventDefault();show(4)});
show(0);
