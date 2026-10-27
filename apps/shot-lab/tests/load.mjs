import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import ts from 'typescript';
const cache=new Map();
async function url(file){
 file=resolve(file);
 if(cache.has(file))return cache.get(file);
 if(file.endsWith('.json')){const result='data:text/javascript;base64,'+Buffer.from('export default '+readFileSync(file,'utf8')).toString('base64');cache.set(file,result);return result;}
 let js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const matches=[...js.matchAll(/from\s+(['"])(\.[^'"]+)\1/g)];
 for(const m of matches){const dependency=await url(resolve(dirname(file),m[2]+(m[2].endsWith('.json')?'':'.ts')));js=js.replace(m[0],`from '${dependency}'`);}
 const result='data:text/javascript;base64,'+Buffer.from(js).toString('base64');cache.set(file,result);return result;
}
export const loadFile=async file=>import(await url(file));
