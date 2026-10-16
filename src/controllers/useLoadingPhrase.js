import {useEffect,useState} from 'react';
import {LOADING_PHRASE_DELAY_MS,LOADING_PHRASE_ROTATE_MS,getPhrasesForCategory,SLOW_MESSAGE} from '../config/loadingPhrases';
import {SLOW_NOTICE_MS} from '../config/apiConfig';

const SLOW_AFTER_MS=SLOW_NOTICE_MS;

// While "active", returns { visible, phrase, isSlow }.
// Nothing shows for the first 0.8 s, so fast loads never flash text.
// After 4 s it switches to the honest "taking longer than usual" message
// (and at 8 s the page shows its saved copy instead of waiting any longer).
const useLoadingPhrase=(active,category)=>{
    const [visible,setVisible]=useState(false);
    const [index,setIndex]=useState(0);
    const [isSlow,setIsSlow]=useState(false);

    useEffect(()=>{
        if(!active){
            setVisible(false);
            setIsSlow(false);
            setIndex(0);
            return undefined;
        }
        const showTimer=setTimeout(()=>{
            setVisible(true);
        },LOADING_PHRASE_DELAY_MS);
        const slowTimer=setTimeout(()=>{
            setIsSlow(true);
        },SLOW_AFTER_MS);
        const rotateTimer=setInterval(()=>{
            setIndex((previous)=>{
                return previous+1;
            });
        },LOADING_PHRASE_ROTATE_MS);
        return ()=>{
            clearTimeout(showTimer);
            clearTimeout(slowTimer);
            clearInterval(rotateTimer);
        };
    },[active]);

    const phrases=getPhrasesForCategory(category);
    const phrase=isSlow?SLOW_MESSAGE:phrases[index%phrases.length];
    return {visible,phrase,isSlow};
};

export default useLoadingPhrase;
