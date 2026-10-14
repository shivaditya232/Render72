import {useCallback,useMemo,useState} from 'react';
import SectionHeader from './SectionHeader';
import TimetableDialog from './TimetableDialog';
import Icon from '../components/Icon';
import {getCachedEventDetail} from '../../models/eventModel';
import {buildTimetable,toPercent} from '../../utils/timetable';
import {getDateParts} from '../../utils/formatters';
import {toHeadlineNumber} from '../../utils/landing';

const getDetail=(id)=>{
    const cached=getCachedEventDetail(id);
    return cached?cached.event:null;
};

// The landing page only shows the shape of the fest: every track as a line through
// each day, every event a dot. Opening it shows the full, readable timetable.
const TimetableTeaser=({festWindow,events})=>{
    const [open,setOpen]=useState(false);
    const days=useMemo(()=>{
        if(!festWindow){
            return [];
        }
        return buildTimetable(festWindow.days,events,getDetail);
    },[festWindow,events]);

    const openTimetable=useCallback(()=>{
        setOpen(true);
    },[]);

    const closeTimetable=useCallback(()=>{
        setOpen(false);
    },[]);

    if(days.length===0){
        return null;
    }

    let lineCount=0;
    const seen={};
    for(let d=0;d<days.length;d++){
        for(let r=0;r<days[d].rows.length;r++){
            const id=days[d].rows[r].track.id;
            if(!seen[id]){
                seen[id]=true;
                lineCount=lineCount+1;
            }
        }
    }
    const title=toHeadlineNumber(lineCount)+' lines, '+toHeadlineNumber(days.length).toLowerCase()+(days.length===1?' day':' days');

    return (
        <section className="page-gutter" aria-labelledby="timetable-teaser-title">
            <div className="mx-auto max-w-[1440px] space-y-8">
                <SectionHeader
                    id="timetable-teaser-title"
                    eyebrow="The timetable"
                    title={title}
                    linkTo="/events"
                    linkLabel="Open the full programme"
                />
                <button
                    type="button"
                    onClick={openTimetable}
                    className="group block w-full rounded-3xl border border-line p-5 text-left transition-colors duration-300 hover:border-ash sm:p-7"
                    aria-label="Open the timetable"
                >
                    <span aria-hidden="true" className="grid gap-6 md:grid-cols-3 md:gap-8">
                        {days.map((day)=>{
                            const parts=getDateParts(day.start);
                            return (
                                <span key={day.key} className="block">
                                    <span className="flex items-end gap-2.5">
                                        <span className="condensed tabular text-5xl font-extrabold leading-[0.8] tracking-tight">{parts.day}</span>
                                        <span className="label-mono pb-0.5 leading-tight text-ash">{parts.weekday}<br/>{day.count} events</span>
                                    </span>
                                    <span className="mt-5 block space-y-[9px]">
                                        {day.rows.map((row)=>{
                                            return (
                                                <span key={row.track.id} className="relative block h-2">
                                                    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full opacity-30 transition-opacity duration-500 group-hover:opacity-70" style={{backgroundColor:row.track.color}}/>
                                                    {row.lanes.map((lane)=>{
                                                        return lane.map((piece)=>{
                                                            return (
                                                                <span
                                                                    key={piece.event.id+'-'+piece.start}
                                                                    className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full transition-[filter] duration-500"
                                                                    style={{left:toPercent(piece.start,day)+'%',width:Math.max(toPercent(piece.end,day)-toPercent(piece.start,day),2)+'%',backgroundColor:row.track.color}}
                                                                />
                                                            );
                                                        });
                                                    })}
                                                </span>
                                            );
                                        })}
                                    </span>
                                </span>
                            );
                        })}
                    </span>
                    <span className="mt-7 flex items-center justify-between gap-4 border-t border-line pt-5">
                        <span className="text-sm text-ash">Every event on its track, hour by hour.</span>
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-ink transition-transform duration-300 group-hover:translate-x-1">
                            Open the timetable
                            <Icon name="arrowUpRight" size={16}/>
                        </span>
                    </span>
                </button>
                <TimetableDialog open={open} onClose={closeTimetable} festWindow={festWindow} events={events}/>
            </div>
        </section>
    );
};

export default TimetableTeaser;
