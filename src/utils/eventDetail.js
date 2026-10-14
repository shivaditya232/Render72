// Everything the event page works out from one clean event:
// which sections exist, the prize podium, the gallery facts and related events.
// Kept out of the views so it can be unit tested.

import {getSessions,findClashes} from './schedule';
import {compareByStart} from '../models/eventModel';
import {formatTeamSize,formatSpan,formatTimeRange} from './formatters';

// The sections that can appear, in page order. Each one only shows when it has content.
const SECTION_LABELS={
    about:'About',
    schedule:'Schedule',
    prizes:'Prizes',
    entry:'Who can enter',
    rules:'Rules',
    gallery:'Gallery',
    faq:'FAQ',
    people:'Organisers'
};

// Description text → paragraphs (blank lines split them).
export const splitParagraphs=(text)=>{
    if(typeof text!=='string'||text.trim()===''){
        return [];
    }
    const parts=text.split(/\n\s*\n/);
    const result=[];
    for(let i=0;i<parts.length;i++){
        const part=parts[i].trim();
        if(part!==''){
            result.push(part);
        }
    }
    return result;
};

// Sessions to show. The short summary has no schedule, so fall back to the overall span.
export const getDisplaySessions=(event)=>{
    const sessions=getSessions(event);
    if(sessions.length>0){
        return sessions;
    }
    if(event&&event.start!==null){
        return [{start:event.start,end:event.end,venue:null,isOvernight:false}];
    }
    return [];
};

// Where it happens, in one line.
export const getVenueText=(event)=>{
    if(!event){
        return '';
    }
    if(event.mode==='ONLINE'){
        return 'Online';
    }
    const sessions=getSessions(event);
    if(sessions.length>0&&sessions[0].venue){
        return sessions[0].venue;
    }
    return 'On campus';
};

// [{id, label}] for the section pills, only for sections with something in them.
export const getDetailSections=(event)=>{
    const sections=[];
    if(!event){
        return sections;
    }
    const add=(id)=>{
        sections.push({id,label:SECTION_LABELS[id]});
    };
    add('about');
    if(getDisplaySessions(event).length>0){
        add('schedule');
    }
    if(event.prizes.length>0){
        add('prizes');
    }
    if(event.eligibility.length>0||event.prerequisites.length>0){
        add('entry');
    }
    if(event.rules.length>0){
        add('rules');
    }
    if(event.gallery.length>0){
        add('gallery');
    }
    if(event.faqs.length>0){
        add('faq');
    }
    if(event.organizers.length>0||event.coordinators.length>0){
        add('people');
    }
    return sections;
};

// Podium order on screen is 2nd, 1st, 3rd: the winner stands in the middle, tallest.
// Anything past third and the unranked special awards are listed under the podium.
export const getPrizeLayout=(prizes)=>{
    const ranked=[];
    const special=[];
    for(let i=0;i<prizes.length;i++){
        if(prizes[i].isSpecial){
            special.push(prizes[i]);
        }
        else{
            ranked.push(prizes[i]);
        }
    }
    const top=ranked.slice(0,3);
    const podium=[];
    if(top.length===1){
        podium.push({prize:top[0],place:1});
    }
    else if(top.length===2){
        podium.push({prize:top[1],place:2});
        podium.push({prize:top[0],place:1});
    }
    else if(top.length===3){
        podium.push({prize:top[1],place:2});
        podium.push({prize:top[0],place:1});
        podium.push({prize:top[2],place:3});
    }
    let pool=0;
    for(let i=0;i<prizes.length;i++){
        pool=pool+(prizes[i].amount||0);
    }
    return {podium,rest:ranked.slice(3),special,pool};
};

// Big facts for the gallery's text tiles. Up to two, most interesting first.
export const getGalleryFacts=(event)=>{
    const facts=[];
    if(event.prizePool>0){
        facts.push({value:'₹'+event.prizePool.toLocaleString('en-IN'),label:'in prizes'});
    }
    const sessions=getSessions(event);
    if(sessions.length>1){
        facts.push({value:String(sessions.length),label:'sessions over the fest'});
    }
    else if(sessions.length===1&&sessions[0].isOvernight){
        facts.push({value:'Overnight',label:'one long session'});
    }
    const team=formatTeamSize(event.minTeam,event.maxTeam);
    if(team!==''){
        facts.push({value:team,label:event.maxTeam===1?'entry':'per entry'});
    }
    if(event.totalSeats){
        facts.push({value:String(event.totalSeats),label:event.maxTeam===1?'places':'entries in total'});
    }
    return facts.slice(0,2);
};

// Other upcoming events, same track first, soonest first.
export const getRelatedEvents=(events,current,limit)=>{
    if(!current||!Array.isArray(events)){
        return [];
    }
    const sameTrack=[];
    const others=[];
    for(let i=0;i<events.length;i++){
        const event=events[i];
        if(event.id===current.id||event.isPast){
            continue;
        }
        if(event.track.id===current.track.id){
            sameTrack.push(event);
        }
        else{
            others.push(event);
        }
    }
    sameTrack.sort(compareByStart);
    others.sort(compareByStart);
    const result=sameTrack.slice(0,limit);
    for(let i=0;i<others.length&&result.length<limit;i++){
        result.push(others[i]);
    }
    return result;
};

// Saved events (other than this one) whose sessions overlap with this event.
export const getPlanClashes=(event,plannedEvents)=>{
    if(!event||event.isPast){
        return [];
    }
    const list=[event];
    for(let i=0;i<plannedEvents.length;i++){
        if(plannedEvents[i].id!==event.id){
            list.push(plannedEvents[i]);
        }
    }
    const clashes=findClashes(list);
    return clashes[event.id]||[];
};

// What a coordinator's contact is: an email, a phone number, or neither.
export const getContactLink=(contact)=>{
    if(typeof contact!=='string'||contact.trim()===''){
        return null;
    }
    const text=contact.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)){
        return {href:'mailto:'+text,label:text};
    }
    const digits=text.replace(/[^\d+]/g,'');
    if(digits.length>=8&&digits.length<=15){
        return {href:'tel:'+digits,label:text};
    }
    return {href:null,label:text};
};

// File name for the calendar download: 'frame-forty-eight-short-film-sprint.ics'
export const getCalendarFileName=(name)=>{
    const slug=String(name||'event').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
    return (slug||'event')+'.ics';
};

// The time line under the title. A 3-day sprint that runs 10–5 each day says
// "10:00 AM – 5:00 PM, 3 days", not "Fri 10:00 AM – Sun 5:00 PM" (which reads as non-stop).
export const getTimeSummary=(event)=>{
    const sessions=getDisplaySessions(event);
    if(sessions.length===0){
        return '';
    }
    if(sessions.length===1){
        const span=formatSpan(sessions[0].start,sessions[0].end);
        return span?span+' IST':'';
    }
    const first=formatTimeRange(sessions[0].start,sessions[0].end);
    let sameHours=true;
    for(let i=1;i<sessions.length;i++){
        if(formatTimeRange(sessions[i].start,sessions[i].end)!==first){
            sameHours=false;
        }
    }
    if(sameHours&&first){
        return first+' IST, '+sessions.length+' days';
    }
    return sessions.length+' sessions, see the schedule';
};
