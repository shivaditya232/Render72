// The timetable as "track lines": each track is a coloured line running through the day,
// and every event sits on its track's line from its start to its end time.
// Events in the same track that overlap get their own branch (a second, third … line),
// so nothing is drawn on top of anything else.

import {TRACKS,OTHER_TRACK} from '../config/tracks';
import {getIstDateKey} from './formatters';
import {getSessions} from './schedule';
import {toIstTime} from '../models/eventModel';

const HOUR=60*60*1000;
const DEFAULT_LENGTH=HOUR;

// Midnight (IST) at the start of the given day key, e.g. '2026-11-13'.
const dayStartOf=(key)=>{
    return toIstTime(key,'00:00');
};

// The pieces of an event that fall on one day.
// Uses the real sessions when the full event is known; otherwise the overall span,
// cut at the end of its first day (and marked as continuing).
const getPiecesForDay=(event,detail,dayKey)=>{
    const dayStart=dayStartOf(dayKey);
    const dayEnd=dayStart+24*HOUR;
    const pieces=[];
    const sessions=detail?getSessions(detail):[];
    if(sessions.length>0){
        for(let i=0;i<sessions.length;i++){
            const session=sessions[i];
            const end=session.end!==null?session.end:session.start+DEFAULT_LENGTH;
            if(session.start<dayEnd&&end>dayStart){
                pieces.push({
                    start:Math.max(session.start,dayStart),
                    end:Math.min(end,dayEnd),
                    startsEarlier:session.start<dayStart,
                    continues:end>dayEnd,
                    until:end
                });
            }
        }
        return pieces;
    }
    if(event.start===null||getIstDateKey(event.start)!==dayKey){
        return pieces;
    }
    const end=event.end!==null?event.end:event.start+DEFAULT_LENGTH;
    pieces.push({
        start:event.start,
        end:Math.min(end,dayEnd),
        startsEarlier:false,
        continues:end>dayEnd,
        until:end
    });
    return pieces;
};

// Puts each piece on the first branch of its track that is free at that time.
const assignLanes=(pieces)=>{
    const lanes=[];
    for(let i=0;i<pieces.length;i++){
        const piece=pieces[i];
        let placed=false;
        for(let l=0;l<lanes.length&&!placed;l++){
            const lane=lanes[l];
            if(lane[lane.length-1].end<=piece.start){
                lane.push(piece);
                placed=true;
            }
        }
        if(!placed){
            lanes.push([piece]);
        }
    }
    return lanes;
};

// days: festWindow.days. events: every event (so a run that started earlier still shows).
// getDetail(id) returns the full event if we have it (for real session times), or null.
export const buildTimetable=(days,events,getDetail)=>{
    const result=[];
    const trackList=TRACKS.concat([OTHER_TRACK]);
    for(let d=0;d<days.length;d++){
        const day=days[d];
        const byTrack={};
        let first=null;
        let last=null;
        let count=0;
        for(let i=0;i<events.length;i++){
            const event=events[i];
            const detail=getDetail?getDetail(event.id):null;
            const pieces=getPiecesForDay(event,detail,day.key);
            if(pieces.length===0){
                continue;
            }
            count=count+1;
            for(let p=0;p<pieces.length;p++){
                const piece={...pieces[p],event};
                if(!byTrack[event.track.id]){
                    byTrack[event.track.id]=[];
                }
                byTrack[event.track.id].push(piece);
                if(first===null||piece.start<first){
                    first=piece.start;
                }
                if(last===null||piece.end>last){
                    last=piece.end;
                }
            }
        }
        if(count===0){
            continue;
        }
        const dayStart=dayStartOf(day.key);
        // Whole hours either side, so the ruler starts and ends on the hour.
        const fromHour=Math.max(0,Math.floor((first-dayStart)/HOUR));
        const toHour=Math.min(24,Math.max(fromHour+1,Math.ceil((last-dayStart)/HOUR)));
        const rows=[];
        for(let t=0;t<trackList.length;t++){
            const track=trackList[t];
            const pieces=byTrack[track.id];
            if(!pieces){
                continue;
            }
            pieces.sort((a,b)=>{
                return a.start-b.start;
            });
            rows.push({track,lanes:assignLanes(pieces)});
        }
        result.push({
            key:day.key,
            start:day.start,
            count,
            from:dayStart+fromHour*HOUR,
            to:dayStart+toHour*HOUR,
            hours:toHour-fromHour,
            rows
        });
    }
    return result;
};

// Where a moment sits along the day, as a percentage of the ruler.
export const toPercent=(ms,day)=>{
    const span=day.to-day.from;
    if(span<=0){
        return 0;
    }
    return Math.min(100,Math.max(0,((ms-day.from)/span)*100));
};
