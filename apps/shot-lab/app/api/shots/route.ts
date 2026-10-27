import { query } from './query';
import {fetchVideos} from '../tourcast-shot-video/client';
import {enrichShots} from '../../shot-video';
import {pgaQuery,decodePayload} from '../../../lib/pga';
import {scorecardQuery} from '../../../lib/scorecardQuery';
import {roundScorecard,trackingSummary} from '../../scoring';
import {verifyShotRequest} from '../../../lib/verification';

// Send the secret only to the fixed PGA endpoint; never accept a caller-supplied URL.
export async function POST(request: Request) {
  try {
    const {event, player, round, radar, includeVideos, eventName} = await request.json() as {event:string;player:string;round:number;radar:boolean;includeVideos?:boolean;eventName?:string};
    if (!/^R\d{7}$/.test(event) || !/^\d{1,10}$/.test(player) || !Number.isInteger(round) || round < 1 || round > 4) {
      return Response.json({error:'Choose a valid event, player, and round.'}, {status:400});
    }
    const key = process.env.PGA_API_KEY;
    if (!key) return Response.json({error:'PGA API key has not been configured.'}, {status:503});
    // Video failure does not discard successfully retrieved shots.
    const videoPromise=includeVideos===true?fetchVideos({event,player,round},key).then(data=>({...data,warning:null as string|null})).catch(e=>({videos:[],envelope:null,warning:e instanceof Error?e.message:'Video lookup failed.'})):Promise.resolve({videos:[],envelope:null,warning:null});
    const scorecardPromise=pgaQuery(scorecardQuery,'ScorecardCompressedV3',{tournamentId:event,playerId:player}).then(async envelope=>({envelope,decoded:await decodePayload(envelope.data?.scorecardCompressedV3?.payload),warning:null as string|null})).catch(()=>({envelope:null,decoded:null,warning:'Official scorecard unavailable; tracking counts must not be used as scoring.'}));
    const upstream = await fetch('https://orchestrator.pgatour.com/graphql', {
      method:'POST', headers:{'Content-Type':'application/json','x-api-key':key,'x-pgat-platform':'web','Origin':'https://www.pgatour.com','Referer':'https://www.pgatour.com/'},
      body:JSON.stringify({query, operationName:'shotDetailsV4Compressed',variables:{tournamentId:event,playerId:player,round,includeRadar:!!radar}}),
      signal:AbortSignal.timeout(25000)
    });
    if (!upstream.ok) return Response.json({error:upstream.status === 403 ? 'PGA TOUR refused this request (HTTP 403). The key is configured, but live access is blocked. You can still import a saved JSON response.' : `PGA TOUR returned HTTP ${upstream.status}. Try again later.`,upstreamStatus:upstream.status},{status:502});
    const envelope = await upstream.json() as any;
    if (envelope.errors?.length) return Response.json({error:'PGA TOUR returned a GraphQL error. Verify event, player, round, and source availability.'},{status:502});
    const payload = envelope.data?.shotDetailsV4Compressed?.payload;
    let decoded:any = {holes:[]};
    if (payload) {
      // Decode the full payload to preserve radar and fields omitted by the Python wrapper.
      const bytes = Uint8Array.from(atob(payload), c=>c.charCodeAt(0));
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      decoded = JSON.parse(await new Response(stream).text());
    }
    const [videoData,scorecardData]=await Promise.all([videoPromise,scorecardPromise]);
    if(scorecardData.decoded?.id&&scorecardData.decoded.id!==`${event}-${player}`){scorecardData.decoded=null;scorecardData.warning='Scorecard response identity did not match the requested event/player.';}
    const scorecard=roundScorecard(scorecardData.decoded,round);
    if((decoded.tournamentId&&decoded.tournamentId!==event)||(decoded.playerId&&String(decoded.playerId)!==player)||(decoded.round&&Number(decoded.round)!==round))return Response.json({error:'The upstream shot response does not match the requested event/player/round.'},{status:502});
    const tracking=trackingSummary(decoded,scorecard);
    const verification=await verifyShotRequest({event,player,round,eventName:typeof eventName==='string'?eventName.slice(0,200):undefined},decoded,scorecardData.decoded);
    const meta={event,player,round,retrievedAt:new Date().toISOString(),radarRequested:!!radar,videosRequested:includeVideos===true};
    const enrichedDecoded=enrichShots(decoded,videoData.videos,meta);
    return Response.json({decoded,enrichedDecoded,envelope,videos:videoData.videos,videoEnvelope:videoData.envelope,verification,scorecard,scorecardEnvelope:scorecardData.envelope,scorecardDecoded:scorecardData.decoded,tracking,warnings:[videoData.warning,scorecardData.warning,...scorecard.issues,...tracking.issues].filter(Boolean),meta},{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    const timeout = error instanceof Error && ['TimeoutError','AbortError'].includes(error.name);
    return Response.json({error:timeout?'The PGA request timed out. Please retry.':'Unable to retrieve or decode PGA data. Try again or import a saved JSON file.'},{status:502});
  }
}
