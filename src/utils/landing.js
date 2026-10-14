// Pure selectors for the landing page: everything it shows is worked out
// from the live event list, so the numbers can never go stale.

import {TRACKS} from '../config/tracks';
import {getIstDateKey} from './formatters';
import {compareByStart} from '../models/eventModel';

// A "fest day" is a day with at least this many events.
// (Keeps one-off events, like a workshop weeks earlier, out of the fest window.)
const FEST_DAY_MIN_EVENTS=3;

// { days:[{key,start,events}], start, end, eventCount } or null when there is no fest window.
export const getFestWindow=(events)=>{
    const byDay={};
    const keys=[];
    for(let i=0;i<events.length;i++){
        const event=events[i];
        const key=getIstDateKey(event.start);
        if(!key){
            continue;
        }
        if(!byDay[key]){
            byDay[key]={key,start:event.start,events:[]};
            keys.push(key);
        }
        byDay[key].events.push(event);
    }
    keys.sort();
    const days=[];
    for(let i=0;i<keys.length;i++){
        const day=byDay[keys[i]];
        if(day.events.length>=FEST_DAY_MIN_EVENTS){
            day.events.sort(compareByStart);
            day.start=day.events[0].start;
            days.push(day);
        }
    }
    if(days.length===0){
        return null;
    }
    let end=null;
    let eventCount=0;
    for(let i=0;i<days.length;i++){
        eventCount=eventCount+days[i].events.length;
        for(let j=0;j<days[i].events.length;j++){
            const event=days[i].events[j];
            const finish=event.end!==null?event.end:event.start;
            if(end===null||finish>end){
                end=finish;
            }
        }
    }
    return {days,start:days[0].start,end,eventCount};
};

// One entry per track: how many upcoming events, and which poster represents it
// (a featured event if the track has one, otherwise its soonest event with a photo,
// otherwise any of its events with a photo).
export const getTrackSummaries=(events)=>{
    const summaries=[];
    for(let t=0;t<TRACKS.length;t++){
        const track=TRACKS[t];
        const inTrack=[];
        for(let i=0;i<events.length;i++){
            if(events[i].track.id===track.id&&!events[i].isPast){
                inTrack.push(events[i]);
            }
        }
        inTrack.sort(compareByStart);
        let cover=null;
        for(let i=0;i<inTrack.length&&!cover;i++){
            if(inTrack[i].isFeatured&&inTrack[i].cover.url){
                cover=inTrack[i];
            }
        }
        for(let i=0;i<inTrack.length&&!cover;i++){
            if(inTrack[i].cover.url){
                cover=inTrack[i];
            }
        }
        // Nothing upcoming (say, after the fest): still show the track's face, from any event.
        for(let i=0;i<events.length&&!cover;i++){
            if(events[i].track.id===track.id&&events[i].cover.url){
                cover=events[i];
            }
        }
        summaries.push({track,count:inTrack.length,cover});
    }
    return summaries;
};

// Events you can still register for, deadline soonest first.
export const getClosingSoon=(events,limit)=>{
    const open=[];
    for(let i=0;i<events.length;i++){
        if(events[i].canRegister&&events[i].registrationDeadline!==null){
            open.push(events[i]);
        }
    }
    open.sort((a,b)=>{
        if(a.registrationDeadline!==b.registrationDeadline){
            return a.registrationDeadline-b.registrationDeadline;
        }
        return compareByStart(a,b);
    });
    return open.slice(0,limit);
};

export const getFeatured=(events)=>{
    const featured=[];
    for(let i=0;i<events.length;i++){
        if(events[i].isFeatured&&!events[i].isPast){
            featured.push(events[i]);
        }
    }
    featured.sort(compareByStart);
    return featured;
};

// The numbers in the stats strip, for the fest window.
export const getProgrammeStats=(events,festWindow)=>{
    const pool=festWindow?[]:events;
    if(festWindow){
        for(let d=0;d<festWindow.days.length;d++){
            for(let i=0;i<festWindow.days[d].events.length;i++){
                pool.push(festWindow.days[d].events[i]);
            }
        }
    }
    let seatsOpen=0;
    let free=0;
    let workshops=0;
    const tracks=new Set();
    for(let i=0;i<pool.length;i++){
        const event=pool[i];
        if(event.canRegister&&event.seatsLeft!==null){
            seatsOpen=seatsOpen+event.seatsLeft;
        }
        if(event.price===0){
            free=free+1;
        }
        if(event.type==='WORKSHOP'){
            workshops=workshops+1;
        }
        tracks.add(event.track.id);
    }
    return {
        events:pool.length,
        days:festWindow?festWindow.days.length:0,
        tracks:tracks.size,
        seatsOpen,
        free,
        workshops
    };
};

// Spells small numbers out for the headline ("Three days"), digits otherwise.
const NUMBER_WORDS=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];

export const toHeadlineNumber=(value)=>{
    if(Number.isInteger(value)&&value>=0&&value<NUMBER_WORDS.length){
        return NUMBER_WORDS[value];
    }
    return String(value);
};

// Poster numbers follow the full programme order, so "No. 07" is the same
// event on every page and never changes while filtering.
export const getPosterNumbers=(events)=>{
    const ordered=events.slice().sort(compareByStart);
    const numbers={};
    for(let i=0;i<ordered.length;i++){
        numbers[ordered[i].id]=i+1;
    }
    return numbers;
};
