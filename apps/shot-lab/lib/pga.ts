// All PGA requests use fixed hosts, bounded timeouts, and the existing server secret.
export async function pgaQuery(query:string,operationName:string,variables:Record<string,unknown>){
 const key=process.env.PGA_API_KEY;
 if(!key)throw Error('PGA API key is not configured.');
 const response=await fetch('https://orchestrator.pgatour.com/graphql',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'x-pgat-platform':'web','Origin':'https://www.pgatour.com','Referer':'https://www.pgatour.com/'},body:JSON.stringify({query,operationName,variables}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`${operationName} returned HTTP ${response.status}.`);
 const envelope:any=await response.json();if(envelope.errors?.length)throw Error(`${operationName} returned a GraphQL error.`);
 return envelope;
}
export async function decodePayload(payload:unknown){
 if(typeof payload!=='string'||!payload)throw Error('Compressed PGA payload is missing.');
 const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
 return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}
