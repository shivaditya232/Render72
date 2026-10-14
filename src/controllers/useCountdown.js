import {useEffect,useState} from 'react';
import {getCountdownParts} from '../utils/formatters';

// Ticks once a second until targetMs. Pauses while the tab is hidden
// (no wasted work), and catches up the moment it's visible again.
const useCountdown=(targetMs)=>{
    const [now,setNow]=useState(()=>Date.now());

    useEffect(()=>{
        if(!Number.isFinite(targetMs)){
            return undefined;
        }
        let timer=null;
        const tick=()=>{
            setNow(Date.now());
        };
        const start=()=>{
            clearInterval(timer);
            tick();
            timer=setInterval(tick,1000);
        };
        const stop=()=>{
            clearInterval(timer);
            timer=null;
        };
        const onVisibility=()=>{
            if(document.hidden){
                stop();
            }
            else{
                start();
            }
        };
        start();
        document.addEventListener('visibilitychange',onVisibility);
        return ()=>{
            stop();
            document.removeEventListener('visibilitychange',onVisibility);
        };
    },[targetMs]);

    return getCountdownParts(targetMs,now);
};

export default useCountdown;
