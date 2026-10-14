// Turning raw values into the words people actually read.
// All dates and times are shown in Indian Standard Time, whatever the visitor's own clock says.

import {TIME_ZONE} from '../config/apiConfig';

const MINUTE=60*1000;
const HOUR=60*MINUTE;
const DAY=24*HOUR;

const makeFormatter=(options)=>{
    return new Intl.DateTimeFormat('en-IN',{timeZone:TIME_ZONE,...options});
};

const weekdayFormatter=makeFormatter({weekday:'short'});
const dayFormatter=makeFormatter({day:'numeric'});
const monthFormatter=makeFormatter({month:'short'});
const yearFormatter=makeFormatter({year:'numeric'});
const timeFormatter=makeFormatter({hour:'numeric',minute:'2-digit',hour12:true});
const dateKeyFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'});

const isValidTime=(ms)=>{
    return typeof ms==='number'&&Number.isFinite(ms);
};

// { weekday:'Fri', day:'13', month:'Nov', year:'2026' }
export const getDateParts=(ms)=>{
    if(!isValidTime(ms)){
        return null;
    }
    return {
        weekday:weekdayFormatter.format(ms),
        day:dayFormatter.format(ms),
        month:monthFormatter.format(ms),
        year:yearFormatter.format(ms)
    };
};

// '6:00 PM'
export const formatTime=(ms)=>{
    if(!isValidTime(ms)){
        return '';
    }
    return timeFormatter.format(ms).replace('am','AM').replace('pm','PM');
};

// 'Fri 13 Nov'
export const formatShortDate=(ms)=>{
    const parts=getDateParts(ms);
    if(!parts){
        return '';
    }
    return parts.weekday+' '+parts.day+' '+parts.month;
};

// '2026-11-13' in IST, used to group events by day.
export const getIstDateKey=(ms)=>{
    if(!isValidTime(ms)){
        return null;
    }
    return dateKeyFormatter.format(ms);
};

// 'Fri 13 Nov' or 'Fri 13 – Sun 15 Nov' or 'Sat 31 Oct – Mon 2 Nov'
export const formatDateRange=(startMs,endMs)=>{
    const start=getDateParts(startMs);
    if(!start){
        return 'Date to be announced';
    }
    const end=getDateParts(endMs);
    if(!end||getIstDateKey(startMs)===getIstDateKey(endMs)){
        return start.weekday+' '+start.day+' '+start.month;
    }
    if(start.month===end.month&&start.year===end.year){
        return start.weekday+' '+start.day+' – '+end.weekday+' '+end.day+' '+end.month;
    }
    return start.weekday+' '+start.day+' '+start.month+' – '+end.weekday+' '+end.day+' '+end.month;
};

// '9:30 AM – 1:30 PM'
export const formatTimeRange=(startMs,endMs)=>{
    const start=formatTime(startMs);
    if(!start){
        return '';
    }
    const end=formatTime(endMs);
    if(!end){
        return start;
    }
    return start+' – '+end;
};

// Price shown as amount + unit, e.g. { amount:'₹800', unit:'per team', isFree:false }
export const formatPrice=(price,isPerHead,maxTeam)=>{
    if(typeof price!=='number'||!Number.isFinite(price)||price<0){
        return {amount:'Fee TBA',unit:'',isFree:false};
    }
    if(price===0){
        return {amount:'Free',unit:'',isFree:true};
    }
    const amount='₹'+price.toLocaleString('en-IN');
    if(maxTeam===1){
        return {amount,unit:'',isFree:false};
    }
    if(isPerHead){
        return {amount,unit:'per person',isFree:false};
    }
    return {amount,unit:'per team',isFree:false};
};

// 'Solo', 'Duo', 'Teams of 3', 'Teams of 2–4', 'Solo or teams up to 3'
export const formatTeamSize=(minTeam,maxTeam)=>{
    const min=Number.isFinite(minTeam)&&minTeam>0?minTeam:null;
    const max=Number.isFinite(maxTeam)&&maxTeam>0?maxTeam:null;
    if(!min&&!max){
        return '';
    }
    if(!max||!min){
        const only=min||max;
        if(only===1){
            return 'Solo';
        }
        return 'Teams of '+only;
    }
    if(min===1&&max===1){
        return 'Solo';
    }
    if(min===2&&max===2){
        return 'Duo';
    }
    if(min===max){
        return 'Teams of '+min;
    }
    if(min===1){
        return 'Solo or teams up to '+max;
    }
    return 'Teams of '+min+'–'+max;
};

// 'in 3 days', 'in 5 hours', '2 min ago', 'just now'
export const formatRelative=(targetMs,nowMs)=>{
    if(!isValidTime(targetMs)){
        return '';
    }
    const now=isValidTime(nowMs)?nowMs:Date.now();
    const diff=targetMs-now;
    const distance=Math.abs(diff);
    let text='';
    if(distance<MINUTE){
        return 'just now';
    }
    else if(distance<HOUR){
        const minutes=Math.round(distance/MINUTE);
        text=minutes+' min';
    }
    else if(distance<DAY){
        const hours=Math.round(distance/HOUR);
        text=hours+(hours===1?' hour':' hours');
    }
    else{
        const days=Math.round(distance/DAY);
        text=days+(days===1?' day':' days');
    }
    if(diff>0){
        return 'in '+text;
    }
    return text+' ago';
};

// Split a duration into countdown parts.
export const getCountdownParts=(targetMs,nowMs)=>{
    if(!isValidTime(targetMs)){
        return null;
    }
    const now=isValidTime(nowMs)?nowMs:Date.now();
    let remaining=Math.max(0,targetMs-now);
    const days=Math.floor(remaining/DAY);
    remaining=remaining-days*DAY;
    const hours=Math.floor(remaining/HOUR);
    remaining=remaining-hours*HOUR;
    const minutes=Math.floor(remaining/MINUTE);
    remaining=remaining-minutes*MINUTE;
    const seconds=Math.floor(remaining/1000);
    return {days,hours,minutes,seconds,isOver:targetMs<=now};
};

export const padTwo=(value)=>{
    if(value<10){
        return '0'+value;
    }
    return String(value);
};

// 'No. 07'
export const formatPosterNumber=(position)=>{
    return 'No. '+padTwo(position);
};

// Same day: '9:30 AM – 1:30 PM'. Across days: 'Fri 6:00 PM – Sat 6:00 PM'.
export const formatSpan=(startMs,endMs)=>{
    if(!isValidTime(startMs)){
        return '';
    }
    if(!isValidTime(endMs)||getIstDateKey(startMs)===getIstDateKey(endMs)){
        return formatTimeRange(startMs,endMs);
    }
    return weekdayFormatter.format(startMs)+' '+formatTime(startMs)+' – '+weekdayFormatter.format(endMs)+' '+formatTime(endMs);
};

export const isMultiDay=(startMs,endMs)=>{
    if(!isValidTime(startMs)||!isValidTime(endMs)){
        return false;
    }
    return getIstDateKey(startMs)!==getIstDateKey(endMs);
};

const longWeekdayFormatter=makeFormatter({weekday:'long'});
const longMonthFormatter=makeFormatter({month:'long'});

// { weekday:'Friday', month:'November' } in IST
export const getLongDateParts=(ms)=>{
    if(!isValidTime(ms)){
        return null;
    }
    return {weekday:longWeekdayFormatter.format(ms),month:longMonthFormatter.format(ms)};
};

// { clock:'9:30', meridiem:'AM' } in IST, for the big time stamp on posters.
export const getTimeParts=(ms)=>{
    const text=formatTime(ms);
    if(!text){
        return null;
    }
    const match=text.match(/^(\d{1,2}:\d{2})\s?(AM|PM)$/i);
    if(!match){
        return {clock:text,meridiem:''};
    }
    return {clock:match[1],meridiem:match[2].toUpperCase()};
};
