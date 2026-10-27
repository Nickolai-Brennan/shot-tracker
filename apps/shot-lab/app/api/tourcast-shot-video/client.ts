import {videoQuery} from './query';
export type VideoRequest={event:string;player:string;round:number;hole?:number;shot?:number};
export function validRequest(v:VideoRequest){return /^R\d{7}$/.test(v.event)&&/^\d{1,10}$/.test(v.player)&&Number.isInteger(v.round)&&v.round>=1&&v.round<=4&&(v.hole===undefined||(Number.isInteger(v.hole)&&v.hole>=1&&v.hole<=18))&&(v.shot===undefined||(Number.isInteger(v.shot)&&v.shot>=1&&v.shot<=100));}
export async function fetchVideos(input:VideoRequest,key:string){
 const upstream=await fetch('https://orchestrator.pgatour.com/graphql',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'x-pgat-platform':'web','Origin':'https://www.pgatour.com','Referer':'https://www.pgatour.com/'},body:JSON.stringify({query:videoQuery,operationName:'TourcastVideos',variables:{tournamentId:input.event,playerId:input.player,round:input.round,...(input.hole===undefined?{}:{hole:input.hole}),...(input.shot===undefined?{}:{shot:input.shot})}}),signal:AbortSignal.timeout(25000)});
 if(!upstream.ok)throw Error(`TOURCAST video request returned HTTP ${upstream.status}.`);
 const envelope:any=await upstream.json();
 if(envelope.errors?.length)throw Error('TOURCAST video query returned a GraphQL error.');
 if(!Array.isArray(envelope.data?.tourcastVideos))throw Error('TOURCAST video response did not include a video array.');
 return {videos:envelope.data.tourcastVideos,envelope};
}
