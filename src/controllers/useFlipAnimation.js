import {useCallback,useEffect,useLayoutEffect,useRef} from 'react';

const MOVE_MS=480;
const ENTER_MS=320;
const EASE='cubic-bezier(0.22,1,0.36,1)';

const prefersReducedMotion=()=>{
    try{
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    catch(error){
        return false;
    }
};

// Page-relative position, so scrolling between two filter changes doesn't fake a "move".
const measure=(node)=>{
    const rect=node.getBoundingClientRect();
    return {left:rect.left+window.scrollX,top:rect.top+window.scrollY,viewTop:rect.top,viewBottom:rect.bottom};
};

const isNearViewport=(viewTop,viewBottom)=>{
    const margin=window.innerHeight*0.5;
    return viewBottom>-margin&&viewTop<window.innerHeight+margin;
};

// FLIP (First, Last, Invert, Play): when filters change, cards glide from where
// they were to where they are now, and new cards fade in. Hand-written with the
// browser's own Web Animations API, so it costs ~1 KB instead of a 40 KB library.
// signature: a string that changes whenever the list order changes.
// resetKey: when this changes (e.g. poster view -> list view) nothing "moves";
//           everything simply fades in, because old positions mean nothing any more.
const useFlipAnimation=(signature,resetKey)=>{
    const nodes=useRef(new Map());
    const positions=useRef(new Map());
    const hasRendered=useRef(false);
    const lastResetKey=useRef(resetKey);

    const register=useCallback((key)=>{
        return (node)=>{
            if(node){
                nodes.current.set(key,node);
            }
            else{
                nodes.current.delete(key);
            }
        };
    },[]);

    // Stop any slide still running, so measurements are the real resting positions.
    const cancelRunning=useCallback(()=>{
        nodes.current.forEach((node)=>{
            if(typeof node.getAnimations==='function'){
                const running=node.getAnimations();
                for(let i=0;i<running.length;i++){
                    running[i].cancel();
                }
            }
        });
    },[]);

    const measureAll=useCallback(()=>{
        const next=new Map();
        nodes.current.forEach((node,key)=>{
            next.set(key,measure(node));
        });
        return next;
    },[]);

    const snapshot=useCallback(()=>{
        cancelRunning();
        positions.current=measureAll();
    },[cancelRunning,measureAll]);

    useLayoutEffect(()=>{
        const reduce=prefersReducedMotion();
        const canAnimate=hasRendered.current&&!reduce&&typeof Element!=='undefined'&&typeof Element.prototype.animate==='function';
        if(lastResetKey.current!==resetKey){
            lastResetKey.current=resetKey;
            positions.current=new Map();
        }
        // Measure first (true positions), then animate. Saving these same numbers as
        // the next "before" avoids measuring cards mid-slide.
        cancelRunning();
        const current=measureAll();
        if(canAnimate){
            current.forEach((now,key)=>{
                const node=nodes.current.get(key);
                if(!node||!isNearViewport(now.viewTop,now.viewBottom)){
                    return;
                }
                const before=positions.current.get(key);
                if(before){
                    const dx=before.left-now.left;
                    const dy=before.top-now.top;
                    if(Math.abs(dx)>1||Math.abs(dy)>1){
                        node.animate(
                            [{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],
                            {duration:MOVE_MS,easing:EASE}
                        );
                    }
                }
                else{
                    node.animate(
                        [{opacity:0,transform:'translateY(12px) scale(0.98)'},{opacity:1,transform:'none'}],
                        {duration:ENTER_MS,easing:EASE}
                    );
                }
            });
        }
        hasRendered.current=true;
        positions.current=current;
    },[signature,resetKey,cancelRunning,measureAll]);

    // After a resize everything moves; re-measure so the next filter change starts from the truth.
    useEffect(()=>{
        let timer=null;
        const onResize=()=>{
            clearTimeout(timer);
            timer=setTimeout(snapshot,150);
        };
        window.addEventListener('resize',onResize);
        return ()=>{
            clearTimeout(timer);
            window.removeEventListener('resize',onResize);
        };
    },[snapshot]);

    return register;
};

export default useFlipAnimation;
