import {useMemo,useState} from 'react';
import {Link} from 'react-router';
import Dialog from '../components/Dialog';
import Icon from '../components/Icon';
import {getCachedEventDetail} from '../../models/eventModel';
import {buildTimetable,toPercent} from '../../utils/timetable';
import {getDateParts,getLongDateParts,formatTime,formatTimeRange,formatShortDate} from '../../utils/formatters';

const HOUR=60*60*1000;

const getDetail=(id)=>{
    const cached=getCachedEventDetail(id);
    return cached?cached.event:null;
};

// The full timetable, opened from the landing page: one day at a time, each track a
// coloured line through the day, each event a stop on its line from start to finish.
const TimetableDialog=({open,onClose,festWindow,events})=>{
    return (
        <Dialog open={open} onClose={onClose} labelledBy="timetable-title" variant="full">
            {festWindow?<TimetableContent onClose={onClose} festWindow={festWindow} events={events}/>:null}
        </Dialog>
    );
};

const Ruler=({day})=>{
    const ticks=[];
    for(let h=0;h<=day.hours;h++){
        const at=day.from+h*HOUR;
        ticks.push(
            <span
                key={h}
                className="label-mono absolute top-0 -translate-x-1/2 whitespace-nowrap text-ash"
                style={{left:toPercent(at,day)+'%'}}
            >
                {formatTime(at).replace(':00','')}
            </span>
        );
    }
    return <div aria-hidden="true" className="relative h-5">{ticks}</div>;
};

const Stop=({piece,day,color,onNavigate})=>{
    const event=piece.event;
    const left=toPercent(piece.start,day);
    const width=Math.max(toPercent(piece.end,day)-left,2.2);
    let note='';
    if(piece.continues){
        note='until '+formatShortDate(piece.until)+' '+formatTime(piece.until);
    }
    else if(piece.startsEarlier){
        note='continued';
    }
    return (
        <Link
            to={'/events/'+event.id}
            onClick={onNavigate}
            title={event.name+' · '+formatTimeRange(piece.start,piece.end)}
            className="group absolute top-1/2 flex h-10 -translate-y-1/2 items-center gap-2 overflow-hidden rounded-full border-2 bg-ink pl-1.5 pr-3 text-left transition-colors duration-300 hover:z-10 focus-visible:z-10"
            style={{left:left+'%',width:width+'%',minWidth:'2.5rem',borderColor:color}}
        >
            {/* The stop: a station dot that floods the whole capsule with colour on hover. */}
            <span aria-hidden="true" className="absolute inset-0 -z-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" style={{backgroundColor:color}}/>
            <span aria-hidden="true" className="relative h-5 w-5 shrink-0 rounded-full border-[3px] bg-ink" style={{borderColor:color}}/>
            <span className="relative min-w-0 truncate text-[0.8125rem] font-semibold text-bone transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink">
                {event.name}
                <span className="sr-only">, {formatTimeRange(piece.start,piece.end)}{note?', '+note:''}</span>
            </span>
            {piece.continues?<Icon name="arrowRight" size={14} className="relative ml-auto shrink-0 text-bone group-hover:text-ink"/>:null}
        </Link>
    );
};

const TimetableContent=({onClose,festWindow,events})=>{
    const days=useMemo(()=>{
        return buildTimetable(festWindow.days,events,getDetail);
    },[festWindow,events]);
    const [index,setIndex]=useState(0);
    const day=days[Math.min(index,days.length-1)];

    return (
        <div className="flex h-full flex-col bg-ink">
            <div className="page-gutter border-b border-line">
                <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-4 py-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3">
                        <h2 id="timetable-title" className="condensed text-[2rem] font-extrabold leading-none tracking-tight">Timetable</h2>
                        <div role="group" aria-label="Choose a day" className="flex gap-2">
                            {days.map((item,dayIndex)=>{
                                const parts=getDateParts(item.start);
                                const isOn=dayIndex===index;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        aria-pressed={isOn}
                                        onClick={()=>{
                                            setIndex(dayIndex);
                                        }}
                                        className={isOn?'inline-flex items-baseline gap-1.5 rounded-full border border-bone bg-bone px-4 py-2 text-sm text-ink':'fx-fill inline-flex items-baseline gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-bone'}
                                    >
                                        <span>{parts.weekday}</span>
                                        <span className="tabular font-semibold">{parts.day}</span>
                                        <span className="tabular text-xs opacity-60">{item.count}<span className="sr-only"> events</span></span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close the timetable"
                        className="fx-fill flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-bone"
                    >
                        <Icon name="close" size={18}/>
                    </button>
                </div>
            </div>

            {day?(
                <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
                    <div className="page-gutter">
                        <div className="mx-auto max-w-[1440px] py-6">
                            <p className="label-mono text-ash">
                                {getLongDateParts(day.start).weekday} · {day.count} events · times in IST · tap a stop to open it
                            </p>
                            <div className="mt-5 min-w-[60rem]">
                                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-x-4">
                                    <div/>
                                    <Ruler day={day}/>
                                </div>
                                <ul className="mt-2">
                                    {day.rows.map((row)=>{
                                        return (
                                            <li key={row.track.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 border-t border-line py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-x-4">
                                                <span className="sticky left-0 z-20 flex items-start gap-2 self-start bg-ink py-2.5 pr-2 text-xs font-semibold leading-snug sm:text-sm" style={{color:row.track.color}}>
                                                    <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor:row.track.color}}/>
                                                    {row.track.label}
                                                </span>
                                                <ul className="space-y-2" aria-label={row.track.label}>
                                                    {row.lanes.map((lane,laneIndex)=>{
                                                        return (
                                                            <li key={laneIndex} className="relative h-12">
                                                                {/* The track's line runs through the whole day. */}
                                                                <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full opacity-35" style={{backgroundColor:row.track.color}}/>
                                                                {lane.map((piece)=>{
                                                                    return <Stop key={piece.event.id+'-'+piece.start} piece={piece} day={day} color={row.track.color} onNavigate={onClose}/>;
                                                                })}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ):(
                <p className="page-gutter py-10 text-ash">Nothing is scheduled yet.</p>
            )}
        </div>
    );
};

export default TimetableDialog;
