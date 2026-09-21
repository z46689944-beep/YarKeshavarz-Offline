// YarKeshavarz Crop Profiles V2
// Detailed profiles override universal profiles automatically.
import detailed from "./crop-profiles-detailed.js";
import universal from "./crop-profiles-universal.js";

const profiles={...universal,...detailed};

function normalize(t=""){
  return String(t).toLowerCase()
    .replace(/[يى]/g,"ی").replace(/ك/g,"ک")
    .replace(/\u200c/g," ")
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ").trim();
}

const aliases={};
for(const [name,p] of Object.entries(profiles)){
  aliases[normalize(name)]=name;
  for(const a of (p.aliases||[])) aliases[normalize(a)]=name;
}

export function findCropProfile(name=""){
  return profiles[aliases[normalize(name)]]||null;
}
export function listCropProfiles(){return Object.keys(profiles);}
export function profileFields(profile){
  if(!profile)return[];
  return Object.entries(profile).filter(([k])=>![
    "aliases","category","scientificName","summary","sources",
    "care","pests","diseases","risks","universalFallback"
  ].includes(k));
}
export {profiles};
export default profiles;
