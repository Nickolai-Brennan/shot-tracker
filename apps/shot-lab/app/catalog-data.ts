export type EventOption={id:string;name:string;season:number;date:string;status:string;source:string};
export type Participant={id:string;name:string;status:string;kind:string;rounds:number[]};
export function scheduleEvents(data:any,season:number):EventOption[]{
 const values=Array.isArray(data?.tournaments)?data.tournaments:[];
 const seen=new Set();
 return values.filter((v:any)=>typeof v?.tournamentId==='string'&&new RegExp(`^R${season}\\d{3}$`).test(v.tournamentId)&&!seen.has(v.tournamentId)&&seen.add(v.tournamentId)).map((v:any)=>({id:v.tournamentId,name:v.name||v.tournamentId,season,date:String(v.displayDate??''),status:String(v.status??''),source:'PGA schedule'}));
}
export function eventParticipants(field:any,leaderboard:any):Participant[]{
 const map=new Map<string,Participant>();
 function add(p:any,kind:string,status:string,rounds:number[]=[]){
  if(!/^\d{1,10}$/.test(String(p?.id)))return;
  const id=String(p.id),old=map.get(id),full=[p.firstName,p.lastName].filter(Boolean).join(' ');
  const name=full||p.displayName||p.shortName||old?.name||id;
  map.set(id,{id,name,status:status||old?.status||'',kind,rounds:rounds.length?rounds:old?.rounds??[]});
 }
 for(const p of field?.alternates??[])add(p,'alternate',p.status||'Alternate');
 for(const p of field?.players??[])add(p,p.withdrawn?'withdrawn':'field',p.status||'In field');
 for(const entry of leaderboard?.players??[]){
  const s=entry.scoringData??{};
  const rounds=(s.rounds??[]).flatMap((r:any,i:number)=>{
   const val=typeof r==='object'&&r!==null?(r.strokes??r.score??r.total):r;
   return val!==null&&val!==undefined&&val!==''&&val!=='-'&&val!=='—'?[typeof r==='object'?Number(r.roundNumber??i+1):i+1]:[];
  }).filter((v:number)=>Number.isInteger(v)&&v>=1&&v<=4);
  add(entry.player,'leaderboard',s.playerState||s.position||'Recorded participant',rounds);
 }
 return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
