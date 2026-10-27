// All calculated fields live in enriched copies. The original decoded payload is retained.
export type Scope={event?:string;player?:string;round?:number};
export type MotionOptions={coordinateUnit?:'unknown'|'m'|'ft'|'yd';confirmPutt?:boolean;motionStartSeconds?:number;motionEndSeconds?:number;path?:{x:number;y:number;timeSeconds:number}[]};
export const numberValue=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const factor={m:1,ft:0.3048,yd:0.9144,unknown:0};
export function eventTiming(video:any){
 const valid=(v:unknown)=>numberValue(v)&&v>=0&&v<=8640000000000000;
 const start=valid(video?.startsAt)?video.startsAt:null,end=valid(video?.endsAt)?video.endsAt:null;
 const positive=start!==null&&end!==null&&end>start;
 return {'video-availability-start-utc':start===null?null:new Date(start).toISOString(),'video-availability-end-utc':end===null?null:new Date(end).toISOString(),'video-availability-seconds':positive?(end-start)/1000:null,'video-duration-seconds':numberValue(video?.duration)&&video.duration>0?video.duration:null};
}
// Live videos expose a short tournamentId and the canonical contentTournamentId.
export function videoEventId(v:any){
 if(typeof v?.contentTournamentId==='string'&&/^R\d{7}$/.test(v.contentTournamentId))return v.contentTournamentId;
 if(typeof v?.tournamentId==='string'&&/^R\d{7}$/.test(v.tournamentId))return v.tournamentId;
 if(/^\d{4}$/.test(String(v?.year))&&/^\d{1,3}$/.test(String(v?.tournamentId))&&['R','PGATOUR'].includes(v?.tourCode))return `R${v.year}${String(v.tournamentId).padStart(3,'0')}`;
 return null;
}
export function isPutt(stroke:any,options:MotionOptions={}){return /putt/i.test(String(stroke?.strokeType??''))||(options.confirmPutt===true&&String(stroke?.strokeType).toUpperCase()==='STROKE');}
export function puttCandidate(stroke:any){return /putt/i.test(String(stroke?.strokeType??''))||(String(stroke?.strokeType).toUpperCase()==='STROKE'&&(/green/i.test(String(stroke?.fromLocation??''))||stroke?.fromLocationCode==='OGR'));}
export function matchVideos(videos:any[],scope:Scope,hole:number,stroke:number){
 if(!scope.event||!scope.player||!scope.round)return [];
 return videos.filter(v=>v&&videoEventId(v)===scope.event&&Number(v.roundNumber)===Number(scope.round)&&Number(v.holeNumber)===Number(hole)&&Number(v.shotNumber)===Number(stroke)&&(!Array.isArray(v.playerVideos)||!v.playerVideos.length||v.playerVideos.some((p:any)=>String(p.id)===scope.player)));
}
export function analyzePutt(stroke:any,options:MotionOptions={},video:any=null){
 const empty={coordinateUnit:options.coordinateUnit??'unknown',straightLineDistanceMeters:null as number|null,pathDistanceMeters:null as number|null,motionDurationSeconds:null as number|null,averageSpeedMps:null as number|null,averageSpeedMph:null as number|null,averageSpeedFps:null as number|null,speedBasis:null as string|null,segmentSpeeds:[] as {startSeconds:number;endSeconds:number;speedMps:number}[],provenance:'calculated from explicitly scaled coordinates and ball-motion timing; manual annotations where supplied'};
 if(!isPutt(stroke,options))return {...empty,status:puttCandidate(stroke)?'putt-confirmation-required':'not-a-putt'};
 const unit=options.coordinateUnit??'unknown';
 if(!Object.hasOwn(factor,unit)||!factor[unit])return {...empty,status:'coordinate-unit-required'};
 const scale=factor[unit],coords=stroke?.overview?.leftToRightCoords;
 const good=(p:any)=>p&&numberValue(p.x)&&numberValue(p.y);
 // Live normalized x/y locate pixels on the map. Use native TOURCAST coordinates when present.
 const from=coords?.fromCoords,to=coords?.toCoords;
 const native=from?.tourcastX!==undefined||to?.tourcastX!==undefined;
 const a=native?{x:from?.tourcastX,y:from?.tourcastY}:from,b=native?{x:to?.tourcastX,y:to?.tourcastY}:to;
 if(!good(a)||!good(b))return {...empty,status:'coordinates-unavailable'};
 const straight=Math.hypot(b.x-a.x,b.y-a.y)*scale;
 const base={...empty,straightLineDistanceMeters:straight};
 let duration:number|null=null,distance=straight,basis='straight-line lower-bound average speed (break not captured)';
 if(options.path!==undefined){
  const path=options.path;
  if(!Array.isArray(path)||path.length<2||path.length>10000||!path.every(p=>good(p)&&numberValue(p.timeSeconds)&&p.timeSeconds>=0))return {...base,status:'invalid-timed-path'};
  // A path must describe this shot and include its start/end; do not silently reorder samples.
  if(Math.hypot(path[0].x-a.x,path[0].y-a.y)>1e-6||Math.hypot(path.at(-1)!.x-b.x,path.at(-1)!.y-b.y)>1e-6)return {...base,status:'path-endpoints-do-not-match-shot'};
  let length=0;
  const segments=[];
  for(let i=1;i<path.length;i++){
   const dt=path[i].timeSeconds-path[i-1].timeSeconds;
   if(dt<=0)return {...base,status:'path-times-must-increase'};
   const d=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y)*scale;length+=d;
   segments.push({startSeconds:path[i-1].timeSeconds,endSeconds:path[i].timeSeconds,speedMps:d/dt});
  }
  duration=path.at(-1)!.timeSeconds-path[0].timeSeconds;distance=length;
  base.pathDistanceMeters=length;base.segmentSpeeds=segments;basis='sampled 2D path average speed';
  const window=eventTiming(video)['video-duration-seconds'];
  if(window!==null&&path.at(-1)!.timeSeconds>window)return {...base,status:'motion-outside-video-duration'};
 }else{
  const start=options.motionStartSeconds,end=options.motionEndSeconds;
  if(start===undefined&&end===undefined)return {...base,status:'ball-motion-timing-required'};
  if(!numberValue(start)||!numberValue(end)||start<0||end<=start)return {...base,status:'invalid-ball-motion-timing'};
  const window=eventTiming(video)['video-duration-seconds'];
  if(window!==null&&end>window)return {...base,status:'motion-outside-video-duration'};
  duration=end-start;
 }
 const speed=distance/duration;
 if(!Number.isFinite(speed))return {...base,status:'invalid-speed'};
 return {...base,status:'calculated',motionDurationSeconds:duration,averageSpeedMps:speed,averageSpeedMph:speed/0.44704,averageSpeedFps:speed/0.3048,speedBasis:basis};
}
export function enrichShots(decoded:any,videos:any[]=[],scope:Scope={},annotations:Record<string,MotionOptions>={}){
 if(!Array.isArray(decoded?.holes))throw Error('Expected decoded.holes.');
 return {...decoded,holes:decoded.holes.map((h:any)=>({...h,strokes:(Array.isArray(h.strokes)?h.strokes:[]).map((s:any)=>{
  const matches=matchVideos(videos,scope,h.holeNumber,s.strokeNumber),video=matches.length===1?matches[0]:null;
  const annotation=annotations[`${h.holeNumber}:${s.strokeNumber}`]??{};
  const analysis=analyzePutt(s,annotation,video);
  const start=analysis.status==='calculated'?(annotation.path?annotation.path[0].timeSeconds:annotation.motionStartSeconds):null;
  const end=analysis.status==='calculated'?(annotation.path?annotation.path.at(-1)!.timeSeconds:annotation.motionEndSeconds):null;
  return {...s,...eventTiming(video),'start-time-event':start,'end-time-event':end,'time-total-event':analysis.motionDurationSeconds,'event-time-unit':'seconds','event-time-basis':start===null?'unavailable: source has no verified shot-event timing':'annotated ball-motion offsets from clip/timeline start; not UTC',tourcastShotVideo:{status:matches.length>1?'ambiguous':video?'matched':'not-available',matches,association:'event/player-request-scope/round/hole/stroke'},puttAnalysis:analysis,motionAnnotation:annotation};
 })}))};
}
