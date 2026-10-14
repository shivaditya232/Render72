// Runs before every build (npm run build).
// Saves a fresh copy of the events into public/fallback/ so the site still has
// real content to show if the API is down when someone visits.
// If the API can't be reached at build time, the existing copy is kept and the
// build carries on — this script never fails the build.

import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const API_BASE_URL='https://render72.pages.dev/api/test';
const TIMEOUT_MS=10000;
const PARALLEL_REQUESTS=5;

const rootDir=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fallbackDir=path.join(rootDir,'public','fallback');
const detailDir=path.join(fallbackDir,'events');
const ID_PATTERN=/^[A-Za-z0-9-]{1,80}$/;

const fetchJson=async (url)=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{
        controller.abort();
    },TIMEOUT_MS);
    try{
        const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
        if(!response.ok){
            throw new Error('HTTP '+response.status);
        }
        return await response.json();
    }
    finally{
        clearTimeout(timer);
    }
};

const saveDetails=async (ids)=>{
    await mkdir(detailDir,{recursive:true});
    let saved=0;
    for(let i=0;i<ids.length;i=i+PARALLEL_REQUESTS){
        const batch=ids.slice(i,i+PARALLEL_REQUESTS);
        const results=await Promise.allSettled(batch.map((id)=>{
            return fetchJson(API_BASE_URL+'/events/'+encodeURIComponent(id));
        }));
        for(let j=0;j<results.length;j++){
            const result=results[j];
            if(result.status==='fulfilled'&&result.value&&result.value.event){
                await writeFile(path.join(detailDir,batch[j]+'.json'),JSON.stringify(result.value));
                saved=saved+1;
            }
        }
    }
    return saved;
};

const run=async ()=>{
    try{
        const list=await fetchJson(API_BASE_URL+'/events');
        if(!list||!Array.isArray(list.events)||list.events.length===0){
            console.warn('[snapshot] API returned no events, keeping the existing copy.');
            return;
        }
        await mkdir(fallbackDir,{recursive:true});
        const payload={generatedAt:new Date().toISOString(),events:list.events};
        await writeFile(path.join(fallbackDir,'events.json'),JSON.stringify(payload));

        const ids=[];
        for(let i=0;i<list.events.length;i++){
            const id=list.events[i]&&list.events[i].id;
            if(typeof id==='string'&&ID_PATTERN.test(id)){
                ids.push(id);
            }
        }
        const saved=await saveDetails(ids);
        console.log('[snapshot] Saved '+list.events.length+' events and '+saved+' event pages.');
    }
    catch(error){
        console.warn('[snapshot] Could not reach the API ('+error.message+'), keeping the existing copy.');
    }
};

run();
