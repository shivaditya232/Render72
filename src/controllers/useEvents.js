import {useCallback,useEffect,useRef,useState} from 'react';
import {getAllEvents,getCachedEvents} from '../models/eventModel';

// Controller for the events list.
// Shows cached data instantly (no spinner on repeat visits), refreshes it in the
// background when it's old, and reloads by itself when the connection comes back.
//
// status: 'loading' (nothing to show yet) | 'ready' | 'error' (nothing to show at all)
// source: 'network' | 'cache' | 'fallback'
const makeInitialState=()=>{
    const cached=getCachedEvents();
    if(cached){
        return {
            status:'ready',
            events:cached.events,
            source:'cache',
            savedAt:cached.savedAt,
            error:null,
            attempt:0,
            isRefreshing:!cached.isFresh
        };
    }
    return {status:'loading',events:[],source:null,savedAt:null,error:null,attempt:0,isRefreshing:false};
};

const useEvents=()=>{
    const [state,setState]=useState(makeInitialState);
    const isMounted=useRef(true);
    const requestNumber=useRef(0);
    // Latest state, readable from event listeners without re-subscribing.
    const stateRef=useRef(state);
    stateRef.current=state;

    const load=useCallback(async (force)=>{
        requestNumber.current=requestNumber.current+1;
        const thisRequest=requestNumber.current;
        setState((previous)=>{
            if(previous.events.length>0){
                return {...previous,isRefreshing:true};
            }
            return {...previous,status:'loading',error:null,attempt:0};
        });
        try{
            const result=await getAllEvents({
                force,
                onAttempt:(attempt)=>{
                    if(isMounted.current&&thisRequest===requestNumber.current){
                        setState((previous)=>{
                            return {...previous,attempt};
                        });
                    }
                }
            });
            if(!isMounted.current||thisRequest!==requestNumber.current){
                return;
            }
            setState({
                status:'ready',
                events:result.events,
                source:result.source,
                savedAt:result.savedAt,
                error:result.error,
                attempt:0,
                isRefreshing:false
            });
        }
        catch(error){
            if(!isMounted.current||thisRequest!==requestNumber.current){
                return;
            }
            setState((previous)=>{
                if(previous.events.length>0){
                    return {...previous,error,isRefreshing:false,attempt:0};
                }
                return {...previous,status:'error',error,isRefreshing:false,attempt:0};
            });
        }
    },[]);

    // First load: if the cache is fresh we're done; otherwise ask the network.
    useEffect(()=>{
        isMounted.current=true;
        const cached=getCachedEvents();
        if(!cached||!cached.isFresh){
            load(false);
        }
        return ()=>{
            isMounted.current=false;
        };
    },[load]);

    // Connection came back: if we're showing old or bundled data, refresh it.
    useEffect(()=>{
        const onOnline=()=>{
            const current=stateRef.current;
            if(current.source!=='network'||current.status==='error'){
                load(true);
            }
        };
        window.addEventListener('online',onOnline);
        return ()=>{
            window.removeEventListener('online',onOnline);
        };
    },[load]);

    const retry=useCallback(()=>{
        load(true);
    },[load]);

    return {...state,retry};
};

export default useEvents;
