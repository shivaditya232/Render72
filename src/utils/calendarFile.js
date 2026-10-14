// Builds a standard .ics calendar file (works with Google Calendar, Apple Calendar, Outlook).
// Spec: RFC 5545 — CRLF line endings, escaped text, lines folded at 75 bytes.

import {getSlots} from './schedule';

const pad=(value)=>{
    return value<10?'0'+value:String(value);
};

// 20261113T123000Z (UTC, so every calendar app shows the right local time)
const toIcsTime=(ms)=>{
    const date=new Date(ms);
    return date.getUTCFullYear()+pad(date.getUTCMonth()+1)+pad(date.getUTCDate())+'T'+pad(date.getUTCHours())+pad(date.getUTCMinutes())+pad(date.getUTCSeconds())+'Z';
};

export const escapeIcsText=(text)=>{
    return String(text||'')
        .replace(/\\/g,'\\\\')
        .replace(/;/g,'\\;')
        .replace(/,/g,'\\,')
        .replace(/\r?\n/g,'\\n');
};

// Fold long lines: 75 bytes max, continuation lines start with a space.
export const foldIcsLine=(line)=>{
    const encoder=new TextEncoder();
    if(encoder.encode(line).length<=75){
        return line;
    }
    const parts=[];
    let current='';
    let currentBytes=0;
    const chars=Array.from(line);
    for(let i=0;i<chars.length;i++){
        const charBytes=encoder.encode(chars[i]).length;
        const limit=parts.length===0?75:74;
        if(currentBytes+charBytes>limit){
            parts.push(current);
            current='';
            currentBytes=0;
        }
        current=current+chars[i];
        currentBytes=currentBytes+charBytes;
    }
    parts.push(current);
    return parts.join('\r\n ');
};

export const buildCalendarFile=(events,siteOrigin)=>{
    const now=toIcsTime(Date.now());
    const lines=[
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Render72//Event Programme//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];
    for(let i=0;i<events.length;i++){
        const event=events[i];
        const slots=getSlots(event);
        let venue='';
        if(event.schedules&&event.schedules.length>0){
            venue=event.schedules[0].venue;
        }
        else if(event.mode==='ONLINE'){
            venue='Online';
        }
        for(let s=0;s<slots.length;s++){
            const slot=slots[s];
            const url=siteOrigin?siteOrigin+'/events/'+event.id:'';
            lines.push('BEGIN:VEVENT');
            lines.push('UID:'+event.id+'-'+s+'@render72');
            lines.push('DTSTAMP:'+now);
            lines.push('DTSTART:'+toIcsTime(slot.start));
            lines.push('DTEND:'+toIcsTime(slot.end));
            lines.push('SUMMARY:'+escapeIcsText(event.name+(slots.length>1?' (day '+(s+1)+')':'')));
            if(venue){
                lines.push('LOCATION:'+escapeIcsText(venue));
            }
            lines.push('DESCRIPTION:'+escapeIcsText(event.blurb+(url?'\n'+url:'')));
            if(url){
                lines.push('URL:'+url);
            }
            lines.push('END:VEVENT');
        }
    }
    lines.push('END:VCALENDAR');
    const folded=[];
    for(let i=0;i<lines.length;i++){
        folded.push(foldIcsLine(lines[i]));
    }
    return folded.join('\r\n')+'\r\n';
};

// Triggers the download in the browser.
export const downloadCalendarFile=(events,fileName)=>{
    const content=buildCalendarFile(events,window.location.origin);
    const blob=new Blob([content],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download=fileName||'render72-plan.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>{
        URL.revokeObjectURL(url);
    },1000);
};
