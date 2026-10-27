import type {Shot} from './data';
export type Metric={id:string;label:string;aliases:string[]};
// Aliases are candidates only: a value is shown with its exact field path and source units.
export const metrics:Metric[]=[
 {id:'spin',label:'Spin rate',aliases:['spinRate','backSpin','backspin','totalSpin']},
 {id:'smash',label:'Smash factor',aliases:['smashFactor']},
 {id:'club',label:'Swing / club speed',aliases:['clubHeadSpeed','clubSpeed','swingSpeed']},
 {id:'ball',label:'Ball speed',aliases:['ballSpeed']},
 {id:'carry',label:'Air distance / carry',aliases:['carryDistance','airDistance','shotAirDistance','carry']},
 {id:'roll',label:'Shot roll',aliases:['rollDistance','roll','shotRoll']},
 {id:'putt',label:'Putting distance',aliases:['puttDistance','puttingDistance']},
 {id:'break',label:'Putting break',aliases:['puttBreak','puttingBreak','breakDistance']},
 {id:'launch',label:'Launch angle',aliases:['launchAngle','verticalLaunchAngle']},
 {id:'direction',label:'Launch direction',aliases:['launchDirection','horizontalLaunchAngle']},
 {id:'apex',label:'Apex height',aliases:['apexHeight','maxHeight','apex']},
 {id:'flight',label:'Flight time',aliases:['flightTime','hangTime']},
 {id:'land',label:'Landing angle',aliases:['landingAngle','descentAngle']},
 {id:'axis',label:'Spin axis',aliases:['spinAxis','spinAxisTilt']},
 {id:'total',label:'Total distance',aliases:['distance','totalDistance']},
 {id:'remaining',label:'Distance remaining',aliases:['distanceRemaining']},
];
function present(v:unknown){return v!==null&&v!==undefined&&v!==''&&typeof v!=='boolean'&&!(typeof v==='number'&&!Number.isFinite(v));}
export function metricValue(row:Shot,m:Metric):{value:string;source:string;kind:string}{
 const entries=Object.entries(row);
 for(const alias of m.aliases){
  const found=entries.find(([k,v])=>(k.split('.').at(-1)===alias||k.endsWith('.'+alias+'.value'))&&present(v)&&!String(v).startsWith('['));
  if(found){const [key,v]=found;const base=key.endsWith('.value')?key.slice(0,-6):key;const unit=row[base+'.unit']??row[base+'Unit']??row[base+'.units'];return {value:String(v)+(unit?' '+String(unit):''),source:key+(unit||typeof v==='string'&&/\b(yds?|ft|in|mph|rpm|m\/s|deg)\b/i.test(v)?'':' · unit unspecified'),kind:'Reported'};}
 }
 // A putting stroke can use the source stroke distance; never infer break from endpoints.
 if(m.id==='putt'&&/putt/i.test(String(row.strokeType))&&present(row.distance))return {value:String(row.distance),source:'distance · putting stroke · unit unspecified',kind:'Reported'};
 return {value:'—',source:'Not returned by source',kind:'Unavailable'};
}
export type Point={x:number;y:number;z?:number};
export function shotPoint(row:Shot,side:'from'|'to'):Point|null{
 const prefix='overview.leftToRightCoords.'+side+'Coords.';
 const x=row[prefix+'x'],y=row[prefix+'y'];
 // Avoid Number(null), which would fabricate coordinates at the origin.
 return typeof x==='number'&&Number.isFinite(x)&&typeof y==='number'&&Number.isFinite(y)?{x,y}:null;
}
export function trajectory(row:Shot):Point[]{
 for(const key of ['radar.trajectory','radar.trajectoryPoints','trajectory','trajectoryPoints','shotTrajectory']){
  let raw=row[key];try{if(typeof raw==='string')raw=JSON.parse(raw);}catch{continue;}
  if(Array.isArray(raw)&&raw.length>=2&&raw.every(p=>p&&typeof p.x==='number'&&Number.isFinite(p.x)&&typeof p.y==='number'&&Number.isFinite(p.y)&&typeof p.z==='number'&&Number.isFinite(p.z)))return raw;
 }
 return [];
}
