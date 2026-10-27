import assert from 'node:assert/strict';
import {loadFile} from './load.mjs';
const {scoreNumber,roundScorecard,trackingSummary}=await loadFile('app/scoring.ts');
const {scheduleEvents,eventParticipants}=await loadFile('app/catalog-data.ts');
const {scoreChecks,officialPageUrl}=await loadFile('lib/verification.ts');
const holes=Array.from({length:18},(_,i)=>({holeNumber:i+1,par:4,score:'4'}));
const card={roundScores:[{roundNumber:1,total:'72',firstNine:{holes:holes.slice(0,9)},secondNine:{holes:holes.slice(9)}}]};
const parsed=roundScorecard(card,1);assert.equal(parsed.total,72);assert.equal(parsed.toPar,0);assert.equal(roundScorecard(card,2).total,null);assert.equal(scoreNumber('-1'),null);assert.equal(scoreNumber('283'),283);
const corrupt=structuredClone(card);corrupt.roundScores[0].total='71';assert.equal(roundScorecard(corrupt,1).total,null);
const decoded={holes:holes.map((h,i)=>({...h,strokes:i===0?[{strokeNumber:1,strokeType:'STROKE'},{strokeNumber:2,strokeType:'DROP'}]:[]}))};
const summary=trackingSummary(decoded,parsed);assert.equal(summary.records,2);assert.equal(summary.trackedStrokes,1);assert.equal(summary.otherRecords,1);assert.equal(summary.holes[0].officialScore,4);
const boardEntry={player:{id:'1'},scoringData:{totalStrokes:'72',rounds:[72]}};
const checks=scoreChecks(decoded,card,1,boardEntry);assert.equal(checks.length,4);assert.ok(checks.every(c=>c.status==='passed'));
decoded.holes[17].score='5';assert.equal(scoreChecks(decoded,card,1,boardEntry).at(-1).status,'mismatch');
const players=eventParticipants({players:[{id:'1',firstName:'Player',lastName:'One',withdrawn:false}],alternates:[{id:'2',firstName:'Alternate',lastName:'Two'}]},{players:[{player:{id:'1',firstName:'Player',lastName:'One'},scoringData:{rounds:[72,71,null,null]}}]});
assert.equal(players.length,2);assert.deepEqual(players.find(p=>p.id==='1').rounds,[1,2]);assert.equal(players.find(p=>p.id==='2').kind,'alternate');
assert.equal(scheduleEvents({tournaments:[{tournamentId:'R2025034',name:'Travelers'},{tournamentId:'R2026034',name:'Other season'},{tournamentId:'R2025034',name:'Duplicate'}]},2025).length,1);
assert.match(officialPageUrl('R2025034','Travelers Championship'),/2025\/travelers-championship\/R2025034\/leaderboard$/);
console.log('Passed: season filtering, participant deduplication, alternates/withdrawals, scorecard reconciliation, stroke-vs-drop separation, sampled verification mismatches.');

// Headshots are optional source metadata, not a generated player-ID URL.
const imageUrl='https://images.example.com/player-1.png';
const imagePlayers=eventParticipants({players:[{id:'1',headshotUrl:imageUrl}]},{players:[{player:{id:'1'},scoringData:{rounds:[72]}}]});
assert.equal(imagePlayers[0].headshotUrl,imageUrl);
assert.equal(imagePlayers[0].headshotSource,'field.players.headshotUrl');
const boardImage=eventParticipants(null,{players:[{player:{id:'2',headshot:'https://images.example.com/player-2.png'}}]})[0];
assert.equal(boardImage.headshotUrl,'https://images.example.com/player-2.png');
assert.equal(boardImage.headshotSource,'leaderboard.players.player.headshot');
for(const invalid of [null,undefined,'','   ','/relative.png','http://images.example.com/p.png','javascript:alert(1)','https://user:secret@images.example.com/p.png',{},23]){
 const player=eventParticipants({players:[{id:'3',headshotUrl:invalid}]},null)[0];
 assert.equal(player.headshotUrl,null);assert.equal(player.headshotSource,null);
}
const alternateImage=eventParticipants({alternates:[{id:'4',headshotUrl:imageUrl}]},null)[0];
assert.equal(alternateImage.headshotSource,'field.alternates.headshotUrl');
const mergedImage=eventParticipants({players:[{id:'1',headshotUrl:imageUrl}]},{players:[{player:{id:'1',headshotUrl:'not-a-url'}}]})[0];
assert.equal(mergedImage.headshotUrl,imageUrl);
assert.equal(eventParticipants({players:[{id:'5',headshotUrl:'bad',headshot:imageUrl}]},null)[0].headshotUrl,imageUrl);
console.log('Passed: nullable source headshots, source provenance, duplicate merge retention and unsafe/malformed URL rejection.');
