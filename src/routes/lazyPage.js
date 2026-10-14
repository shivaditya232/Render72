// Pages are split into separate files and downloaded on demand (smaller first load).
// Problem: if someone goes offline before a page's file has downloaded, clicking a link
// would crash. So: if offline, wait for the connection, then load; if a download
// fails while online, try once more before giving up.
//
// Browser quirk: Chrome remembers a failed module download and refuses to fetch the
// same URL again, even after the connection returns. So the final retry asks for the
// file under a fresh URL (?retry=<time>), which the browser treats as a new download.

import {isOnlineNow,waitForOnline} from '../models/connection';

const RETRY_DELAY_MS=800;
const CHUNK_ERROR_PATTERN=/dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to fetch/i;

const sleep=(ms)=>{
    return new Promise((resolve)=>{
        setTimeout(resolve,ms);
    });
};

export const isChunkLoadError=(error)=>{
    if(!error){
        return false;
    }
    return CHUNK_ERROR_PATTERN.test(String(error.message||error));
};

// Chrome and Firefox put the failed file's URL in the error message.
const getFailedModuleUrl=(error)=>{
    const text=String((error&&error.message)||'');
    const match=text.match(/https?:\/\/[^\s'"]+\.js/);
    if(match){
        return match[0];
    }
    return null;
};

const importFresh=(url)=>{
    const separator=url.includes('?')?'&':'?';
    return import(/* @vite-ignore */ url+separator+'retry='+Date.now());
};

export const importWithRetry=async (importer)=>{
    try{
        return await importer();
    }
    catch(firstError){
        if(!isOnlineNow()){
            await waitForOnline();
        }
        else{
            await sleep(RETRY_DELAY_MS);
        }
        try{
            return await importer();
        }
        catch(secondError){
            const url=getFailedModuleUrl(secondError)||getFailedModuleUrl(firstError);
            if(url){
                return importFresh(url);
            }
            throw secondError;
        }
    }
};

// For React Router's "lazy" route option.
export const lazyPage=(importer)=>{
    return async ()=>{
        const module=await importWithRetry(importer);
        return {Component:module.default};
    };
};

// Download every page file in the background once the browser is idle,
// so later navigation works even if the connection drops.
// Skipped while offline, so a failed attempt can't get stuck in the browser's memory.
export const preloadPages=(importers)=>{
    const run=()=>{
        if(!isOnlineNow()){
            return;
        }
        for(let i=0;i<importers.length;i++){
            importers[i]().catch(()=>{
                // Will be retried on demand.
            });
        }
    };
    if(typeof window.requestIdleCallback==='function'){
        window.requestIdleCallback(run,{timeout:4000});
    }
    else{
        setTimeout(run,2500);
    }
};
