// One place that talks to the network.
// Every request gets: a timeout, automatic retries for temporary problems,
// and a clear error "kind" the views can turn into the right message.

import {REQUEST_TIMEOUT_MS,MAX_ATTEMPTS,RETRY_DELAYS_MS} from '../config/apiConfig';
import {getSimulateMode,SLOW_DELAY_MS} from './simulator';

// kind is one of:
// offline | timeout | server | not_found | client | bad_data | network | aborted
export const createRequestError=(kind,message,status)=>{
    const error=new Error(message);
    error.name='RequestError';
    error.kind=kind;
    error.status=status||null;
    return error;
};

const RETRYABLE_KINDS=['timeout','server','network','bad_data'];

export const isRetryable=(error)=>{
    if(!error||!error.kind){
        return false;
    }
    return RETRYABLE_KINDS.includes(error.kind);
};

export const isBrowserOffline=()=>{
    if(typeof navigator==='undefined'){
        return false;
    }
    return navigator.onLine===false;
};

// Promise-based sleep that stops early if the caller aborts.
export const wait=(ms,signal)=>{
    return new Promise((resolve,reject)=>{
        if(signal&&signal.aborted){
            reject(createRequestError('aborted','Request was cancelled'));
            return;
        }
        const timer=setTimeout(()=>{
            if(signal){
                signal.removeEventListener('abort',onAbort);
            }
            resolve();
        },ms);
        const onAbort=()=>{
            clearTimeout(timer);
            reject(createRequestError('aborted','Request was cancelled'));
        };
        if(signal){
            signal.addEventListener('abort',onAbort,{once:true});
        }
    });
};

const getRetryDelay=(attemptNumber)=>{
    const index=attemptNumber-1;
    let base=RETRY_DELAYS_MS[RETRY_DELAYS_MS.length-1];
    if(index<RETRY_DELAYS_MS.length){
        base=RETRY_DELAYS_MS[index];
    }
    // Jitter, so thousands of visitors don't all retry at the same instant.
    const jitter=Math.floor(Math.random()*250);
    return base+jitter;
};

// One fetch with its own timeout. The caller's signal can still cancel it.
const fetchWithTimeout=async (url,callerSignal)=>{
    const controller=new AbortController();
    let timedOut=false;
    const timer=setTimeout(()=>{
        timedOut=true;
        controller.abort();
    },REQUEST_TIMEOUT_MS);

    const onCallerAbort=()=>{
        controller.abort();
    };
    if(callerSignal){
        if(callerSignal.aborted){
            clearTimeout(timer);
            throw createRequestError('aborted','Request was cancelled');
        }
        callerSignal.addEventListener('abort',onCallerAbort,{once:true});
    }

    try{
        const response=await fetch(url,{
            signal:controller.signal,
            headers:{Accept:'application/json'}
        });
        return response;
    }
    catch(error){
        if(callerSignal&&callerSignal.aborted){
            throw createRequestError('aborted','Request was cancelled');
        }
        if(timedOut){
            throw createRequestError('timeout','The server took too long to answer');
        }
        if(isBrowserOffline()){
            throw createRequestError('offline','You are offline');
        }
        // DNS failure, CORS block, connection reset… all look the same to fetch().
        throw createRequestError('network','Could not reach the server');
    }
    finally{
        clearTimeout(timer);
        if(callerSignal){
            callerSignal.removeEventListener('abort',onCallerAbort);
        }
    }
};

// What the simulator does instead of (or before) a real request.
const runSimulatedAttempt=async (mode,signal)=>{
    if(mode==='offline'){
        throw createRequestError('offline','You are offline (simulated)');
    }
    if(mode==='500'){
        await wait(300,signal);
        throw createRequestError('server','Server error 500 (simulated)',500);
    }
    if(mode==='timeout'){
        await wait(REQUEST_TIMEOUT_MS,signal);
        throw createRequestError('timeout','The server took too long to answer (simulated)');
    }
    if(mode==='slow'){
        await wait(SLOW_DELAY_MS,signal);
        return null;
    }
    if(mode==='malformed'){
        await wait(300,signal);
        throw createRequestError('bad_data','The server sent data we could not read (simulated)');
    }
    return null;
};

const parseJsonBody=async (response)=>{
    let text='';
    try{
        text=await response.text();
    }
    catch(error){
        throw createRequestError('network','The connection dropped while loading');
    }
    try{
        return JSON.parse(text);
    }
    catch(error){
        throw createRequestError('bad_data','The server sent data we could not read');
    }
};

const runOneAttempt=async (url,signal)=>{
    if(isBrowserOffline()){
        throw createRequestError('offline','You are offline');
    }
    const response=await fetchWithTimeout(url,signal);
    if(response.status===404){
        throw createRequestError('not_found','Not found',404);
    }
    if(response.status>=500){
        throw createRequestError('server','Server error '+response.status,response.status);
    }
    if(!response.ok){
        throw createRequestError('client','Request failed with '+response.status,response.status);
    }
    return parseJsonBody(response);
};

// options.signal      – cancel everything (page left, filter changed…)
// options.onAttempt   – called as (attemptNumber, maxAttempts) before each try
// options.simulate    – set false for requests the simulator must not touch
// options.simulateEmpty – what an "empty" simulated answer looks like for this call
export const requestJson=async (url,options)=>{
    const settings=options||{};
    const signal=settings.signal||null;
    const useSimulator=settings.simulate!==false;
    const mode=useSimulator?getSimulateMode():null;

    let lastError=null;
    for(let attempt=1;attempt<=MAX_ATTEMPTS;attempt++){
        if(settings.onAttempt){
            settings.onAttempt(attempt,MAX_ATTEMPTS);
        }
        try{
            if(mode){
                await runSimulatedAttempt(mode,signal);
                if(mode==='empty'){
                    if(settings.simulateEmpty!==undefined){
                        return settings.simulateEmpty;
                    }
                    throw createRequestError('not_found','Not found (simulated)',404);
                }
            }
            return await runOneAttempt(url,signal);
        }
        catch(error){
            const requestError=error&&error.kind?error:createRequestError('network',String(error&&error.message||error));
            if(requestError.kind==='aborted'){
                throw requestError;
            }
            lastError=requestError;
            if(!isRetryable(requestError)||attempt===MAX_ATTEMPTS){
                throw requestError;
            }
            await wait(getRetryDelay(attempt),signal);
        }
    }
    throw lastError;
};
