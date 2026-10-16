import {useCallback,useEffect,useRef,useState} from 'react';

// Tracks one photo: 'loading' → 'loaded' or 'failed'.
// While loading, the view shows a shimmer; if it fails (often: offline), the view shows a
// calm "photo unavailable" panel, and the photo is asked for again as soon as the
// connection comes back. "attempt" changes on each retry so the <img> is created afresh.
const useImageLoad=(url)=>{
    const [status,setStatus]=useState('loading');
    const [attempt,setAttempt]=useState(0);
    const imgRef=useRef(null);

    // A different photo starts over.
    useEffect(()=>{
        setStatus('loading');
        setAttempt(0);
    },[url]);

    // A photo already in the browser's cache can finish before React is listening.
    useEffect(()=>{
        const img=imgRef.current;
        if(img&&img.complete&&img.naturalWidth>0){
            setStatus('loaded');
        }
    },[url,attempt]);

    useEffect(()=>{
        if(status!=='failed'){
            return undefined;
        }
        const onOnline=()=>{
            setStatus('loading');
            setAttempt((previous)=>{
                return previous+1;
            });
        };
        window.addEventListener('online',onOnline);
        return ()=>{
            window.removeEventListener('online',onOnline);
        };
    },[status]);

    const onLoad=useCallback(()=>{
        setStatus('loaded');
    },[]);

    const onError=useCallback(()=>{
        setStatus('failed');
    },[]);

    return {status,attempt,imgRef,onLoad,onError};
};

export default useImageLoad;
