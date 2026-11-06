'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {EventOption,Participant} from './catalog-data';
import {csvText,shotRows,type Shot} from './data';
import './workspace-sections.css';

const nav=[['/','Shot Explorer'],['/bulk-download','Bulk Downloads'],['/round-tracker','Round Tracker'],['/players','Player Profiles'],['/events','Events Directory'],['/courses','Courses Directory'],['/stats-values','Stats & Values']] as const;
const groups:Record<string,string[]>={
 'Player':['Player','Ranking','Status','Age','Nationality','FedEx Cup Standings','Career Thresholds'],
 'Shot skills':['OTT Distance','Greens in Regulation %','Fairways Hit %','Putting Count'],
 'Course attributes':['Course Location','Grass Type','Green Speed Score','Slope Rating','USGA Rating','Course Type'],
 'Hole attributes':['Par','Hole Length','Green Size','Hazard In Play','Heavy Forest','Fairway Width','Fairway Length'],
 'Time range':['Season','Round','Event','Date From','Date To'],
 'Stat categories':['Points Ranking','Scoring','Driving','Approach','Around Green','Putting','Streaks','Prize Earnings']
};
const labels:Record<string,string>={players:'Player Profiles',events:'Events Directory',courses:'Courses Directory','bulk-download':'Bulk Downloads','round-tracker':'Player / Round Stat Tracker','stats-values':'Stats & Values'};
type ApiResult={decoded:any;scorecard:any;tracking:any;meta:any;warnings?:string[]};
function saveFile(name:string,content:string,type:string){
 const url=URL.createObjectURL(new Blob([content],{type}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function fairwayValue(r:Shot):boolean|null{
 if(Number(r.strokeNumber)!==1)return null;
 const from=String(r.fromLocation??'').toLowerCase(),to=String(r.toLocation??'').toLowerCase();
 if(!/tee/.test(from))return null;
 if(/fairway/.test(to))return true;
 if(/rough|bunker|trees|native|water|penalty|hazard/.test(to))return false;
 return null;
}
function puttingValue(r:Shot){return /putt/i.test(String(r.strokeType??''))||/putt/i.test(String(r.fromLocation??''));}
function deriveHole(h:any,rows:Shot[],par:number|null){
 const shots=rows.filter(r=>Number(r.hole_number)===h.hole);
 const tee=shots.find(r=>Number(r.strokeNumber)===1);
 const eligible=par!==null&&par>3, fairway=eligible&&tee?fairwayValue(tee):null;
 const putts=shots.filter(puttingValue).length;
 // A GIR can only be labeled when the source explicitly establishes reaching the green in regulation.
 const green=shots.filter(r=>/green/i.test(String(r.toLocation??''))).map(r=>Number(r.strokeNumber)).filter(Number.isInteger);
 const gir=par!==null&&green.length?Math.min(...green)<=par-2:null;
 return {hole:h.hole,par,score:h.score??null,fairway, gir,putts:shots.length?putts:null,records:shots.length};
}
export default function WorkspaceSections({section}:{section:string}){
 const [season,setSeason]=useState(2026),[events,setEvents]=useState<EventOption[]>([]),[event,setEvent]=useState(''),[players,setPlayers]=useState<Participant[]>([]),[player,setPlayer]=useState(''),[round,setRound]=useState(1);
 const [error,setError]=useState(''),[info,setInfo]=useState(''),[busy,setBusy]=useState(false),[data,setData]=useState<ApiResult|null>(null);
 const [query,setQuery]=useState(''),[chosen,setChosen]=useState<string[]>([]),[allRounds,setAllRounds]=useState(false);
 const [filterValues,setFilterValues]=useState<Record<string,string>>({});
 const abort=useRef<AbortController|null>(null),cancel=useRef(false);
 useEffect(()=>{const c=new AbortController();setEvents([]);setEvent('');setPlayers([]);
 fetch('/api/catalog?season='+season,{signal:c.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Event catalog unavailable');setEvents(d.events||[]);setEvent(d.events?.[0]?.id||'');}).catch(e=>{if(!c.signal.aborted)setError(String(e.message))});return()=>c.abort()},[season]);
 useEffect(()=>{const c=new AbortController();setPlayers([]);setPlayer('');setChosen([]);setData(null);
 if(!event)return;
 fetch('/api/participants?event='+encodeURIComponent(event),{signal:c.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Roster unavailable');setPlayers(d.players||[]);setPlayer(d.players?.[0]?.id||'')}).catch(e=>{if(!c.signal.aborted)setError(String(e.message))});return()=>c.abort()},[event]);
 const selected=players.find(p=>p.id===player), chosenEvent=events.find(e=>e.id===event);
 const filteredPlayers=useMemo(()=>players.filter(p=>(p.name+' '+p.status).toLowerCase().includes(query.toLowerCase())),[players,query]);
 const scoreRows=useMemo(()=>{if(!data)return[];try{return shotRows(data.decoded,data.meta)}catch{return[]}},[data]);
 const holeRows=useMemo(()=>data?.scorecard?.holes?.map((h:any)=>deriveHole(h,scoreRows,h.par??null))??[],[data,scoreRows]);
 const counts=useMemo(()=>({fairways:holeRows.filter((h:any)=>h.fairway===true).length,fairwayKnown:holeRows.filter((h:any)=>h.fairway!==null).length,girs:holeRows.filter((h:any)=>h.gir===true).length,girKnown:holeRows.filter((h:any)=>h.gir!==null).length,putts:holeRows.reduce((sum:number,h:any)=>sum+(h.putts??0),0),puttKnown:holeRows.filter((h:any)=>h.putts!==null).length}),[holeRows]);
 async function fetchOne(pid:string,rnd:number,signal:AbortSignal):Promise<ApiResult>{
 const res=await fetch('/api/shots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,player:pid,round:rnd,radar:false,includeVideos:false,eventName:chosenEvent?.name}),signal});
 const body=await res.json();if(!res.ok)throw Error(body.error||'Shot data unavailable');return body;
 }
 async function load(){if(!player)return;setBusy(true);setError('');setInfo('');const c=new AbortController();abort.current=c;try{setData(await fetchOne(player,round,c.signal))}catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 async function bulk(){
 const ids=chosen.length?chosen:players.filter(p=>p.kind!=='withdrawn'&&p.kind!=='alternate').map(p=>p.id);
 if(!ids.length){setError('No eligible players selected.');return}
 const rounds=allRounds?[1,2,3,4]:[round],total=ids.length*rounds.length;
 setBusy(true);cancel.current=false;setError('');setInfo('Starting '+total+' player-round requests...');
 const c=new AbortController();abort.current=c;
 const records:Shot[]=[],failures:{player:string;round:number;reason:string}[]=[];let completed=0;
 for(const pid of ids){for(const rnd of rounds){
  if(cancel.current)break;
  try{const d=await fetchOne(pid,rnd,c.signal);records.push(...shotRows(d.decoded,d.meta))}
  catch(e){if(cancel.current)break;failures.push({player:pid,round:rnd,reason:e instanceof Error?e.message:String(e)})}
  completed++;setInfo('Processed '+completed+' / '+total+' player-rounds · '+records.length+' shot records · '+failures.length+' failures');
 }if(cancel.current)break}
 if(records.length)saveFile('shots_'+season+'_'+event+'_'+(allRounds?'all-rounds':'r'+round)+'.csv',csvText(records),'text/csv;charset=utf-8');
 if(failures.length)saveFile('shots_'+event+'_failures.json',JSON.stringify({event,season,requests:total,processed:completed,failures},null,2),'application/json');
 if(!records.length)setError('No shot records were retrieved. Review failures and API access.');
 setInfo((cancel.current?'Cancelled. ':'Finished. ')+completed+'/'+total+' requested; '+records.length+' records; '+failures.length+' failures. No missing player-round is silently treated as zero.');
 setBusy(false);
 }
 function value(label:string){return filterValues[label]??''}
 const shared=<div className="ws-controls"><label>Season <select value={season} onChange={e=>setSeason(Number(e.target.value))}>{[2026,2025,2024,2023,2022].map(y=><option key={y}>{y}</option>)}</select></label><label>Event <select value={event} onChange={e=>setEvent(e.target.value)}>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label>Round <select value={round} onChange={e=>{setRound(Number(e.target.value));setData(null)}}>{[1,2,3,4].map(r=><option key={r} value={r}>Round {r}</option>)}</select></label></div>;
 return <div className="ws-shell"><aside className="ws-nav"><a className="ws-brand" href="/">⛳ SHOT LAB</a><span>WORKSPACE DIRECTORY</span>{nav.map(([href,label])=><a key={href} className={href==='/'+section?'active':''} href={href}>{label}</a>)}</aside><div className="ws-main"><header className="ws-header"><a href="/">Workspace</a><strong>{labels[section]}</strong></header><main className="ws-content"><h1>{labels[section]}</h1><p className="ws-sub">PGA TOUR source-backed data. Unsupported attributes remain unpopulated until verified data is available.</p>
 {error&&<p className="ws-error" role="alert">{error}</p>}{info&&<p role="status" className="ws-info">{info}</p>}
 {section==='bulk-download'&&<><section className="ws-card"><h2>Bulk export builder</h2>{shared}<label className="ws-check"><input type="checkbox" checked={allRounds} onChange={e=>setAllRounds(e.target.checked)}/> All four rounds (otherwise selected round)</label><p>Select players below. If none are checked, all active event participants will be requested. CSV includes player, event, round and hole metadata. A separate failure manifest records unavailable rounds.</p><input placeholder="Filter participants" value={query} onChange={e=>setQuery(e.target.value)}/><div className="ws-selection"><button onClick={()=>setChosen(filteredPlayers.map(p=>p.id))}>Select displayed</button><button onClick={()=>setChosen([])}>Use all active players</button><span>{chosen.length?chosen.length+' selected':'All active participants'}</span></div><div className="ws-player-list">{filteredPlayers.map(p=><label key={p.id}><input type="checkbox" checked={chosen.includes(p.id)} onChange={e=>setChosen(old=>e.target.checked?[...old,p.id]:old.filter(x=>x!==p.id))}/>{p.name} · {p.status}</label>)}</div><button className="ws-primary" disabled={busy||!event||!players.length} onClick={()=>void bulk()}>Download shot mapping CSV</button> {busy&&<button onClick={()=>{cancel.current=true;abort.current?.abort()}}>Cancel remaining requests</button>}<p className="ws-muted">Downloads are generated in this browser session. API availability, timeouts and rate limits may prevent complete field coverage.</p></section></>}
 {section==='round-tracker'&&<><section className="ws-card"><h2>Player / round scorecard</h2>{shared}<label>Player <select value={player} onChange={e=>{setPlayer(e.target.value);setData(null)}}>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="ws-primary" disabled={busy||!player} onClick={()=>void load()}>Load scorecard and shots</button></section>{data&&<section className="ws-card"><h2>{selected?.name} · Round {round}</h2><div className="ws-kpis"><div><span>Official score</span><strong>{data.scorecard?.total??'—'}</strong></div><div><span>Fairways hit (known)</span><strong>{counts.fairways}/{counts.fairwayKnown}</strong></div><div><span>GIR (known)</span><strong>{counts.girs}/{counts.girKnown}</strong></div><div><span>Putts · tracked only</span><strong>{counts.puttKnown?counts.putts:'—'}</strong></div></div><p className="ws-muted">FIR applies to par 4/5 only; unclassified tee locations are excluded. GIR requires a known green arrival stroke. Putt counts depend on complete stroke tracking; they are not official totals.</p><div className="ws-table"><table><thead><tr>{['Hole','Par','Score','FIR','GIR','Putts tracked','Shot records'].map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{holeRows.map((h:any)=><tr key={h.hole}><td>{h.hole}</td><td>{h.par??'—'}</td><td>{h.score??'—'}</td><td>{h.fairway===null?'—':h.fairway?'✓':'✕'}</td><td>{h.gir===null?'—':h.gir?'✓':'✕'}</td><td>{h.putts??'—'}</td><td>{h.records}</td></tr>)}</tbody></table></div><button onClick={()=>saveFile('scorecard_'+event+'_'+player+'_r'+round+'.csv',csvText(holeRows.map((h:any)=>({...h,tournament_id:event,player_id:player,round_number:round}))), 'text/csv;charset=utf-8')}>Export scorecard CSV</button></section>}</>}
 {section==='players'&&<><section className="ws-card"><h2>Player directory & profiles</h2>{shared}<input placeholder="Search player name or status" value={query} onChange={e=>setQuery(e.target.value)}/><div className="ws-cards">{filteredPlayers.map(p=><article key={p.id}><h3>{p.name}</h3><p>{p.status} · {p.kind}</p><p>Recorded rounds: {p.rounds.join(', ')||'not supplied'}</p><a href={'/round-tracker?player='+p.id}>View round scorecard</a> · <a href={'/?player='+p.id}>Open shot map</a></article>)}</div></section></>}
 {section==='events'&&<section className="ws-card"><h2>Events</h2><label>Season <select value={season} onChange={e=>setSeason(Number(e.target.value))}>{[2026,2025,2024,2023,2022].map(y=><option key={y}>{y}</option>)}</select></label><div className="ws-cards">{events.map(e=><article key={e.id}><h3>{e.name}</h3><p>{e.date||'Date not supplied'} · {e.status||'Status unavailable'}</p><p>Event ID: {e.id}</p><details><summary>Event info / results / perks / schedule</summary><p>Schedule metadata: {e.source}. Results and perk values require verified event-level feeds.</p></details><a href={'/bulk-download?event='+e.id}>Export event shot records</a></article>)}</div></section>}
 {section==='courses'&&<section className="ws-card"><h2>Course directory</h2><p>Course Profile · Course Design · Course Attributes · Course Likeness Model · Toughest Courses · Holes</p><div className="ws-cards">{['Course Profile','Course Design','Course Attributes','Course Likeness Model','Toughest Courses','Hole Profiles'].map(t=><article key={t}><h3>{t}</h3><p>Ready for source-backed course identity, geometry, difficulty and statistical measurements. No unverified course rating is displayed.</p></article>)}</div><p className="ws-muted">The current event schedule and shot endpoint do not provide a complete course catalog or USGA rating dataset. Those adapters remain required.</p></section>}
 {section==='stats-values'&&<section className="ws-card"><h2>Statistics taxonomy & parameter filters</h2><p>Define measurable attributes and filters, including player, course, hole and time scope. Filters without a verified field are shown as configuration inputs, not applied results.</p><div className="ws-groups">{Object.entries(groups).map(([group,fields])=><fieldset key={group}><legend>{group}</legend>{fields.map(field=><label key={field}>{field}<input aria-label={field} placeholder={field==='Fairway Width'?'Narrow / Wide':field==='Fairway Length'?'Average / Short / Long':'Value / range'} value={value(field)} onChange={e=>setFilterValues(old=>({...old,[field]:e.target.value}))}/></label>)}</fieldset>)}</div><div className="ws-selection"><button className="ws-primary" onClick={()=>saveFile('shot-lab-filter-definition.json',JSON.stringify({schema:'shot-lab-filter-definition/v1',filters:filterValues},null,2),'application/json')}>Export filter definition</button><button onClick={()=>setFilterValues({})}>Reset parameters</button></div><p className="ws-muted">This saves a reusable filter definition. Applying all filters to records will require verified player demographic, course, hole and historical-stat providers.</p></section>}
 </main></div></div>
}
