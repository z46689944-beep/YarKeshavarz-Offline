import baseDB from "./agriculture-db-extended.js";
import brain from "./global-agriculture-brain.js";
import cropProfiles from "./crop-profiles.js";
import {extractEntities} from "./intent-engine.js";
import {remember,contextHint} from "./context-engine.js";

const KNOWLEDGE_KEY="yk-admin-knowledge-v1";

const SMALL_TALK = [
  "ممنون","مرسی","متشکرم","سپاس","سپاسگزارم","خیلی ممنون",
  "دمت گرم","دستت درد نکنه","خسته نباشی","عالی بود","ممنونم"
];

function isSmallTalk(q=""){
  const n=normalize(q);
  return SMALL_TALK.some(x=>n===normalize(x) || n.startsWith(normalize(x)+" "));
}

function smallTalkAnswer(q=""){
  const n=normalize(q);
  if(n.includes("ممنون") || n.includes("مرسی") || n.includes("متشکرم") || n.includes("سپاس"))
    return "خواهش می‌کنم داداش 🌱❤️ هر سؤال کشاورزی داشتی بپرس.";
  if(n.includes("عالی") || n.includes("دمت گرم"))
    return "قربانت داداش 🌱❤️ خوشحالم که به کارت اومد.";
  return "خواهش می‌کنم داداش 🌱🌾";
}

function normalize(t=""){
  return String(t).toLowerCase()
    .replace(/[يى]/g,"ی")
    .replace(/ك/g,"ک")
    .replace(/\u200c/g," ")
    .replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ")
    .trim();
}

const STOP=new Set([
  "چیست","چیه","چه","چگونه","چطور","چرا","کی","زمان","زمانی","است","هست","هستند",
  "دارد","دارند","شود","باید","برای","در","از","به","با","را","که","این","آن","یک",
  "و","یا","من","می","کنم","کنیم","کنید","مناسب","لازم","نیاز","پیشنهاد"
]);

function toks(t){
  return normalize(t).split(" ").filter(x=>x.length>1&&!STOP.has(x));
}

function contains(text,term){
  const a=normalize(text).split(" ").filter(Boolean);
  const b=normalize(term).split(" ").filter(Boolean);
  if(!b.length)return false;
  if(b.length===1)return a.includes(b[0]);
  for(let i=0;i<=a.length-b.length;i++){
    let ok=true;
    for(let j=0;j<b.length;j++){
      if(a[i+j]!==b[j]){ok=false;break;}
    }
    if(ok)return true;
  }
  return false;
}

function managerDB(){
  try{
    const d=JSON.parse(localStorage.getItem(KNOWLEDGE_KEY)||"[]");
    return Array.isArray(d)
      ? d.map(x=>({
          category:"مدیریت",
          topic:x.title||x.topic||"دانش مدیریت",
          keywords:x.keywords||[],
          general:x.answer||x.general||"",
          solution:x.solution||""
        }))
      : [];
  }catch{return[]}
}

function score(q,qt,item,e){
  let s=0;
  const topic=normalize(item.topic||"");
  if(topic&&q===topic)s+=45;
  if(topic&&contains(q,topic))s+=20;
  for(const t of toks(topic))if(qt.includes(t))s+=5;
  for(const raw of item.keywords||[]){
    const k=normalize(raw);
    if(contains(q,k))s+=k.includes(" ")?11:7;
  }
  if(e.crop?.crop&&contains(topic,e.crop.crop))s+=16;
  if(e.intent?.id&&normalize(item.category||"").includes(e.intent.id))s+=3;
  return s;
}

export function searchKnowledge(question){
  const q=normalize(question);
  const entities=extractEntities(q);
  const e=contextHint(entities,q);
  const db=[
    ...(Array.isArray(baseDB)?baseDB:[]),
    ...(brain.records||[]),
    ...managerDB()
  ];
  const ranked=db
    .map(item=>({item,score:score(q,toks(q),item,e)}))
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score);

  return {
    item:ranked[0]?.item||null,
    score:ranked[0]?.score||0,
    ranked:ranked.slice(0,3),
    entities:e
  };
}

function clarification(q,r){
  if(r.entities?.explicitCropLike&&!r.entities?.crop?.crop){
    return "🌱 محصول جدیدت را دیدم، اما هنوز آن محصول در دانش آفلاین من با اطمینان شناسایی نشده است. نام محصول را دقیق بنویس یا همراهش منطقه و مرحله رشد را بگو تا پاسخ عمومیِ امن بدهم؛ من محصول قبلی گفتگو را جایگزینش نمی‌کنم.";
  }
  return "🌱 برای این سؤال تطبیق مطمئن کافی پیدا نکردم. نام محصول، مشکل، مرحله رشد یا شرایط زمین را دقیق‌تر بنویس؛ مثلاً «گل محمدی، آبیاری تابستان» یا «گندم، برگ زرد».";
}

function list(value){
  if(!Array.isArray(value))return "";
  return value.map(x=>`• ${x}`).join("\n");
}

function profileAnswer(profile,e,question){
  const q=normalize(question);
  const intent=e.intent?.id||"general";
  let a=`🌱 ${Object.keys(cropProfiles).find(k=>cropProfiles[k]===profile)||"محصول"}\n\n`;
  if(profile.scientificName)a+=`🔬 نام علمی/گروه: ${profile.scientificName}\n\n`;
  if(profile.summary)a+=`📌 معرفی:\n${profile.summary}\n\n`;

  const section=(title,icon,fields)=>{
    let out=`${icon} ${title}\n`;
    let any=false;
    for(const [label,key] of fields){
      if(profile[key]){
        any=true;
        out+=`• ${label}: ${Array.isArray(profile[key])?list(profile[key]):profile[key]}\n`;
      }
    }
    return any?out+"\n":"";
  };

  // Definition/general question => full crop passport.
  if(intent==="definition" || intent==="general" || q===normalize(profile.aliases?.[0]||"")){
    a+=section("شرایط و اقلیم","🌤️",[
      ["اقلیم","climate"],["دما","temperature"],["فصل مناسب","season"],
      ["دوره رشد/رسیدگی","growthDays"]
    ]);
    a+=section("خاک","🌱",[
      ["خاک مناسب","soil"],["pH","ph"],["شوری/EC","ec"]
    ]);
    a+=section("کاشت","🌾",[
      ["روش تکثیر","propagation"],["روش و عمق کاشت","planting"]
    ]);
    a+=section("آبیاری","💧",[
      ["نیاز و مدیریت آب","irrigation"],["مراحل حساس","irrigationStages"]
    ]);
    a+=section("تغذیه و کود","🧪",[
      ["تغذیه","nutrition"],["راهنمای کود","fertilizer"]
    ]);
    a+=section("داشت","🌿",[
      ["عملیات مهم","care"]
    ]);
    a+=section("آفات","🐛",[
      ["آفات مهم","pests"]
    ]);
    a+=section("بیماری‌ها","🦠",[
      ["بیماری‌های مهم","diseases"]
    ]);
    a+=section("برداشت","🧺",[
      ["زمان/نشانه برداشت","harvest"]
    ]);
    a+=section("پس از برداشت و انبار","📦",[
      ["پس از برداشت","postHarvest"],["انبارداری","storage"]
    ]);
    a+=section("عملکرد و اقتصاد","💰",[
      ["عملکرد","yield"],["اقتصاد","economics"]
    ]);
    a+=section("ریسک‌های مهم","⚠️",[
      ["ریسک‌ها","risks"]
    ]);
  }else{
    // Targeted answer for follow-up questions.
    if(intent==="planting")a+=section("کاشت","🌾",[["فصل مناسب","season"],["دوره رشد/رسیدگی","growthDays"],["تکثیر","propagation"],["روش و عمق کاشت","planting"]]);
    else if(intent==="irrigation")a+=section("آبیاری","💧",[["مدیریت آب","irrigation"],["مراحل حساس","irrigationStages"]]);
    else if(intent==="fertilizer")a+=section("تغذیه و کود","🧪",[["تغذیه","nutrition"],["راهنمای کود","fertilizer"]]);
    else if(intent==="pest")a+=section("آفات","🐛",[["آفات مهم","pests"]]);
    else if(intent==="disease")a+=section("بیماری‌ها","🦠",[["بیماری‌های مهم","diseases"]]);
    else if(intent==="harvest")a+=section("برداشت و پس از برداشت","🧺",[["برداشت","harvest"],["پس از برداشت","postHarvest"],["انبارداری","storage"]]);
    else if(intent==="soil")a+=section("خاک و شرایط محیطی","🌱",[["خاک","soil"],["pH","ph"],["EC/شوری","ec"],["اقلیم","climate"]]);
    else a+=section("اطلاعات محصول","📋",[["اقلیم","climate"],["خاک","soil"],["کاشت","planting"],["آبیاری","irrigation"],["داشت","care"],["برداشت","harvest"]]);
  }

  a+="ℹ️ این شناسنامه، راهنمای پایه آفلاین است؛ تاریخ کاشت، مقدار آب، کود و سایر اعداد باید با رقم، منطقه، آزمون خاک/آب و شرایط واقعی مزرعه تطبیق داده شوند.";
  return a.trim();
}

export function findCropProfileAnswer(question,entities){
  const cropName=entities?.crop?.crop;
  if(!cropName)return null;
  const profile=
    cropProfiles[cropName] ||
    Object.entries(cropProfiles).find(([name,p])=>
      name===cropName || (p.aliases||[]).some(a=>normalize(a)===normalize(cropName))
    )?.[1];

  if(!profile)return null;
  return profileAnswer(profile,entities,question);
}

export function findOfflineAnswer(question=""){
  const q=normalize(question);
  if(!q)return "🌱 سؤال کشاورزی‌ات را بنوی.";
  if(isSmallTalk(q)) return smallTalkAnswer(q);
  if(!q)return "🌱 سؤال کشاورزی‌ات را بنویس.";

  const entities=extractEntities(q);
  const e=contextHint(entities,q);

  // Product profiles have priority for crop-specific questions.
  const prof=findCropProfileAnswer(q,e);
  if(prof){
    remember("user",question,e);
    remember("bot",prof,e);
    return prof;
  }

  const r=searchKnowledge(q);
  remember("user",question,r.entities);

  if(!r.item||r.score<7)return clarification(q,r);

  let a=`🌱 ${r.item.topic||"موضوع کشاورزی"}\n\n`;
  if(r.item.symptoms)a+=`🔎 نشانه‌ها:\n${r.item.symptoms}\n\n`;
  if(r.item.cause)a+=`⚠️ علت یا توضیح:\n${r.item.cause}\n\n`;
  if(r.item.general)a+=r.item.general+"\n\n";
  if(r.item.solution)a+=`✅ راهکار کلی:\n${r.item.solution}\n\n`;
  if(r.entities?.intent?.id==="irrigation")a+="💧 مقدار و زمان آبیاری به مرحله رشد، بافت خاک، رطوبت و کیفیت آب وابسته است.\n\n";
  if(r.entities?.intent?.id==="fertilizer")a+="🧪 نسخه دقیق کود بهتر است بر پایه آزمون خاک/برگ، کیفیت آب و نیاز مرحله رشد تنظیم شود.\n\n";
  a+="ℹ️ برای سموم و درمان‌های حساس، برچسب رسمی، قوانین محلی و نظر کارشناس را هم در نظر بگیر.";

  const answer=a.trim();
  remember("bot",answer,r.entities);
  return answer;
}

export default findOfflineAnswer;

if(typeof window!=="undefined"){
  window.YarKeshavarzOffline={
    ...(window.YarKeshavarzOffline||{}),
    findOfflineAnswer,
    searchKnowledge,
    findCropProfileAnswer
  };
}
