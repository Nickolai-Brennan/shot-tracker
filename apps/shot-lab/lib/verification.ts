import lookups from '../app/lookups.json';
import {pgaQuery,decodePayload} from './pga';
import {leaderboardQuery} from './leaderboardQuery';
import {scorecardQuery} from './scorecardQuery';
import {query} from '../app/api/shots/query';
import {roundScorecard,scoreNumber} from '../app/scoring';
type Check={label:string;actual:unknown;expected:unknown;status:string};
const compare=(label:string,actual:unknown,expected:unknown):Check=>({label,actual,expected,status:actual===null||actual===undefined||expected===null||expected===undefined?'unavailable':String(actual)===String(expected)?'passed':'mismatch'});
export function scoreChecks(decoded:any,card:any,round:number,entry:any){
 const selected=roundScorecard(card,round),rounds=(card?.roundScores??[]).map((r:any)=>roundScorecard(card,Number(r.roundNumber)));
 const completed=rounds.filter((r:any)=>r.total!==null);
 const sum=completed.length&&completed.length===rounds.length?completed.reduce((n:number,r:any)=>n+r.total,0):null;
 const scoring=entry?.scoringData??{};
 const rawRound=scoring.rounds?.[round-1];
 const leaderboardRound=scoreNumber(typeof rawRound==='object'&&rawRound!==null?(rawRound.strokes??rawRound.score??rawRound.total):rawRound);
 const checks=[compare('Event total strokes',sum,scoreNumber(scoring.totalStrokes)),compare(`Round ${round} total`,selected.total,leaderboardRound)];
 const available=selected.holes.filter((h:any)=>h.score!==null).sort((a:any,b:any)=>a.hole-b.hole);
 const picks=available.length>=2?[available[0],available.at(-1)!]:available;
 for(const h of picks){const tracking=decoded?.holes?.find((v:any)=>Number(v.holeNumber)===h.hole);checks.push(compare(`Hole ${h.hole} score`,scoreNumber(tracking?.score),h.score));}
 while(checks.length<4)checks.push(compare('Hole score · not yet available',null,null));
 return checks;
}
export function officialPageUrl(event:string,name:string){
 const slug=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return slug?`https://www.pgatour.com/tournaments/${event.slice(1,5)}/${slug}/${event}/leaderboard`:null;
}
export async function openOfficialPage(event:string,name:string){
 const url=officialPageUrl(event,name);
 if(!url)return {url:null,status:'unavailable: event page name not supplied',readable:false,embeddedLeaderboard:null as any};
 try{
  const response=await fetch(url,{headers:{Accept:'text/html'},redirect:'follow',signal:AbortSignal.timeout(10000)});
  if(!response.ok)return {url,status:`unavailable: HTTP ${response.status}`,readable:false,embeddedLeaderboard:null};
  const html=await response.text();
  if(!html.includes(event))return {url,status:'unavailable: page event identity not confirmed',readable:false,embeddedLeaderboard:null};
  // Only use structured embedded page data. Never compare numbers scraped without player context.
  const match=html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  let embeddedLeaderboard:any=null;
  if(match){
   try{const walk=async(node:any):Promise<void>=>{if(!node||typeof node!=='object')return;if(Array.isArray(node.players)&&node.players.some((p:any)=>p?.player?.id&&p?.scoringData))embeddedLeaderboard=node;for(const [key,v] of Object.entries(node)){if(key==='leaderboardCompressedV3'&&(v as any)?.payload)try{embeddedLeaderboard=await decodePayload((v as any).payload);}catch{}else if(v&&typeof v==='object')await walk(v);}};await walk(JSON.parse(match[1]));}catch{}
  }
  if(embeddedLeaderboard?.id!==event)embeddedLeaderboard=null;
  return {url:response.url||url,status:embeddedLeaderboard?'opened: embedded leaderboard located':'opened: scores require client-side loading',readable:true,embeddedLeaderboard};
 }catch{return {url,status:'unavailable: page request failed or timed out',readable:false,embeddedLeaderboard:null};}
}
export async function verifyShotRequest(input:{event:string;player:string;round:number;eventName?:string},decoded:any,card:any){
 const [pageResult,boardResult]=await Promise.allSettled([
  openOfficialPage(input.event,input.eventName??lookups.events.find(e=>e['event-id']===input.event)?.EVENT??''),
  pgaQuery(leaderboardQuery,'LeaderboardCompressedV3',{leaderboardCompressedV3Id:input.event}).then(e=>decodePayload(e.data?.leaderboardCompressedV3?.payload))
 ]);
 const page=pageResult.status==='fulfilled'?pageResult.value:{url:null,status:'unavailable',readable:false,embeddedLeaderboard:null};
 const board=boardResult.status==='fulfilled'?boardResult.value:null;
 const identityMismatch=board?.id&&board.id!==input.event;
 const entry=identityMismatch?null:board?.players?.find((p:any)=>String(p.player?.id)===input.player);
 const checks=scoreChecks(decoded,card,input.round,entry);
 if(identityMismatch)checks.unshift({label:'Leaderboard event identity',actual:board.id,expected:input.event,status:'mismatch'});
 if(board&&!entry)checks.unshift({label:'Event participation',actual:input.player,expected:'Player in event leaderboard',status:'mismatch'});
 let pageVerified=false;
 if(page.embeddedLeaderboard){
  const p=page.embeddedLeaderboard.players?.find((p:any)=>String(p.player?.id)===input.player);
  const c=compare('Event page player total',p?.scoringData?.totalStrokes??null,entry?.scoringData?.totalStrokes??null);checks.push(c);pageVerified=c.status==='passed';
 }
 const mismatch=checks.some(c=>c.status==='mismatch'),allChecks=checks.every(c=>c.status==='passed');
 const status=mismatch?'Mismatch':allChecks&&pageVerified?'Passed':'Unable to fully verify';
 return {status,checkedAt:new Date().toISOString(),scope:{event:input.event,player:input.player,round:input.round},checks,page:{url:page.url,status:page.status},apiChecks:allChecks?'passed':mismatch?'mismatch':'incomplete',summary:mismatch?'Scoring sources disagree. Review the checks before using this dataset.':allChecks?'API checks agree for event total, round total and two hole scores. '+(pageVerified?'The event page total also agrees.':'Event-page verification is unavailable or incomplete; this is not a full pass.'):'One or more required scoring values are unavailable. No full verification pass was issued.',reference:'PGA leaderboard + scorecard; page confirmation when structured page data is accessible'};
}

// Requests without an event/player/round cannot honestly verify scoring.
export const noScoreContext={status:'Not applicable',summary:'This request has no selected event/player/round score to verify.'};
export async function verifyContext(input:{event:string;player:string;round:number;eventName?:string}){
 const [shotResult,cardResult]=await Promise.allSettled([
  pgaQuery(query,'shotDetailsV4Compressed',{tournamentId:input.event,playerId:input.player,round:input.round,includeRadar:false}).then(e=>decodePayload(e.data?.shotDetailsV4Compressed?.payload)),
  pgaQuery(scorecardQuery,'ScorecardCompressedV3',{tournamentId:input.event,playerId:input.player}).then(e=>decodePayload(e.data?.scorecardCompressedV3?.payload))
 ]);
 return verifyShotRequest(input,shotResult.status==='fulfilled'?shotResult.value:null,cardResult.status==='fulfilled'?cardResult.value:null);
}
