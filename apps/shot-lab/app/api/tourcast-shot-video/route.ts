import {verifyContext} from '../../../lib/verification';
import {fetchVideos,validRequest,VideoRequest} from './client';
export async function POST(request:Request){
 let input:VideoRequest;try{input=await request.json() as VideoRequest;}catch{return Response.json({error:'Send a valid JSON request.'},{status:400});}
 if(!input||!validRequest(input))return Response.json({error:'Choose valid event, player, round, and optional hole/shot numbers.'},{status:400});
 const key=process.env.PGA_API_KEY;if(!key)return Response.json({error:'PGA API key is not configured.'},{status:503});
 try{const [data,verification]=await Promise.all([fetchVideos(input,key),verifyContext(input)]);return Response.json({...data,verification,meta:{...input,retrievedAt:new Date().toISOString(),timestampUnit:'epoch milliseconds',timingBasis:'video availability, not shot time or ball motion'}},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to load TOURCAST video metadata.'},{status:502});}
}
