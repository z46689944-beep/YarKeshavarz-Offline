// YarKeshavarz Offline V2 - Intent Engine
const INTENTS=[
["definition",["چیست","چیه","معنی","تعریف","یعنی"]],
["irrigation",["آبیاری","آب","کم آبی","خشکی","آبدهی"]],
["fertilizer",["کود","کوددهی","تغذیه","اوره","ازت","نیتروژن","فسفر","پتاس"]],
["soil",["خاک","پی اچ","ph","ec خاک","شوری خاک","زهکشی","ماده آلی","رس","شن"]],
["pest",["آفت","شته","کنه","سفیدبالک","کرم","سوسک","مگس","تریپس"]],
["disease",["بیماری","قارچ","باکتری","ویروس","پوسیدگی","لکه","سفیدک","زنگ","پژمردگی"]],
["weed",["علف هرز","علف","هرز","علفکش"]],
["planting",["کاشت","بذر","نشا","جوانه","تراکم","فاصله کاشت","تاریخ کاشت"]],
["pruning",["هرس","پیوند","پایه"]],
["harvest",["برداشت","رسیدگی","بلوغ","زمان برداشت"]],
["greenhouse",["گلخانه","هیدروپونیک","کوکوپیت","پرلیت","تهویه"]],
["economics",["هزینه","درآمد","سود","اقتصاد","قیمت","سرمایه","نقطه سربه سر"]],
["machinery",["تراکتور","سمپاش","دروگر","کمباین","ادوات","ماشین"]],
["storage",["انبار","ذخیره","سردخانه","بسته بندی","پس از برداشت"]],
["livestock",["دام","گاو","گوسفند","بز","مرغ","طیور","گله","جیره"]],
["beekeeping",["زنبور","کندو","ملکه","عسل","زنبورداری"]],
["climate",["هوا","دما","یخبندان","گرما","سرما","بارندگی","رطوبت","خشکسالی"]],
["farm_management",["مزرعه","زمین","قطعه","مدیریت مزرعه","برنامه کشت","ثبت عملیات"]],
["precision_agriculture",["کشاورزی دقیق","gps","پهپاد","ماهواره","نقشه","سنجش از دور"]]
];
const CROP_ALIASES={
"گوجه":["گوجه فرنگی","گوجه‌فرنگی"],
"بادام":["بادام درختی"],
"انگور":["مو","تاک"],
"سیب زمینی":["سیب‌زمینی"],
"فلفل":["فلفل دلمه"],
"ذرت":["ذرت دانه ای","ذرت علوفه ای"]
};
function normalize(t=""){return String(t).toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
function exactWord(text,word){
 const a=normalize(text).split(" ").filter(Boolean),b=normalize(word).split(" ").filter(Boolean);
 if(!b.length)return false;
 if(b.length===1)return a.includes(b[0]);
 for(let i=0;i<=a.length-b.length;i++){let ok=true;for(let j=0;j<b.length;j++)if(a[i+j]!==b[j]){ok=false;break;}if(ok)return true;}
 return false;
}
export function detectIntent(text=""){
 const q=normalize(text);
 const s=INTENTS.map(([id,words])=>({id,score:words.reduce((n,w)=>n+(exactWord(q,w)?2:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 return s[0]||{id:"general",score:0};
}
export function detectCrop(text=""){
 const q=normalize(text),hits=[];
 for(const [name,aliases] of Object.entries(CROP_ALIASES)){
  for(const alias of [name,...aliases])if(exactWord(q,alias)){hits.push({crop:name,matched:alias,score:alias===name?10:8});break;}
 }
 return hits.sort((a,b)=>b.score-a.score)[0]||null;
}
export function extractEntities(text=""){return {crop:detectCrop(text),intent:detectIntent(text)};}
export default {detectIntent,detectCrop,extractEntities};
