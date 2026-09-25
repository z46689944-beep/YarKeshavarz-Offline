/* YarKeshavarz — Core application and state */
function divj(a,b){return Math.floor(a/b)}
function toJalali(gy,gm,gd){
 let gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy;
 let d=355666+365*gy+divj(gy2+3,4)-divj(gy2+99,100)+divj(gy2+399,400)+gd+gdm[gm-1];
 let jy=-1595+33*divj(d,12053);d%=12053;jy+=4*divj(d,1461);d%=1461;
 if(d>365){jy+=divj(d-1,365);d=(d-1)%365}
 let jm=d<186?1+divj(d,31):7+divj(d-186,30),jd=1+(d<186?d%31:(d-186)%30);
 return [jy,jm,jd]
}
function faNum(v){return String(v).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}

function jalaliToGregorian(jy,jm,jd){
  jy=Number(jy); jm=Number(jm); jd=Number(jd);
  let jy2=jy-979, jm2=jm-1, days=365*jy2+Math.floor(jy2/33)*8+Math.floor((jy2%33+3)/4);
  for(let i=0;i<jm2;i++) days += i<6?31:30;
  days += jd-1;
  let gy=1600+400*Math.floor(days/146097); days%=146097;
  if(days>=36525){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++}
  gy+=4*Math.floor(days/1461);days%=1461;
  if(days>=366){gy+=Math.floor((days-1)/365);days=(days-1)%365}
  let gd=days+1, gdays=[31,(gy%4===0&&(gy%100!==0||gy%400===0))?29:28,31,30,31,30,31,31,30,31,30,31], gm=0;
  while(gm<12 && gd>gdays[gm]){gd-=gdays[gm];gm++}
  return [gy,gm+1,gd];
}
function parseJalaliDate(v){
  let x=String(v||'').trim().replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[-.]/g,'/');
  let p=x.split('/').map(Number);
  if(p.length!==3 || !p.every(Number.isFinite)) return '';
  if(p[0]<1200) return '';
  let g=jalaliToGregorian(p[0],p[1],p[2]);
  return g[0]+'-'+String(g[1]).padStart(2,'0')+'-'+String(g[2]).padStart(2,'0');
}

function jalaliDateTime(v){
 let d=v instanceof Date?v:new Date(v||Date.now());if(isNaN(d))return '';
 return jalaliDate(d)+' '+faNum(String(d.getHours()).padStart(2,'0'))+':'+faNum(String(d.getMinutes()).padStart(2,'0'));
}
function jalaliDate(v){let d=v instanceof Date?v:new Date(v||Date.now());if(isNaN(d))return '';let j=toJalali(d.getFullYear(),d.getMonth()+1,d.getDate());return faNum(j[0]+'/'+String(j[1]).padStart(2,'0')+'/'+String(j[2]).padStart(2,'0'))}

'use strict';
const KEY='yar-keshavarz-v4-single',app=document.getElementById('app'),title=document.getElementById('pageTitle');
const base={lands:[],inventory:[],transactions:[],equipment:[],profile:{name:'',phone:'',email:'',photo:''}};
  const HERO_IMG='assets/wheat-hero.jpg';
let state=load(),route='home',selected=null,map=null,points=[],markers=[],polygon=null,watch=null,satellite=false,measureReturn=null;
function openSelectedTool(r){let id=selected||localStorage.getItem('yk-last-land');if(id&&state.lands.some(x=>x.id===id)){selected=id;go(r)}else{toast('برای استفاده از این بخش، ابتدا یک زمین را باز کن');go('lands')}}
function load(){try{let x={...base,...JSON.parse(localStorage.getItem(KEY)||'{}')};x.lands=x.lands||[];x.inventory=x.inventory||[];x.transactions=x.transactions||[];x.equipment=x.equipment||[];x.profile={...base.profile,...(x.profile||{})};return x}catch{return JSON.parse(JSON.stringify(base))}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){console.error(e);toast('ذخیره‌سازی انجام نشد؛ حافظه مرورگر پر است.');return false}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function n(v){return Number(String(v??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٬,\s]/g,''))||0}
function money(v){return n(v).toLocaleString('fa-IR')+' تومان'}
function formatMoneyValue(v){const raw=String(v??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٬,\s]/g,'');if(!raw)return '';const num=Number(raw);return Number.isFinite(num)?num.toLocaleString('fa-IR'):''}
function bindMoneyInput(el){
 if(!el||el.tagName!=='INPUT'||el.dataset.moneyFmt!=='1'||el.dataset.moneyBound==='1')return;
 el.dataset.moneyBound='1';
 el.addEventListener('focus',()=>{el.value=formatMoneyValue(el.value);requestAnimationFrame(()=>{try{el.setSelectionRange(el.value.length,el.value.length)}catch(_){}})});
 el.addEventListener('input',()=>{
   const start=el.selectionStart||0;
   const before=el.value.slice(0,start);
   const digitsBefore=before.replace(/[۰-۹]/g,'x').replace(/[٬,\s]/g,'').length;
   const formatted=formatMoneyValue(el.value);
   el.value=formatted;
   let pos=formatted.length, count=0;
   for(let i=0;i<formatted.length;i++){if(/[۰-۹0-9]/.test(formatted[i])){if(count>=digitsBefore){pos=i;break}count++}}
   if(digitsBefore>=count)pos=formatted.length;
   try{el.setSelectionRange(pos,pos)}catch(_){}
 });
 el.addEventListener('blur',()=>{if(el.value.trim())el.value=formatMoneyValue(el.value)});
}
function formatNumericInput(el){bindMoneyInput(el)}
document.addEventListener('focusin',e=>bindMoneyInput(e.target));
document.addEventListener('input',e=>{if(e.target&&e.target.dataset&&e.target.dataset.moneyFmt==='1')bindMoneyInput(e.target)});
document.addEventListener('focusout',e=>{if(e.target&&e.target.dataset&&e.target.dataset.moneyFmt==='1'&&e.target.value.trim())e.target.value=formatMoneyValue(e.target.value)});

function glassIcon(icon){return `<span class="glass-icon">${icon}</span>`}

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function toast(x){alert(x)}
function head(x){title.textContent=x}
function totals(id){let t=state.transactions.filter(x=>!id||x.landId===id),c=t.filter(x=>x.type==='expense').reduce((a,x)=>a+n(x.amount),0),i=t.filter(x=>x.type==='income').reduce((a,x)=>a+n(x.amount),0);return{cost:c,income:i,profit:i-c}}
function go(r){if(r==='measure'&&!measureReturn){selected=null;measureReturn='add'}route=r;window.scrollTo({top:0,left:0,behavior:'instant'});if(r==='home')home();else if(r==='lands')lands();else if(r==='add')add();else if(r==='measure')measure();else if(r==='inventory')inventory();else if(r==='weather')weather();else if(r==='equipment')equipment();else if(r==='calculator'){toast('محاسبه‌گر برآورد از نسخه نهایی حذف شده است');go('home')}else if(r==='cultivation')cultivation();else if(r==='profile')profile();else if(r==='account')account();else if(r==='settings')settings();else if(r==='manager')managerChat();else if(r==='ads')ads();else if(r==='news')news();else if(r==='yar')yar();else if(r==='game')game();else home();document.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.r===r))}

































const MANAGER_CHAT_KEY='yk-manager-chat-v1';
















function openNewsDetail(i){let x=(window.__ykNews||[])[i];if(!x)return;head('خبر');app.innerHTML=`<article class="card news-detail"><div style="font-size:38px">${x.icon}</div><span class="badge-news">${esc(x.cat)}</span><h2>${esc(x.title)}</h2><div class="meta-line">${esc(x.date)} · یار کشاورز</div><p>${esc(x.text)}</p><p>این بخش در نسخه نهایی می‌تواند به سامانه اخبار آنلاین متصل شود تا اخبار معتبر، هشدارهای کشاورزی و اطلاعات بازار به‌صورت به‌روز در اختیار کشاورز قرار بگیرد.</p><button class="secondary" onclick="go('news')">← بازگشت به اخبار</button></article>`}




const WX={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',56:'🌧️',57:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',66:'🌧️',67:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',77:'🌨️',80:'🌦️',81:'🌧️',82:'⛈️',85:'🌨️',86:'❄️',95:'⛈️',96:'⛈️',99:'⛈️'};










  
  









function updateMeasure(){
  const A=document.getElementById('ma');
  const H=document.getElementById('mh');
  const P=document.getElementById('mp');
  const N=document.getElementById('mn');
  const R=document.getElementById('register');
  const S=document.getElementById('measureStatus');

  const count=Array.isArray(points)?points.length:0;

  if(N)N.textContent=String(count);

  if(R)R.disabled=count<3;

  if(S){
    S.textContent=count<3
      ?'حداقل ۳ نقطه لازم است.'
      :'آماده ثبت — '+count+' نقطه';
  }

  if(count===0){
    if(A)A.textContent='۰';
    if(H)H.textContent='۰.۰۰۰۰';
    if(P)P.textContent='۰';
    return;
  }

  let a=0;
  let p=0;

  try{
    a=Number(areaM(points))||0;
    p=Number(perimeter(points))||0;
  }catch(e){
    console.error('measurement error',e);
  }

  if(A)A.textContent=Math.round(a).toLocaleString('fa-IR');
  if(H)H.textContent=(a/10000).toFixed(4);
  if(P)P.textContent=Math.round(p).toLocaleString('fa-IR');
                     }


/* ===== PROFESSIONAL KESHAVAR-YAR V2 ===== */
const YAR_CHAT_KEY='yk-yar-offline-chat-v1';
let yarMessages=(()=>{try{const a=JSON.parse(localStorage.getItem(YAR_CHAT_KEY)||'[]');return Array.isArray(a)?a.filter(m=>!(m&&m.role==='bot'&&typeof m.text==='string'&&m.text.includes('سؤال را آزادانه بپرس'))):[]}catch(e){return[]}})();
let yarPhotoData=null, yarPhotoName='';
try{
  const _yc=JSON.parse(localStorage.getItem(YAR_CHAT_KEY)||'[]');
  const _clean=[];
  for(const _m of Array.isArray(_yc)?_yc:[]){const _last=_clean[_clean.length-1];if(_last&&_last.role===_m.role&&String(_last.text||'')===String(_m.text||'')&&!_m.image&&!_last.image)continue;_clean.push(_m)}
  localStorage.setItem(YAR_CHAT_KEY,JSON.stringify(_clean.slice(-60)));
  yarMessages=_clean.slice(-60);
}catch(e){}
let yarLandMode=false;
const YAR_AI_ENDPOINT='';



















async 
  async 
async 























document.getElementById('backup').onclick=backup;document.getElementById('restore').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{state={...base,...JSON.parse(r.result)};save();go('home')}catch{toast('فایل پشتیبان نامعتبر است')}};r.readAsText(f)}
document.addEventListener('click',e=>{let b=e.target.closest('[data-r]');if(b)go(b.dataset.r)});
document.getElementById('restore').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{state={...base,...JSON.parse(r.result)};save();toast('پشتیبان بازیابی شد');go('home')}catch{toast('فایل پشتیبان معتبر نیست')}};r.readAsText(f)};
window.go=go;window.openLand=openLand;window.weatherFor=weatherFor;window.editLand=editLand;go('home');

// Offline-first: cache the application shell when the browser supports service workers.
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
