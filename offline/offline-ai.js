import agricultureDB from "./agriculture-db-extended.js";
import {extractEntities} from "./intent-engine.js";
import {remember,contextHint} from "./context-engine.js";

const KNOWLEDGE_KEY="yk-admin-knowledge-v1";
function normalize(t=""){return String(t).toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
const STOP=new Set(["چیست","چیه","چه","چگونه","چطور","چرا","کی","کِی","زمان","زمانی","است","هست","هستند","دارد","دارند","شود","باید","برای","در","از","به","با","را","که","این","آن","یک","و","یا","من","می","کنم","کنیم","کنید","مناسب","لازم","نیاز"]);
function tokens(t=""){return normalize(t).split(" ").filter(x=>x.length>1);}
function meaningful(t=""){return tokens(t).filter(x=>!STOP.has(x));}
function containsTerm(text,term){
 const a=normalize(text).split(" ").filter(Boolean),b=normalize(term).split(" ").filter(Boolean);
 if(!b.length)return false;if(b.length===1)return a.includes(b[0]);
 for(let i=0;i<=a.length-b.length;i++){let ok=true;for(let j=0;j<b.length;j++)if(a[i+j]!==b[j]){ok=false;break;}if(ok)return true;}return false;
}
function managerDB(){try{const d=JSON.parse(localStorage.getItem(KNOWLEDGE_KEY)||"[]");return Array.isArray(d)?d.map(x=>({category:"مدیریت",topic:x.title||x.topic||"دانش مدیریت",keywords:Array.isArray(x.keywords)?x.keywords:[],general:x.answer||x.general||"",solution:x.solution||""})):[]}catch{return[]}}
function score(q,qt,item,e){
 let s=0;const topic=normalize(item.topic||""),kws=Array.isArray(item.keywords)?item.keywords:[];
 if(topic&&q===topic)s+=40;if(topic&&containsTerm(q,topic))s+=18;
 for(const t of meaningful(topic))if(qt.includes(t))s+=6;
 for(const raw of kws){const k=normalize(raw);if(!k)continue;if(containsTerm(q,k))s+=k.includes(" ")?10:6;else for(const t of meaningful(k))if(qt.includes(t))s+=2;}
 if(e.crop?.crop&&containsTerm(topic,e.crop.crop))s+=12;
 const map={irrigation:"آبیاری",fertilizer:"تغذیه",soil:"خاک",pest:"آفات",disease:"بیماری",weed:"علف هرز",greenhouse:"گلخانه",machinery:"ماشین آلات",livestock:"دام و طیور",beekeeping:"زنبورداری",economics:"اقتصاد"};
 if(map[e.intent?.id]===item.category)s+=8;
 return s;
}
export function searchKnowledge(question){
 const q=normalize(question),qt=meaningful(q),e=contextHint(extractEntities(q)),db=[...agricultureDB,...managerDB()];
 let best=null,bestScore=0;for(const item of db){const sc=score(q,qt,item,e);if(sc>bestScore){bestScore=sc;best=item;}}
 return {item:best,score:bestScore,entities:e};
}
function buildAnswer(item,e){
 let a=`🌱 ${item.topic||"موضوع کشاورزی"}\n\n`;
 if(item.symptoms)a+=`🔎 نشانه‌ها:\n${item.symptoms}\n\n`;
 if(item.cause)a+=`⚠️ علت یا توضیح:\n${item.cause}\n\n`;
 if(item.general)a+=`${item.general}\n\n`;
 if(item.solution)a+=`✅ راهکار کلی:\n${item.solution}\n\n`;
 if(e.intent?.id==="irrigation")a+="💧 مقدار و زمان آبیاری باید با مرحله رشد، بافت خاک و رطوبت زمین تطبیق داده شود.\n\n";
 if(e.intent?.id==="fertilizer")a+="🧪 نسخه دقیق کود بهتر است بر پایه آزمون خاک/برگ و نیاز محصول تنظیم شود.\n\n";
 return (a+"ℹ️ برای تصمیم‌های حساس درباره سم، کود یا درمان، برچسب محصول، آزمون خاک/آب و نظر کارشناس محلی را هم در نظر بگیر.").trim();
}
export function findOfflineAnswer(question=""){
 const q=normalize(question);if(!q)return "🌱 سؤال کشاورزی‌ات را بنویس.";
 const r=searchKnowledge(q);remember("user",question,r.entities);
 if(!r.item||r.score<7)return "🌱 یار کشاورز آفلاین V2\n\nبرای این سؤال هنوز تطبیق مطمئن و کافی در پایگاه دانش پیدا نکردم.\n\nنام محصول، مشکل یا موضوع را دقیق‌تر بگو؛ مثلاً «بادام، برگ زرد» یا «گندم، زمان آبیاری».";
 const a=buildAnswer(r.item,r.entities);remember("bot",a,r.entities);return a;
}
export default findOfflineAnswer;
if(typeof window!=="undefined")window.YarKeshavarzOffline={findOfflineAnswer,searchKnowledge};
