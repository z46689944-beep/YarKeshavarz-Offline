// YarKeshavarz Offline Global Brain V1 - safe context
const KEY="yk-offline-context-v3",MAX=10;
function clean(x=""){return String(x).trim().slice(0,1200);}
export function getContext(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x.slice(-MAX):[]}catch{return[]}}
export function remember(role,text,entities={}){const d=getContext();d.push({role,text:clean(text),entities,ts:Date.now()});localStorage.setItem(KEY,JSON.stringify(d.slice(-MAX)));}
export function clearContext(){localStorage.removeItem(KEY);}
export function lastCrop(){const d=getContext();for(let i=d.length-1;i>=0;i--)if(d[i]?.entities?.crop?.crop)return d[i].entities.crop.crop;return null;}
const refs=["همین محصول","این محصول","این گیاه","همین گیاه","این درخت","همین درخت","همین","این مورد","آبیاریش","کودش","بیماریش","آفتش","هرسش","برداشتش"];
function norm(t=""){return String(t).toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
export function shouldUseMemory(question=""){const q=norm(question);return refs.some(r=>q.includes(norm(r)));}
export function contextHint(entities={},question=""){if(entities.crop?.crop)return entities;if(!shouldUseMemory(question))return entities;const c=lastCrop();return c?{...entities,crop:{crop:c,matched:"از حافظه گفتگو",score:1},fromMemory:true}:entities;}
export default {getContext,remember,clearContext,lastCrop,shouldUseMemory,contextHint};
