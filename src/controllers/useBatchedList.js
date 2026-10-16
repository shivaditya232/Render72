import {useCallback,useEffect,useRef,useState} from 'react';

const STORAGE_PREFIX='r72:shown:';

const readSaved=(key,fallback)=>{
    try{
        const value=Number(window.sessionStorage.getItem(STORAGE_PREFIX+key));
        if(Number.isInteger(value)&&value>fallback){
            return value;
        }
    }
    catch(error){
        // Storage blocked: start with one batch.
    }
    return fallback;
};

const writeSaved=(key,value)=>{
    try{
        window.sessionStorage.setItem(STORAGE_PREFIX+key,String(value));
    }
    catch(error){
        // Storage blocked: nothing to remember, that's fine.
    }
};

// Shows a long list in batches: the first batch straight away, the next one when the
// visitor scrolls near the end (or presses "Show more"). Keeps the page light however
// big the programme grows.
//   items      the full, already filtered and sorted list
//   batchSize  how many to add at a time
//   resetKey   when this changes (new search or filter) we go back to one batch
//   storageKey how far the visitor got is remembered for the tab, so coming back to the
//              list restores the same length and the same scroll position
const useBatchedList=(items,batchSize,resetKey,storageKey)=>{
    const [count,setCount]=useState(()=>{
        return readSaved(storageKey,batchSize);
    });
    const sentinelRef=useRef(null);
    const previousKey=useRef(resetKey);

    useEffect(()=>{
        if(previousKey.current!==resetKey){
            previousKey.current=resetKey;
            setCount(batchSize);
        }
    },[resetKey,batchSize]);

    useEffect(()=>{
        writeSaved(storageKey,count);
    },[storageKey,count]);

    const hasMore=count<items.length;

    const showMore=useCallback(()=>{
        setCount((previous)=>{
            return previous+batchSize;
        });
    },[batchSize]);

    // Load the next batch a little before the end of the list comes into view.
    useEffect(()=>{
        const sentinel=sentinelRef.current;
        if(!hasMore||!sentinel||typeof IntersectionObserver!=='function'){
            return undefined;
        }
        const observer=new IntersectionObserver((entries)=>{
            if(entries[0]&&entries[0].isIntersecting){
                showMore();
            }
        },{rootMargin:'0px 0px 700px 0px'});
        observer.observe(sentinel);
        return ()=>{
            observer.disconnect();
        };
    },[hasMore,showMore,count]);

    let visible=items;
    if(hasMore){
        visible=items.slice(0,count);
    }
    return {visible,hasMore,remaining:Math.max(0,items.length-count),showMore,sentinelRef};
};

export default useBatchedList;
