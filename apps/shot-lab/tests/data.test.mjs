import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {loadFile} from './load.mjs';
const load=async s=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const {shotRows,csvText}=await load(readFileSync('app/data.ts','utf8'));
// Synthetic fixtures verify preservation and decoding; they are never shipped as real golf data.
const decoded={holes:[{holeNumber:1,par:4,strokes:[{strokeNumber:1,playByPlay:'A, "shot"',radar:{speed:123},trail:[1,2]}]},{holeNumber:2,strokes:[]}]};
const rows=shotRows(decoded,{event:'R2026528',round:4});
assert.equal(rows.length,1);assert.equal(rows[0]['radar.speed'],123);assert.equal(rows[0].trail,'[1,2]');assert.equal(rows[0].round_number,4);assert.match(csvText(rows),/A, ""shot""/);assert.match(csvText([{a:'=SUM(1)',b:3}]),/'=SUM/);assert.throws(()=>shotRows({}));
const route=readFileSync('app/api/shots/route.ts','utf8').replace("import { query } from './query';",'const query="test";');
const {POST}=await loadFile('app/api/shots/route.ts');process.env.PGA_API_KEY='test-only';const original=globalThis.fetch;
const request=()=>new Request('https://test/api/shots',{method:'POST',body:JSON.stringify({event:'R2026528',player:'50095',round:4,radar:true})});
globalThis.fetch=async()=>Response.json({data:{shotDetailsV4Compressed:{payload:gzipSync(JSON.stringify(decoded)).toString('base64')}}});
const success=await POST(request());assert.equal(success.status,200);assert.deepEqual((await success.json()).decoded,decoded);
globalThis.fetch=async()=>new Response('Forbidden',{status:403});const blocked=await POST(request());assert.equal(blocked.status,502);assert.match((await blocked.json()).error,/403/);
const bad=await POST(new Request('https://test/api/shots',{method:'POST',body:JSON.stringify({event:'bad'})}));assert.equal(bad.status,400);
globalThis.fetch=original;delete process.env.PGA_API_KEY;console.log('Passed: shot flattening, radar retention, CSV escaping, formula protection, input validation, gzip decoding, upstream 403 handling.');
