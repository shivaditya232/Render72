import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {useSearchParams} from 'react-router';
import {parseFilterState,serializeFilterState,createDefaultState,applyFilters,getFacetCounts,getWhenCounts,getDateBuckets,getActiveFilters,suggestRelaxation,toggleFacetValue,removeActiveFilter,countActiveFacets} from '../utils/filterEvents';

const SEARCH_DEBOUNCE_MS=180;

// Controller for the events page filters.
// The URL is the single source of truth, so any filtered view can be shared or bookmarked.
// Changes replace the history entry instead of adding one, so Back still leaves the page
// rather than stepping through every keystroke.
const useEventFilters=(events)=>{
    const [searchParams,setSearchParams]=useSearchParams();
    const state=useMemo(()=>{
        return parseFilterState(searchParams);
    },[searchParams]);

    // The search box updates instantly; the URL catches up a moment later.
    const [queryInput,setQueryInput]=useState(state.q);
    const debounceTimer=useRef(null);
    const isTyping=useRef(false);
    // Latest state for the delayed search commit, so it never overwrites a newer filter change.
    const stateRef=useRef(state);
    stateRef.current=state;

    // If the URL changes from outside (back button, a link), sync the box —
    // but never while the visitor is mid-typing.
    useEffect(()=>{
        if(!isTyping.current){
            setQueryInput(state.q);
        }
    },[state.q]);

    useEffect(()=>{
        return ()=>{
            clearTimeout(debounceTimer.current);
        };
    },[]);

    const commit=useCallback((nextState)=>{
        setSearchParams(serializeFilterState(nextState),{replace:true,preventScrollReset:true});
    },[setSearchParams]);

    const setQuery=useCallback((text)=>{
        setQueryInput(text);
        isTyping.current=true;
        clearTimeout(debounceTimer.current);
        debounceTimer.current=setTimeout(()=>{
            isTyping.current=false;
            commit({...stateRef.current,q:text});
        },SEARCH_DEBOUNCE_MS);
    },[commit]);

    const setWhen=useCallback((when)=>{
        // Dates differ between tabs, so a chosen date doesn't carry across.
        commit({...state,when,date:''});
    },[commit,state]);

    const setDate=useCallback((date)=>{
        commit({...state,date:state.date===date?'':date});
    },[commit,state]);

    const setSort=useCallback((sort)=>{
        commit({...state,sort});
    },[commit,state]);

    const toggleOption=useCallback((key,value)=>{
        commit(toggleFacetValue(state,key,value));
    },[commit,state]);

    const removeFilter=useCallback((filter)=>{
        commit(removeActiveFilter(state,filter));
    },[commit,state]);

    const clearAll=useCallback(()=>{
        clearTimeout(debounceTimer.current);
        isTyping.current=false;
        setQueryInput('');
        commit({...createDefaultState(),when:state.when,sort:state.sort});
    },[commit,state]);

    const applyState=useCallback((nextState)=>{
        commit(nextState);
    },[commit]);

    const results=useMemo(()=>{
        return applyFilters(events,state);
    },[events,state]);

    const facetCounts=useMemo(()=>{
        return getFacetCounts(events,state);
    },[events,state]);

    const whenCounts=useMemo(()=>{
        return getWhenCounts(events,state);
    },[events,state]);

    const dateBuckets=useMemo(()=>{
        return getDateBuckets(events,state);
    },[events,state]);

    const activeFilters=useMemo(()=>{
        return getActiveFilters(state);
    },[state]);

    const suggestion=useMemo(()=>{
        if(results.length>0||events.length===0){
            return null;
        }
        return suggestRelaxation(events,state);
    },[events,state,results.length]);

    return {
        state,
        queryInput,
        results,
        facetCounts,
        whenCounts,
        dateBuckets,
        activeFilters,
        activeFacetCount:countActiveFacets(state),
        suggestion,
        setQuery,
        setWhen,
        setDate,
        setSort,
        toggleOption,
        removeFilter,
        clearAll,
        applyState
    };
};

export default useEventFilters;
