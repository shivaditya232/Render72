// "My plan": the events a visitor has saved. Stored in localStorage (works offline,
// survives reloads) and shared live between every component — and between tabs.

const STORAGE_KEY='r72:v1:plan';
const MAX_SAVED=60;
const ID_PATTERN=/^[A-Za-z0-9-]{1,80}$/;

let savedIds=null;
const listeners=new Set();

const readFromStorage=()=>{
    try{
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(!raw){
            return [];
        }
        const parsed=JSON.parse(raw);
        if(!Array.isArray(parsed)){
            return [];
        }
        const clean=[];
        for(let i=0;i<parsed.length&&clean.length<MAX_SAVED;i++){
            if(typeof parsed[i]==='string'&&ID_PATTERN.test(parsed[i])&&!clean.includes(parsed[i])){
                clean.push(parsed[i]);
            }
        }
        return clean;
    }
    catch(error){
        return [];
    }
};

const writeToStorage=(ids)=>{
    try{
        window.localStorage.setItem(STORAGE_KEY,JSON.stringify(ids));
    }
    catch(error){
        // Storage blocked: the plan still works for this visit.
    }
};

const notify=()=>{
    listeners.forEach((listener)=>{
        listener();
    });
};

const ensureLoaded=()=>{
    if(savedIds===null){
        savedIds=typeof window==='undefined'?[]:readFromStorage();
    }
};

// Same array object until something changes (required by useSyncExternalStore).
export const getPlanIds=()=>{
    ensureLoaded();
    return savedIds;
};

export const isInPlan=(id)=>{
    ensureLoaded();
    return savedIds.includes(id);
};

export const togglePlan=(id)=>{
    ensureLoaded();
    if(!ID_PATTERN.test(String(id))){
        return false;
    }
    let next;
    let added;
    if(savedIds.includes(id)){
        next=savedIds.filter((savedId)=>savedId!==id);
        added=false;
    }
    else{
        if(savedIds.length>=MAX_SAVED){
            return false;
        }
        next=savedIds.concat([id]);
        added=true;
    }
    savedIds=next;
    writeToStorage(next);
    notify();
    return added;
};

export const clearPlan=()=>{
    savedIds=[];
    writeToStorage([]);
    notify();
};

export const subscribeToPlan=(listener)=>{
    listeners.add(listener);
    // Another tab changed the plan.
    const onStorage=(event)=>{
        if(event.key===STORAGE_KEY){
            savedIds=readFromStorage();
            listener();
        }
    };
    window.addEventListener('storage',onStorage);
    return ()=>{
        listeners.delete(listener);
        window.removeEventListener('storage',onStorage);
    };
};

// Used by tests only.
export const resetPlanForTests=()=>{
    savedIds=null;
};
