import {useCallback,useEffect,useRef,useState} from 'react';
import {getEventById,getBackupEvent} from '../models/eventModel';
import {createRequestError} from '../models/httpClient';
import {SHOW_BACKUP_AFTER_MS} from '../config/apiConfig';

// Controller for one event page.
// "initial" comes from the route loader: the cached full event, or the short summary
// from the list, so the page can draw immediately while the rest loads.
//
// status: 'loading' | 'ready' | 'not_found' | 'error'
// partial: true when only the summary is shown (details couldn't load yet)
const makeState=(initial)=>{
    if(initial&&initial.event){
        return {
            status:'ready',
            event:initial.event,
            partial:Boolean(initial.partial),
            source:initial.source||'cache',
            savedAt:null,
            error:null,
            attempt:0,
            isRefreshing:true
        };
    }
    return {status:'loading',event:null,partial:false,source:null,savedAt:null,error:null,attempt:0,isRefreshing:false};
};

const useEventDetail=(id,initial)=>{
    const [state,setState]=useState(()=>makeState(initial));
    const stateRef=useRef(state);
    stateRef.current=state;
    const controllerRef=useRef(null);

    const load=useCallback(async (force)=>{
        if(controllerRef.current){
            controllerRef.current.abort();
        }
        const controller=new AbortController();
        controllerRef.current=controller;
        setState((previous)=>{
            if(previous.event){
                return {...previous,isRefreshing:true};
            }
            return {...previous,status:'loading',error:null,attempt:0};
        });
        try{
            const result=await getEventById(id,{
                force,
                signal:controller.signal,
                onAttempt:(attempt)=>{
                    if(!controller.signal.aborted){
                        setState((previous)=>{
                            return {...previous,attempt};
                        });
                    }
                }
            });
            if(controller.signal.aborted){
                return;
            }
            setState({
                status:'ready',
                event:result.event,
                partial:result.partial,
                source:result.source,
                savedAt:result.savedAt,
                error:result.error,
                attempt:0,
                isRefreshing:false
            });
        }
        catch(error){
            if(controller.signal.aborted||error.kind==='aborted'){
                return;
            }
            if(error.kind==='not_found'){
                setState({status:'not_found',event:null,partial:false,source:null,savedAt:null,error,attempt:0,isRefreshing:false});
                return;
            }
            setState((previous)=>{
                if(previous.event){
                    return {...previous,error,isRefreshing:false,attempt:0};
                }
                return {...previous,status:'error',error,isRefreshing:false,attempt:0};
            });
        }
    },[id]);

    // A new id (e.g. "next event" link) starts fresh from the new initial data.
    const previousId=useRef(id);
    useEffect(()=>{
        if(previousId.current!==id){
            previousId.current=id;
            setState(makeState(initial));
        }
        load(false);
        return ()=>{
            if(controllerRef.current){
                controllerRef.current.abort();
            }
        };
        // initial only matters when the id changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[id,load]);

    // Nothing on screen and the server is slow: after a few seconds show the saved copy
    // of this event while the request keeps going (the live version replaces it).
    useEffect(()=>{
        if(state.status!=='loading'){
            return undefined;
        }
        let cancelled=false;
        const timer=setTimeout(async ()=>{
            const backup=await getBackupEvent(id);
            if(cancelled||!backup){
                return;
            }
            setState((previous)=>{
                if(previous.status!=='loading'){
                    return previous;
                }
                return {
                    status:'ready',
                    event:backup.event,
                    partial:backup.partial,
                    source:backup.source,
                    savedAt:backup.savedAt,
                    error:createRequestError('slow','The server is taking too long'),
                    attempt:previous.attempt,
                    isRefreshing:true
                };
            });
        },SHOW_BACKUP_AFTER_MS);
        return ()=>{
            cancelled=true;
            clearTimeout(timer);
        };
    },[state.status,id]);

    useEffect(()=>{
        const onOnline=()=>{
            const current=stateRef.current;
            if(current.partial||current.status==='error'||current.source!=='network'){
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

export default useEventDetail;
