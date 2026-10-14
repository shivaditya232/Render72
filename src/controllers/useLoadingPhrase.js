import {useEffect,useState} from 'react';
import {LOADING_PHRASE_DELAY_MS,LOADING_PHRASE_ROTATE_MS,getPhrasesForCategory,SLOW_MESSAGE} from '../config/loadingPhrases';

const SLOW_AFTER_MS=8000;

// While "active", returns { visible, phrase, isSlow }.
// Nothing shows for the first 0.8 s, so fast loads never flash text.
// After 8 s it switches to the honest "taking longer than usual" message.
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
