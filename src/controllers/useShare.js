import {useCallback,useEffect,useRef,useState} from 'react';

const RESET_AFTER_MS=2600;

// Share a link: the phone's share sheet on touch devices, "copy link" everywhere else.
// status: 'idle' | 'copied' | 'shared' | 'failed' (failed = show the link to copy by hand)
const useShare=()=>{
    const [status,setStatus]=useState('idle');
    const timerRef=useRef(null);

    const setForAWhile=useCallback((next)=>{
        setStatus(next);
        if(timerRef.current){
            clearTimeout(timerRef.current);
        }
        if(next==='failed'){
            return;
        }
        timerRef.current=setTimeout(()=>{
            setStatus('idle');
        },RESET_AFTER_MS);
    },[]);

    useEffect(()=>{
        return ()=>{
            if(timerRef.current){
                clearTimeout(timerRef.current);
            }
        };
    },[]);

    const share=useCallback(async (data)=>{
        const isTouch=typeof window.matchMedia==='function'&&window.matchMedia('(pointer:coarse)').matches;
        if(isTouch&&typeof navigator.share==='function'){
            try{
                await navigator.share(data);
                setForAWhile('shared');
                return;
            }
            catch(error){
                // The visitor closed the share sheet: nothing to report.
                if(error&&error.name==='AbortError'){
                    return;
                }
            }
        }
        try{
            if(!navigator.clipboard||typeof navigator.clipboard.writeText!=='function'){
                throw new Error('Clipboard not available');
            }
            await navigator.clipboard.writeText(data.url);
            setForAWhile('copied');
        }
        catch(error){
            setForAWhile('failed');
        }
    },[setForAWhile]);

    const dismiss=useCallback(()=>{
        setStatus('idle');
    },[]);

    return {status,share,dismiss};
};

export default useShare;
