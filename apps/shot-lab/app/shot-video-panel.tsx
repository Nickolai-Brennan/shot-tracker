'use client';
import {useState} from 'react';
import type {Shot} from './data';
import {puttCandidate} from './shot-video';
import type {MotionOptions} from './shot-video';
function clips(row:Shot):any[]{try{const v=JSON.parse(String(row['tourcastShotVideo.matches']??'[]'));return Array.isArray(v)?v:[];}catch{return [];}}
function safeVideoUrl(raw:unknown){try{const u=new URL(String(raw),'https://www.pgatour.com');return u.protocol==='https:'&&(u.hostname==='pgatour.com'||u.hostname.endsWith('.pgatour.com'))?u.href:null;}catch{return null;}}
export default function ShotVideoPanel({shot,onAnnotate}:{shot:Shot;onAnnotate:(hole:number,stroke:number,options:MotionOptions)=>void}){
 const [unit,setUnit]=useState(String(shot['motionAnnotation.coordinateUnit']??'unknown'));
 const [start,setStart]=useState(String(shot['motionAnnotation.motionStartSeconds']??'')),[end,setEnd]=useState(String(shot['motionAnnotation.motionEndSeconds']??''));
 const [path,setPath]=useState(String(shot['motionAnnotation.path']??'')),[error,setError]=useState('');
 const videos=clips(shot),candidate=puttCandidate(shot),explicitPutt=/putt/i.test(String(shot.strokeType??''));
 const [confirmed,setConfirmed]=useState(shot['motionAnnotation.confirmPutt']===true);
 const numberText=(field:string,digits=2)=>typeof shot[field]==='number'?(shot[field] as number).toFixed(digits):'—';
 function apply(){try{
  if(!['unknown','m','ft','yd'].includes(unit))throw Error('Choose a coordinate unit.');
  const options:MotionOptions={coordinateUnit:unit as MotionOptions['coordinateUnit'],...(!explicitPutt?{confirmPutt:confirmed}:{})};
  if(path.trim())options.path=JSON.parse(path);
  else if(start!==''||end!==''){
   if(start.trim()===''||end.trim()===''||!Number.isFinite(Number(start))||!Number.isFinite(Number(end))||Number(start)<0||Number(end)<=Number(start))throw Error('Enter contact and rest times with rest later than contact.');
   options.motionStartSeconds=Number(start);options.motionEndSeconds=Number(end);
  }
  onAnnotate(Number(shot.hole_number),Number(shot.strokeNumber),options);setError('');
 }catch(e){setError(e instanceof Error?e.message:'Check the timing/path input.');}}
 return <section className="video-analysis"><h3>Shot video & event timing</h3><p>Video matching: {String(shot['tourcastShotVideo.status']??'not-available')}. Source startsAt/endsAt describe video availability, not shot time or ball-motion duration.</p>
 {videos.map((v,i)=>{const href=safeVideoUrl(v.shareUrl);return <div className="video-link" key={String(v.id??i)}><span>{String(v.title??`Video ${i+1}`)}</span>{href?<a href={href} target="_blank" rel="noreferrer">Open clip ↗</a>:<span>No supported PGA video URL</span>}</div>})}
 <dl className="timing-fields"><div><dt>Video available from (UTC)</dt><dd>{String(shot['video-availability-start-utc']??'—')}</dd></div><div><dt>Video available until (UTC)</dt><dd>{String(shot['video-availability-end-utc']??'—')}</dd></div><div><dt>Availability interval</dt><dd>{numberText('video-availability-seconds')} s</dd></div><div><dt>Clip duration</dt><dd>{numberText('video-duration-seconds')} s</dd></div></dl>
 {candidate&&<><h3>Putt distance & average speed</h3><p>Live shots use native tourcastX/tourcastY, not normalized map x/y. Confirm the native physical units before calculating. Imported x/y must already be calibrated. Contact/rest times are seconds from the clip start or another consistent motion timeline.</p>
 {!explicitPutt&&<label className="checkbox"><input type="checkbox" aria-label="Confirm green stroke is a putt" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Confirm this green stroke is a putt</label>}<div className="motion-inputs"><label>Coordinate unit<select aria-label="Putt coordinate unit" value={unit} onChange={e=>setUnit(e.target.value)}><option value="unknown">Unknown · do not calculate</option><option value="m">Meters</option><option value="ft">Feet</option><option value="yd">Yards</option></select></label><label>Ball contact (s)<input aria-label="Ball contact seconds" type="number" min="0" step="0.01" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Ball at rest / hole-out (s)<input aria-label="Ball rest seconds" type="number" min="0" step="0.01" value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
 <details className="path-input"><summary>Optional timed path coordinates</summary><p>JSON array of &#123;x, y, timeSeconds&#125; samples, starting and ending at the shot coordinates. Times must increase and span the full ball motion. A supplied path takes precedence over contact/rest inputs. Distances are planar.</p><textarea aria-label="Timed putt path JSON" value={path} onChange={e=>setPath(e.target.value)} placeholder='[{"x":0,"y":0,"timeSeconds":2},{"x":3,"y":1,"timeSeconds":5}]'/></details>
 <div className="map-actions"><button className="primary" onClick={apply}>Calculate putt metrics</button><button className="secondary" onClick={()=>{setUnit('unknown');setConfirmed(false);setStart('');setEnd('');setPath('');setError('');onAnnotate(Number(shot.hole_number),Number(shot.strokeNumber),{});}}>Reset calculation</button></div>
 {error&&<p role="alert" className="motion-error">{error}</p>}
 <p role="status">Calculation: {String(shot['puttAnalysis.status']??'not-calculated')}</p><div className="putt-summary"><div><span>Straight-line distance</span><strong>{numberText('puttAnalysis.straightLineDistanceMeters')} m</strong></div><div><span>Sampled path length</span><strong>{numberText('puttAnalysis.pathDistanceMeters')} m</strong></div><div><span>Ball-motion duration</span><strong>{numberText('puttAnalysis.motionDurationSeconds')} s</strong></div><div><span>Average speed</span><strong>{numberText('puttAnalysis.averageSpeedMps')} m/s</strong><small>{numberText('puttAnalysis.averageSpeedMph')} mph · {numberText('puttAnalysis.averageSpeedFps')} ft/s</small></div></div><p>{String(shot['puttAnalysis.speedBasis']??'Ball-motion timing and coordinate scale are required for speed.')} · Average speed is not initial launch speed.</p></>}
 </section>;
}
