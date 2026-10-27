// The official scorecard is authoritative. Tracking records are coverage evidence, not a score.
export function scoreNumber(value:unknown):number|null{
 if(typeof value==='number'&&Number.isInteger(value)&&value>0&&value<10000)return value;
 if(typeof value==='string'&&/^\d{1,4}$/.test(value.trim())){const n=Number(value);return n>0?n:null;}
 return null;
}
export function roundScorecard(card:any,round:number){
 const rounds=Array.isArray(card?.roundScores)?card.roundScores:[];
 const selected=rounds.find((r:any)=>Number(r.roundNumber)===round);
 if(!selected)return {available:false,round,holes:[],total:null,reportedTotal:null,toPar:null,issues:['No scorecard returned for this round.'],availableRounds:rounds.map((r:any)=>Number(r.roundNumber))};
 const list=[...(selected.firstNine?.holes??[]),...(selected.secondNine?.holes??[])];
 const holes=list.map((h:any)=>({hole:Number(h.holeNumber),par:scoreNumber(h.par),score:scoreNumber(h.score),rawScore:h.score,status:h.status,sequence:h.sequenceNumber}));
 const issues:string[]=[];
 if(holes.some((h:any)=>!Number.isInteger(h.hole)||h.hole<1||h.hole>18))issues.push('Invalid hole number in scorecard.');
 if(new Set(holes.map((h:any)=>h.hole)).size!==holes.length)issues.push('Duplicate hole numbers in scorecard.');
 const valid=holes.filter((h:any)=>h.score!==null&&h.hole>=1&&h.hole<=18);
 const reportedTotal=scoreNumber(selected.total);
 const sum=valid.reduce((n:number,h:any)=>n+h.score,0);
 if(valid.length===18&&reportedTotal!==null&&reportedTotal!==sum)issues.push('Scorecard total disagrees with its hole scores.');
 const complete=valid.length===18&&issues.length===0;
 return {available:true,round,holes,total:complete?sum:null,reportedTotal,toPar:complete&&valid.every((h:any)=>h.par!==null)?sum-valid.reduce((n:number,h:any)=>n+h.par,0):null,issues,availableRounds:rounds.map((r:any)=>Number(r.roundNumber)),rawRound:selected};
}
export function trackingSummary(decoded:any,scorecard:any=null){
 const cardHoles=new Map((scorecard?.holes??[]).map((h:any)=>[h.hole,h]));
 const seenHoles=new Set<number>(),seenRows=new Set<string>();const issues:string[]=[];
 let records=0,strokes=0,other=0;
 const holes=(decoded?.holes??[]).map((h:any)=>{
  const n=Number(h.holeNumber),rows=Array.isArray(h.strokes)?h.strokes:[];
  if(seenHoles.has(n))issues.push(`Duplicate tracking hole ${n}.`);seenHoles.add(n);
  let physical=0,nonstroke=0;
  for(const r of rows){
   records++;const key=`${n}:${r.strokeNumber}:${r.strokeType}`;
   if(seenRows.has(key))issues.push(`Duplicate tracking record ${key}.`);seenRows.add(key);
   if(['STROKE','PUTT','DRIVE'].includes(String(r.strokeType).toUpperCase())){physical++;strokes++;}else{nonstroke++;other++;}
  }
  const c:any=cardHoles.get(n);const official=c?.score??null;
  return {hole:n,records:rows.length,trackedStrokes:physical,otherRecords:nonstroke,officialScore:official,par:c?.par??scoreNumber(h.par),trackingScore:h.score??null,coverage:official===null?'score-unverified':rows.length===0?'no-tracking':physical>official?'tracking-exceeds-score':physical===official?'count-consistent':'requires-review'};
 });
 return {records,trackedStrokes:strokes,otherRecords:other,holes,issues,scorecardAvailable:!!scorecard?.available};
}
