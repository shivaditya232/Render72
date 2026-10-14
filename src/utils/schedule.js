// Time-slot helpers for the plan: which saved events overlap?

import {getIstDateKey} from './formatters';

// The real sessions if we have them (detail page loaded), otherwise the overall span.
// Using sessions matters: a 3-day film sprint runs 10–5 each day, not non-stop.
export const getSlots=(event)=>{
    const slots=[];
    if(event.schedules&&event.schedules.length>0){
        for(let i=0;i<event.schedules.length;i++){
            const slot=event.schedules[i];
            if(slot.start!==null){
                slots.push({start:slot.start,end:slot.end!==null?slot.end:slot.start+60*60*1000});
            }
        }
        if(slots.length>0){
            return slots;
        }
    }
    if(event.start!==null){
        const end=event.end!==null?event.end:event.start+60*60*1000;
        slots.push({start:event.start,end});
    }
    return slots;
};

const slotsOverlap=(a,b)=>{
    return a.start<b.end&&b.start<a.end;
};

// Returns { [eventId]: [otherEvent, …] } for every pair whose sessions overlap.
export const findClashes=(events)=>{
    const clashes={};
    for(let i=0;i<events.length;i++){
        clashes[events[i].id]=[];
    }
    for(let i=0;i<events.length;i++){
        const slotsA=getSlots(events[i]);
        for(let j=i+1;j<events.length;j++){
            const slotsB=getSlots(events[j]);
            let overlap=false;
            for(let a=0;a<slotsA.length&&!overlap;a++){
                for(let b=0;b<slotsB.length&&!overlap;b++){
                    if(slotsOverlap(slotsA[a],slotsB[b])){
                        overlap=true;
                    }
                }
            }
            if(overlap){
                clashes[events[i].id].push(events[j]);
                clashes[events[j].id].push(events[i]);
            }
        }
    }
    return clashes;
};

// Groups events by IST day of their first session: [{key, start, events:[…]}]
export const groupByDay=(events)=>{
    const groups={};
    const keys=[];
    for(let i=0;i<events.length;i++){
        const event=events[i];
        const key=getIstDateKey(event.start)||'tba';
        if(!groups[key]){
            groups[key]={key,start:event.start,events:[]};
            keys.push(key);
        }
        groups[key].events.push(event);
    }
    keys.sort((a,b)=>{
        if(a==='tba'){
            return 1;
        }
        if(b==='tba'){
            return -1;
        }
        return a.localeCompare(b);
    });
    const result=[];
    for(let i=0;i<keys.length;i++){
        const group=groups[keys[i]];
        group.events.sort((a,b)=>{
            return (a.start||0)-(b.start||0);
        });
        result.push(group);
    }
    return result;
};
