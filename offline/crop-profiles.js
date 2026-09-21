// YarKeshavarz Crop Profiles V4
// Detailed profiles can be layered later; universal registry is always available.
import universal, {findRegisteredCrop} from "./universal-crop-engine.js";

const profiles={...universal};

export function findCropProfile(name=""){
  return findRegisteredCrop(name)?.profile||null;
}
export function listCropProfiles(){return Object.keys(profiles);}
export function profileFields(profile){
  if(!profile)return[];
  return Object.entries(profile).filter(([k])=>![
    "aliases","category","scientificName","summary","sources"
  ].includes(k));
}
export {profiles};
export default profiles;
