import {verifyContext,noScoreContext} from '../../../lib/verification';
import {analyzePutt,MotionOptions} from '../../shot-video';
export async function POST(request:Request){
 try{
  const {shot,options,video,meta}=await request.json() as {shot:any;options:MotionOptions;video?:any;meta?:any};
  if(!shot||typeof shot!=='object')return Response.json({error:'Provide a shot object and optional motion options.'},{status:400});
  const scoped=meta&&/^R\d{7}$/.test(meta.event)&&/^\d{1,10}$/.test(meta.player)&&Number.isInteger(meta.round)&&meta.round>=1&&meta.round<=4;
  const verification=scoped?await verifyContext(meta):noScoreContext;
  return Response.json({puttAnalysis:analyzePutt(shot,options??{},video),verification},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to parse the shot analysis request.'},{status:400});}
}
