import {noScoreContext} from '../../../lib/verification';
import {pgaQuery,decodePayload} from '../../../lib/pga';
import {fieldQuery} from '../../../lib/fieldQuery';
import {leaderboardQuery} from '../../../lib/leaderboardQuery';
import {eventParticipants} from '../../catalog-data';
export async function GET(request:Request){
 const event=new URL(request.url).searchParams.get('event')??'';
 if(!/^R\d{7}$/.test(event))return Response.json({error:'Choose a valid event.'},{status:400});
 const results=await Promise.allSettled([
  pgaQuery(fieldQuery,'Field',{fieldId:event,includeWithdrawn:true,changesOnly:false}),
  pgaQuery(leaderboardQuery,'LeaderboardCompressedV3',{leaderboardCompressedV3Id:event}).then(async envelope=>({envelope,decoded:await decodePayload(envelope.data?.leaderboardCompressedV3?.payload)}))
 ]);
 let field=results[0].status==='fulfilled'?results[0].value.data?.field:null;
 let leaderboard=results[1].status==='fulfilled'?results[1].value.decoded:null;
 const warnings=results.flatMap((r,i)=>r.status==='rejected'?[`${i===0?'Field':'Leaderboard'} roster source is unavailable.`]:[]);
 if(field?.id&&field.id!==event){field=null;warnings.push('Field response event identity did not match the request.');}
 if(leaderboard?.id&&leaderboard.id!==event){leaderboard=null;warnings.push('Leaderboard response event identity did not match the request.');}
 const players=eventParticipants(field,leaderboard);
 if(!players.length&&warnings.length===2)return Response.json({error:'Unable to verify this event’s participants. Retry later.',warnings},{status:502});
 return Response.json({event,tournamentName:field?.tournamentName??leaderboard?.tournamentName??null,players,verification:noScoreContext,source:'Event field + leaderboard',warnings,retrievedAt:new Date().toISOString(),fieldEnvelope:results[0].status==='fulfilled'?results[0].value:null,leaderboardEnvelope:results[1].status==='fulfilled'?results[1].value.envelope:null,leaderboard},{headers:{'Cache-Control':'private, max-age=120'}});
}
