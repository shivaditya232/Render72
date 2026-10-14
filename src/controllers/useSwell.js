import {useCallback,useEffect,useRef} from 'react';

// Living headlines. Bricolage is a variable font with two axes we can move live:
// weight (400–800) and width (78–100%). Our headlines sit at 800 / 78% (heavy, condensed).
// Letters near the cursor are "pressed": thinner and wider, so the word keeps roughly
// the same length while it changes shape. They settle back as the cursor moves on.
// On first sight every letter starts pressed and settles in a ripple from left to right
// (this is also what touch screens see).
//
// Nothing re-renders in React: we only write font-variation-settings, one frame at a time,
// and the loop stops as soon as everything has settled.

const BASE_WEIGHT=800;
const BASE_WIDTH=78;
const PRESSED_WEIGHT=430;
const PRESSED_WIDTH=100;
const EASE=0.14;              // how quickly letters follow (0..1 per frame)
const REACH_EM=1.9;           // how far the effect reaches, in multiples of the font size
const INTRO_STAGGER_MS=22;    // delay between letters in the first-sight ripple

const prefersReducedMotion=()=>{
    try{
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    catch(error){
        return true;
    }
};

const hasFinePointer=()=>{
    try{
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }
    catch(error){
        return false;
    }
};

const writeLetter=(letter,amount)=>{
    if(amount<0.002){
        letter.style.fontVariationSettings='';
        return;
    }
    const weight=BASE_WEIGHT+(PRESSED_WEIGHT-BASE_WEIGHT)*amount;
    const width=BASE_WIDTH+(PRESSED_WIDTH-BASE_WIDTH)*amount;
    letter.style.fontVariationSettings='"wght" '+weight.toFixed(0)+', "wdth" '+width.toFixed(1);
};

const useSwell=(textKey)=>{
    const rootRef=useRef(null);
    const letters=useRef([]);
    const centres=useRef([]);
    const current=useRef([]);
    const target=useRef([]);
    const frame=useRef(0);
    const timers=useRef([]);

    const step=useCallback(()=>{
        frame.current=0;
        let moving=false;
        for(let i=0;i<letters.current.length;i++){
            const from=current.current[i]||0;
            const to=target.current[i]||0;
            let next=from+(to-from)*EASE;
            if(Math.abs(to-next)<0.003){
                next=to;
            }
            else{
                moving=true;
            }
            if(next!==from){
                current.current[i]=next;
                writeLetter(letters.current[i],next);
            }
        }
        if(moving){
            frame.current=requestAnimationFrame(step);
        }
    },[]);

    const wake=useCallback(()=>{
        if(!frame.current){
            frame.current=requestAnimationFrame(step);
        }
    },[step]);

    // Letter centres, measured at rest (when the pointer enters), so the maths stays cheap.
    const measure=useCallback(()=>{
        const result=[];
        for(let i=0;i<letters.current.length;i++){
            const rect=letters.current[i].getBoundingClientRect();
            result.push({x:rect.left+rect.width/2,y:rect.top+rect.height/2});
        }
        centres.current=result;
    },[]);

    useEffect(()=>{
        const root=rootRef.current;
        if(!root||prefersReducedMotion()){
            return undefined;
        }
        letters.current=Array.from(root.querySelectorAll('.swell-ch'));
        current.current=[];
        target.current=[];
        const fontSize=parseFloat(getComputedStyle(root).fontSize)||64;
        const reach=fontSize*REACH_EM;

        // First sight: start pressed, settle letter by letter.
        const intro=()=>{
            for(let i=0;i<letters.current.length;i++){
                current.current[i]=1;
                target.current[i]=1;
                writeLetter(letters.current[i],1);
            }
            for(let i=0;i<letters.current.length;i++){
                const timer=setTimeout(()=>{
                    target.current[i]=0;
                    wake();
                },120+i*INTRO_STAGGER_MS);
                timers.current.push(timer);
            }
        };
        let observer=null;
        if(typeof IntersectionObserver==='function'){
            observer=new IntersectionObserver((entries)=>{
                if(entries[0]&&entries[0].isIntersecting){
                    observer.disconnect();
                    intro();
                }
            },{threshold:0.35});
            observer.observe(root);
        }

        if(!hasFinePointer()){
            return ()=>{
                if(observer){
                    observer.disconnect();
                }
            };
        }

        const onEnter=()=>{
            measure();
        };
        const onMove=(event)=>{
            if(event.pointerType!=='mouse'){
                return;
            }
            if(centres.current.length!==letters.current.length){
                measure();
            }
            for(let i=0;i<centres.current.length;i++){
                const dx=event.clientX-centres.current[i].x;
                const dy=(event.clientY-centres.current[i].y)*1.4;
                const distance=Math.sqrt(dx*dx+dy*dy);
                const closeness=Math.max(0,1-distance/reach);
                // Smooth bell: strong right under the cursor, gentle at the edges.
                target.current[i]=closeness*closeness*(3-2*closeness);
            }
            wake();
        };
        const onLeave=()=>{
            for(let i=0;i<target.current.length;i++){
                target.current[i]=0;
            }
            wake();
        };
        root.addEventListener('pointerenter',onEnter);
        root.addEventListener('pointermove',onMove);
        root.addEventListener('pointerleave',onLeave);
        window.addEventListener('resize',measure);
        window.addEventListener('scroll',onLeave,{passive:true});
        return ()=>{
            if(observer){
                observer.disconnect();
            }
            root.removeEventListener('pointerenter',onEnter);
            root.removeEventListener('pointermove',onMove);
            root.removeEventListener('pointerleave',onLeave);
            window.removeEventListener('resize',measure);
            window.removeEventListener('scroll',onLeave);
        };
    },[textKey,measure,wake]);

    useEffect(()=>{
        return ()=>{
            cancelAnimationFrame(frame.current);
            for(let i=0;i<timers.current.length;i++){
                clearTimeout(timers.current[i]);
            }
        };
    },[]);

    return rootRef;
};

export default useSwell;
