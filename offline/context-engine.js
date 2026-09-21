// YarKeshavarz Offline V2 - Conversation Context
const KEY="yk-offline-context-v2",MAX=8;
function clean(x=""){return String(x).trim().slice(0,1200);}
export function getContext(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x.slice(-MAX):[]}catch{return[]}}
export function remember(role,text,entities={}){const d=getContext();d.push({role,text:clean(text),entities,ts:Date.now()});localStorage.setItem(KEY,JSON.stringify(d.slice(-MAX)));}
export function clearContext(){localStorage.removeItem(KEY);}
export function lastCrop(){const d=getContext();for(let i=d.length-1;i>=0;i--)if(d[i]?.entities?.crop?.crop)return d[i].entities.crop.crop;return null;}
export function contextHint(entities={}){if(entities.crop?.crop)return entities;const c=lastCrop();return c?{...entities,crop:{crop:c,matched:"از حافظه گفتگو",score:1}}:entities;}
export default {getContext,remember,clearContext,lastCrop,contextHint};
