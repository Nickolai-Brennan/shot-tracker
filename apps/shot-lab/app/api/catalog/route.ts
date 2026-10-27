import {noScoreContext} from '../../../lib/verification';
import {scheduleEvents} from '../../catalog-data';
import lookups from '../../lookups.json';
export async function GET(request:Request){
 const year=Number(new URL(request.url).searchParams.get('season'));
 if(!Number.isInteger(year)||year<1960||year>new Date().getUTCFullYear()+1)return Response.json({error:'Choose a supported season year.'},{status:400});
 try{
  const response=await fetch(`https://data-api.pgatour.com/schedule/R/${year}`,{headers:{Accept:'application/json',...(process.env.PGA_API_KEY?{'x-api-key':process.env.PGA_API_KEY}:{}),'x-pgat-platform':'web','Origin':'https://www.pgatour.com'},signal:AbortSignal.timeout(18000)});
  if(!response.ok)throw Error(`Schedule returned HTTP ${response.status}.`);
  const raw:any=await response.json();if(!Array.isArray(raw?.tournaments))throw Error('Unrecognized schedule response.');const events=scheduleEvents(raw,year);
  return Response.json({season:year,events,verification:noScoreContext,source:'PGA schedule',retrievedAt:new Date().toISOString()},{headers:{'Cache-Control':'private, max-age=300'}});
 }catch{
  // Older bundled IDs remain available but are never described as a verified live schedule.
  const events=lookups.events.filter(e=>Number(e.YEAR)===year).map(e=>({id:e['event-id'],name:e.EVENT,season:year,date:'',status:'',source:'Bundled lookup; schedule unverified'}));
  return Response.json({season:year,events,verification:noScoreContext,source:'Bundled lookup',warning:'Live season schedule is unavailable. Bundled event IDs are shown; participant and scoring requests still use the selected event ID.'},{headers:{'Cache-Control':'no-store'}});
 }
}
