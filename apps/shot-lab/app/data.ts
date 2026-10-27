export type Shot = Record<string, unknown>;
// Keep nested objects as named fields; preserve arrays as JSON for lossless CSV cells.
export function flatten(value:Record<string,any>, prefix='', out:Shot={}):Shot {
  for(const [key,v] of Object.entries(value)) {
    const name=prefix?`${prefix}.${key}`:key;
    if(v && typeof v==='object' && !Array.isArray(v)) flatten(v,name,out);
    else out[name]=Array.isArray(v)?JSON.stringify(v):v;
  }
  return out;
}
export function shotRows(decoded:any,meta:any={}):Shot[]{
  if(!decoded || !Array.isArray(decoded.holes)) throw Error('Expected decoded PGA JSON with a holes array, or an app export containing decoded.holes.');
  return decoded.holes.flatMap((h:any)=>(Array.isArray(h.strokes)?h.strokes:[]).filter((s:any)=>s&&typeof s==='object').map((s:any)=>({...flatten(s),hole_number:h.holeNumber,par:h.par,hole_score:h.score,tournament_id:meta.event,player_id:meta.player,round_number:meta.round,retrieved_at_utc:meta.retrievedAt})));
}
export function csvText(rows:Shot[]){
  const fields=Array.from(new Set(rows.flatMap(Object.keys)));
  // Prevent spreadsheet formulas in strings while leaving numeric values unchanged.
  const cell=(v:unknown)=>{let s=v==null?'':String(v);if(typeof v==='string'&&/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
  return [fields.map(cell).join(','),...rows.map(r=>fields.map(k=>cell(r[k])).join(','))].join('\r\n');
}
