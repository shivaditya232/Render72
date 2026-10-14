// Pure filtering, counting and sorting for the events page.
// No React here, so every rule can be unit-tested on its own.

import {FACETS,SORTS,DEFAULT_SORT,DEFAULT_WHEN,MAX_QUERY_LENGTH} from '../config/filterOptions';
import {compareByStart} from '../models/eventModel';
import {getIstDateKey} from './formatters';

const DATE_KEY_PATTERN=/^\d{4}-\d{2}-\d{2}$/;

// ---------- state <-> URL ----------

export const createEmptyFacets=()=>{
    const facets={};
    for(let i=0;i<FACETS.length;i++){
        facets[FACETS[i].key]=[];
    }
    return facets;
};

export const createDefaultState=()=>{
    return {q:'',when:DEFAULT_WHEN,date:'',sort:DEFAULT_SORT,facets:createEmptyFacets()};
};

const isKnownSort=(value)=>{
    for(let i=0;i<SORTS.length;i++){
        if(SORTS[i].value===value){
            return true;
        }
    }
    return false;
};

// Reads ?q=&when=&date=&sort=&track=code,stage… and ignores anything invalid,
// so a hand-edited or old link can never break the page.
export const parseFilterState=(searchParams)=>{
    const state=createDefaultState();
    if(!searchParams){
        return state;
    }
    const q=searchParams.get('q');
    if(q){
        state.q=q.slice(0,MAX_QUERY_LENGTH);
    }
    const when=searchParams.get('when');
    if(when==='past'||when==='upcoming'){
        state.when=when;
    }
    const date=searchParams.get('date');
    if(date&&DATE_KEY_PATTERN.test(date)){
        state.date=date;
    }
    const sort=searchParams.get('sort');
    if(sort&&isKnownSort(sort)){
        state.sort=sort;
    }
    for(let i=0;i<FACETS.length;i++){
        const facet=FACETS[i];
        const raw=searchParams.get(facet.key);
        if(!raw){
            continue;
        }
        const wanted=raw.split(',');
        for(let j=0;j<facet.options.length;j++){
            const value=facet.options[j].value;
            if(wanted.includes(value)){
                state.facets[facet.key].push(value);
            }
        }
    }
    return state;
};

// Only non-default values go into the URL, so a plain /events stays plain.
export const serializeFilterState=(state)=>{
    const params={};
    const q=state.q.trim();
    if(q!==''){
        params.q=q;
    }
    if(state.when!==DEFAULT_WHEN){
        params.when=state.when;
    }
    if(state.date){
        params.date=state.date;
    }
    if(state.sort!==DEFAULT_SORT){
        params.sort=state.sort;
    }
    for(let i=0;i<FACETS.length;i++){
        const key=FACETS[i].key;
        if(state.facets[key].length>0){
            params[key]=state.facets[key].join(',');
        }
    }
    return params;
};

// ---------- matching ----------

// "Café" and "cafe" should match; so should "ai" and "AI".
export const normalizeSearchText=(text)=>{
    return String(text||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
};

export const getQueryTokens=(q)=>{
    const tokens=normalizeSearchText(q).split(/\s+/);
    const result=[];
    for(let i=0;i<tokens.length;i++){
        if(tokens[i]!==''){
            result.push(tokens[i]);
        }
    }
    return result;
};

const searchCache=new WeakMap();

const getSearchText=(event)=>{
    let text=searchCache.get(event);
    if(text===undefined){
        text=normalizeSearchText(event.searchText);
        searchCache.set(event,text);
    }
    return text;
};

export const matchesQuery=(event,tokens)=>{
    if(tokens.length===0){
        return true;
    }
    const text=getSearchText(event);
    for(let i=0;i<tokens.length;i++){
        if(!text.includes(tokens[i])){
            return false;
        }
    }
    return true;
};

const findFacet=(key)=>{
    for(let i=0;i<FACETS.length;i++){
        if(FACETS[i].key===key){
            return FACETS[i];
        }
    }
    return null;
};

const findOption=(facet,value)=>{
    for(let i=0;i<facet.options.length;i++){
        if(facet.options[i].value===value){
            return facet.options[i];
        }
    }
    return null;
};

// skipKey lets us ask "what would match if this one facet were ignored?" (for live counts).
export const matchesFacets=(event,facets,skipKey)=>{
    for(let i=0;i<FACETS.length;i++){
        const facet=FACETS[i];
        if(facet.key===skipKey){
            continue;
        }
        const selected=facets[facet.key];
        if(!selected||selected.length===0){
            continue;
        }
        let anyMatch=false;
        for(let j=0;j<selected.length;j++){
            const option=findOption(facet,selected[j]);
            if(option&&option.test(event)){
                anyMatch=true;
                break;
            }
        }
        if(!anyMatch){
            return false;
        }
    }
    return true;
};

export const matchesWhen=(event,when)=>{
    if(when==='past'){
        return event.isPast;
    }
    return !event.isPast;
};

export const matchesDate=(event,date)=>{
    if(!date){
        return true;
    }
    return getIstDateKey(event.start)===date;
};

// skip: {facet, when, date, q} — parts of the state to ignore.
const matchesState=(event,state,tokens,skip)=>{
    const ignore=skip||{};
    if(!ignore.when&&!matchesWhen(event,state.when)){
        return false;
    }
    if(!ignore.date&&!matchesDate(event,state.date)){
        return false;
    }
    if(!ignore.q&&!matchesQuery(event,tokens)){
        return false;
    }
    return matchesFacets(event,state.facets,ignore.facet);
};

// ---------- sorting ----------

const compareNullableNumbers=(a,b)=>{
    if(a===null&&b===null){
        return 0;
    }
    if(a===null){
        return 1;
    }
    if(b===null){
        return -1;
    }
    return a-b;
};

export const sortEvents=(events,sort,when)=>{
    const list=events.slice();
    if(sort==='closing'){
        list.sort((a,b)=>{
            if(a.canRegister!==b.canRegister){
                return a.canRegister?-1:1;
            }
            const byDeadline=compareNullableNumbers(a.registrationDeadline,b.registrationDeadline);
            if(byDeadline!==0){
                return byDeadline;
            }
            return compareByStart(a,b);
        });
        return list;
    }
    if(sort==='seats'){
        list.sort((a,b)=>{
            if(a.canRegister!==b.canRegister){
                return a.canRegister?-1:1;
            }
            const bySeats=compareNullableNumbers(a.seatsLeft,b.seatsLeft);
            if(bySeats!==0){
                return bySeats;
            }
            return compareByStart(a,b);
        });
        return list;
    }
    if(sort==='price'){
        list.sort((a,b)=>{
            const byPrice=compareNullableNumbers(a.price,b.price);
            if(byPrice!==0){
                return byPrice;
            }
            return compareByStart(a,b);
        });
        return list;
    }
    // Soonest first for upcoming; most recent first for past events.
    list.sort(compareByStart);
    if(when==='past'){
        list.reverse();
    }
    return list;
};

// ---------- the main entry points ----------

export const applyFilters=(events,state)=>{
    const tokens=getQueryTokens(state.q);
    const result=[];
    for(let i=0;i<events.length;i++){
        if(matchesState(events[i],state,tokens)){
            result.push(events[i]);
        }
    }
    return sortEvents(result,state.sort,state.when);
};

// For each option: how many events you'd see with only that option chosen in its facet
// (everything else as it is). Lets chips show honest numbers and avoid dead ends.
export const getFacetCounts=(events,state)=>{
    const tokens=getQueryTokens(state.q);
    const counts={};
    for(let i=0;i<FACETS.length;i++){
        const facet=FACETS[i];
        counts[facet.key]={};
        for(let j=0;j<facet.options.length;j++){
            counts[facet.key][facet.options[j].value]=0;
        }
        for(let e=0;e<events.length;e++){
            const event=events[e];
            if(!matchesState(event,state,tokens,{facet:facet.key})){
                continue;
            }
            for(let j=0;j<facet.options.length;j++){
                const option=facet.options[j];
                if(option.test(event)){
                    counts[facet.key][option.value]=counts[facet.key][option.value]+1;
                }
            }
        }
    }
    return counts;
};

export const getWhenCounts=(events,state)=>{
    const tokens=getQueryTokens(state.q);
    const counts={upcoming:0,past:0};
    for(let i=0;i<events.length;i++){
        const event=events[i];
        if(!matchesState(event,state,tokens,{when:true,date:true})){
            continue;
        }
        if(event.isPast){
            counts.past=counts.past+1;
        }
        else{
            counts.upcoming=counts.upcoming+1;
        }
    }
    return counts;
};

// The date strip: one entry per day that has events in the current tab.
export const getDateBuckets=(events,state)=>{
    const tokens=getQueryTokens(state.q);
    const byKey={};
    const keys=[];
    for(let i=0;i<events.length;i++){
        const event=events[i];
        if(!matchesWhen(event,state.when)){
            continue;
        }
        const key=getIstDateKey(event.start);
        if(!key){
            continue;
        }
        if(!byKey[key]){
            byKey[key]={key,start:event.start,count:0,total:0};
            keys.push(key);
        }
        byKey[key].total=byKey[key].total+1;
        if(matchesState(event,state,tokens,{date:true})){
            byKey[key].count=byKey[key].count+1;
        }
    }
    keys.sort();
    if(state.when==='past'){
        keys.reverse();
    }
    const result=[];
    for(let i=0;i<keys.length;i++){
        result.push(byKey[keys[i]]);
    }
    return result;
};

// A flat list of what's switched on, for the "active filters" row and the empty state.
export const getActiveFilters=(state)=>{
    const active=[];
    if(state.q.trim()!==''){
        active.push({type:'q',label:'“'+state.q.trim()+'”'});
    }
    if(state.date){
        active.push({type:'date',label:state.date});
    }
    for(let i=0;i<FACETS.length;i++){
        const facet=FACETS[i];
        const selected=state.facets[facet.key];
        for(let j=0;j<selected.length;j++){
            const option=findOption(facet,selected[j]);
            if(option){
                active.push({type:'facet',key:facet.key,value:option.value,label:option.label});
            }
        }
    }
    return active;
};

export const removeActiveFilter=(state,filter)=>{
    const next={...state,facets:{...state.facets}};
    if(filter.type==='q'){
        next.q='';
    }
    else if(filter.type==='date'){
        next.date='';
    }
    else if(filter.type==='facet'){
        const kept=[];
        const current=state.facets[filter.key];
        for(let i=0;i<current.length;i++){
            if(current[i]!==filter.value){
                kept.push(current[i]);
            }
        }
        next.facets[filter.key]=kept;
    }
    return next;
};

// When nothing matches: which single filter, if removed, brings back the most events?
export const suggestRelaxation=(events,state)=>{
    const active=getActiveFilters(state);
    let best=null;
    for(let i=0;i<active.length;i++){
        const nextState=removeActiveFilter(state,active[i]);
        const count=applyFilters(events,nextState).length;
        if(count>0&&(!best||count>best.count)){
            best={filter:active[i],count,nextState};
        }
    }
    return best;
};

export const toggleFacetValue=(state,key,value)=>{
    const facet=findFacet(key);
    if(!facet||!findOption(facet,value)){
        return state;
    }
    const current=state.facets[key];
    const next=[];
    let removed=false;
    for(let i=0;i<current.length;i++){
        if(current[i]===value){
            removed=true;
        }
        else{
            next.push(current[i]);
        }
    }
    if(!removed){
        next.push(value);
    }
    return {...state,facets:{...state.facets,[key]:next}};
};

export const countActiveFacets=(state)=>{
    let total=0;
    for(let i=0;i<FACETS.length;i++){
        total=total+state.facets[FACETS[i].key].length;
    }
    return total;
};
