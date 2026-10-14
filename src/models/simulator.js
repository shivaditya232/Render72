// Failure simulator, so anyone reviewing the site can see every fallback state
// without unplugging their router. Add ?simulate=<mode> to any URL:
//
//   offline    the API behaves as if there is no internet
//   500        the API returns a server error on every attempt
//   timeout    the API never answers (each attempt times out)
//   slow       the API answers, but 3.5 seconds late
//   empty      the API returns no events
//   malformed  the API returns broken data
//   off        turns the simulator off again
//
// The mode is kept for the browser tab (sessionStorage) so it survives page changes.

const STORAGE_KEY='r72:simulate';
export const SIMULATE_MODES=['offline','500','timeout','slow','empty','malformed'];
export const SLOW_DELAY_MS=3500;

let currentMode=null;
let isInitialised=false;

const readModeFromUrl=()=>{
    try{
        const params=new URLSearchParams(window.location.search);
        return params.get('simulate');
    }
    catch(error){
        return null;
    }
};

const initSimulator=()=>{
    isInitialised=true;
    if(typeof window==='undefined'){
        return;
    }
    const fromUrl=readModeFromUrl();
    if(fromUrl==='off'){
        currentMode=null;
        try{
            window.sessionStorage.removeItem(STORAGE_KEY);
        }
        catch(error){
            // Storage blocked (private mode etc.) – nothing to clear.
        }
        return;
    }
    if(fromUrl&&SIMULATE_MODES.includes(fromUrl)){
        currentMode=fromUrl;
        try{
            window.sessionStorage.setItem(STORAGE_KEY,fromUrl);
        }
        catch(error){
            // Still works for this page, just won't survive a reload.
        }
        return;
    }
    try{
        const saved=window.sessionStorage.getItem(STORAGE_KEY);
        if(saved&&SIMULATE_MODES.includes(saved)){
            currentMode=saved;
        }
    }
    catch(error){
        currentMode=null;
    }
};

export const getSimulateMode=()=>{
    if(!isInitialised){
        initSimulator();
    }
    return currentMode;
};

// Used by tests only.
export const setSimulateModeForTests=(mode)=>{
    isInitialised=true;
    currentMode=mode;
};
