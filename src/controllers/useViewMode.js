import {useCallback,useState} from 'react';

const STORAGE_KEY='r72:v1:view';
const MODES=['posters','index'];

const readMode=()=>{
    try{
        const saved=window.localStorage.getItem(STORAGE_KEY);
        if(MODES.includes(saved)){
            return saved;
        }
    }
    catch(error){
        // Storage blocked: fall back to posters.
    }
    return 'posters';
};

// Posters or compact index, remembered per visitor.
const useViewMode=()=>{
    const [mode,setModeState]=useState(readMode);

    const setMode=useCallback((next)=>{
        if(!MODES.includes(next)){
            return;
        }
        setModeState(next);
        try{
            window.localStorage.setItem(STORAGE_KEY,next);
        }
        catch(error){
            // Not remembered, but still switches for this visit.
        }
    },[]);

    return [mode,setMode];
};

export default useViewMode;
