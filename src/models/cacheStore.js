// Two-level cache: memory (instant, lost on reload) + localStorage (survives reloads).
// Every storage call is wrapped in try/catch because storage can be blocked
// (private windows, full disk, browser settings) and that must never crash the site.

import {CACHE_FRESH_MS,CACHE_MAX_AGE_MS,MAX_CACHED_DETAILS} from '../config/apiConfig';

const PREFIX='r72:v1:';
const DETAIL_INDEX_KEY='detail-index';
const memory=new Map();

const getStorage=()=>{
    try{
        if(typeof window==='undefined'||!window.localStorage){
            return null;
        }
        return window.localStorage;
    }
    catch(error){
        return null;
    }
};

const readFromStorage=(key)=>{
    const storage=getStorage();
    if(!storage){
        return null;
    }
    try{
        const raw=storage.getItem(PREFIX+key);
        if(!raw){
            return null;
        }
        const entry=JSON.parse(raw);
        if(!entry||typeof entry.savedAt!=='number'||entry.data===undefined){
            return null;
        }
        return entry;
    }
    catch(error){
        return null;
    }
};

const writeToStorage=(key,entry)=>{
    const storage=getStorage();
    if(!storage){
        return false;
    }
    try{
        storage.setItem(PREFIX+key,JSON.stringify(entry));
        return true;
    }
    catch(error){
        return false;
    }
};

const removeFromStorage=(key)=>{
    const storage=getStorage();
    if(!storage){
        return;
    }
    try{
        storage.removeItem(PREFIX+key);
    }
    catch(error){
        // Nothing else we can do.
    }
};

// Returns {data, savedAt, isFresh} or null.
export const readCache=(key)=>{
    let entry=memory.get(key)||null;
    if(!entry){
        entry=readFromStorage(key);
        if(entry){
            memory.set(key,entry);
        }
    }
    if(!entry){
        return null;
    }
    const age=Date.now()-entry.savedAt;
    if(age>CACHE_MAX_AGE_MS||age<0){
        memory.delete(key);
        removeFromStorage(key);
        return null;
    }
    return {
        data:entry.data,
        savedAt:entry.savedAt,
        isFresh:age<=CACHE_FRESH_MS
    };
};

export const writeCache=(key,data)=>{
    const entry={data,savedAt:Date.now()};
    memory.set(key,entry);
    const saved=writeToStorage(key,entry);
    if(!saved){
        // Storage might be full: drop old event pages and try once more.
        trimDetails(0);
        writeToStorage(key,entry);
    }
    return entry;
};

// ----- event detail pages, kept as "most recently used" -----

const readDetailIndex=()=>{
    const entry=readFromStorage(DETAIL_INDEX_KEY);
    if(entry&&Array.isArray(entry.data)){
        return entry.data;
    }
    return [];
};

const trimDetails=(keepCount)=>{
    const index=readDetailIndex();
    if(index.length<=keepCount){
        return;
    }
    const removed=index.slice(keepCount);
    for(let i=0;i<removed.length;i++){
        removeFromStorage('event:'+removed[i]);
    }
    writeToStorage(DETAIL_INDEX_KEY,{data:index.slice(0,keepCount),savedAt:Date.now()});
};

export const readDetailCache=(id)=>{
    return readCache('event:'+id);
};

export const writeDetailCache=(id,data)=>{
    const index=readDetailIndex();
    const nextIndex=[id];
    for(let i=0;i<index.length;i++){
        if(index[i]!==id){
            nextIndex.push(index[i]);
        }
    }
    writeToStorage(DETAIL_INDEX_KEY,{data:nextIndex,savedAt:Date.now()});
    const entry=writeCache('event:'+id,data);
    trimDetails(MAX_CACHED_DETAILS);
    return entry;
};

// Used by tests only.
export const clearAllCaches=()=>{
    memory.clear();
    const storage=getStorage();
    if(!storage){
        return;
    }
    try{
        const keys=[];
        for(let i=0;i<storage.length;i++){
            const key=storage.key(i);
            if(key&&key.startsWith(PREFIX)){
                keys.push(key);
            }
        }
        for(let i=0;i<keys.length;i++){
            storage.removeItem(keys[i]);
        }
    }
    catch(error){
        // Ignore.
    }
};
