import {useCallback,useSyncExternalStore} from 'react';

const getMatcher=(query)=>{
    try{
        return window.matchMedia(query);
    }
    catch(error){
        return null;
    }
};

// true while the media query matches; updates on resize / rotation.
// Used to render only the layout that's on screen, so hidden layouts don't download images.
const useMediaQuery=(query)=>{
    const subscribe=useCallback((onChange)=>{
        const matcher=getMatcher(query);
        if(!matcher){
            return ()=>{};
        }
        matcher.addEventListener('change',onChange);
        return ()=>{
            matcher.removeEventListener('change',onChange);
        };
    },[query]);

    const getSnapshot=()=>{
        const matcher=getMatcher(query);
        if(!matcher){
            return false;
        }
        return matcher.matches;
    };

    const getServerSnapshot=()=>{
        return false;
    };

    return useSyncExternalStore(subscribe,getSnapshot,getServerSnapshot);
};

export default useMediaQuery;
