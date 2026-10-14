import {useMemo,useState} from 'react';
import {Link} from 'react-router';
import Dialog from '../components/Dialog';
import Icon from '../components/Icon';
import useEvents from '../../controllers/useEvents';
import usePlan from '../../controllers/usePlan';
import {getCachedEventDetail} from '../../models/eventModel';
import {findClashes,groupByDay} from '../../utils/schedule';
import {downloadCalendarFile} from '../../utils/calendarFile';
import {formatSpan,getDateParts} from '../../utils/formatters';

// "Your plan": saved events grouped by day, with overlaps flagged and a one-tap calendar export.
// The content only mounts while the drawer is open, so a closed drawer costs nothing.
const PlanDrawer=({open,onClose})=>{
    return (
        <Dialog open={open} onClose={onClose} labelledBy="plan-title" variant="drawer">
            <PlanContent onClose={onClose}/>
        </Dialog>
    );
};

const PlanContent=({onClose})=>{
    const {events,status}=useEvents();
    const plan=usePlan();
    const [confirmClear,setConfirmClear]=useState(false);

    const planned=useMemo(()=>{
        const byId={};
        for(let i=0;i<events.length;i++){
            byId[events[i].id]=events[i];
        }
        const found=[];
        const missing=[];
        for(let i=0;i<plan.ids.length;i++){
            const id=plan.ids[i];
            // Prefer the full version (real session times) when we have it.
            const detail=getCachedEventDetail(id);
            if(detail){
                found.push(detail.event);
            }
            else if(byId[id]){
                found.push(byId[id]);
            }
            else if(status==='ready'){
                missing.push(id);
            }
        }
        return {found,missing};
    },[events,plan.ids,status]);

    const upcoming=useMemo(()=>{
        const list=[];
        for(let i=0;i<planned.found.length;i++){
            if(!planned.found[i].isPast){
                list.push(planned.found[i]);
            }
        }
        return list;
    },[planned]);

    const clashes=useMemo(()=>{
        return findClashes(upcoming);
    },[upcoming]);

    const days=useMemo(()=>{
        return groupByDay(planned.found);
    },[planned]);

    let clashCount=0;
    for(let i=0;i<upcoming.length;i++){
        if(clashes[upcoming[i].id].length>0){
            clashCount=clashCount+1;
        }
    }

    const close=()=>{
        setConfirmClear(false);
        onClose();
    };

    return (
            <div className="flex h-full flex-col border-l border-line bg-graphite">
                <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
                    <div>
                        <h2 id="plan-title" className="condensed text-3xl font-extrabold tracking-tight">Your plan</h2>
                        <p className="mt-1 text-sm text-ash">
                            {plan.count===0?'Nothing saved yet.':plan.count+(plan.count===1?' event':' events')+' across '+days.length+(days.length===1?' day':' days')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close your plan"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ash hover:text-bone"
                    >
                        <Icon name="close" size={20}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {plan.count===0?(
                        <div className="space-y-4 pt-6">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ash">
                                <Icon name="bookmark" size={18}/>
                            </span>
                            <p className="max-w-xs text-base leading-relaxed text-ash">
                                Tap the bookmark on any event and it lands here, sorted by day, with clashes flagged.
                            </p>
                            <Link to="/events" onClick={close} className="inline-flex items-center gap-2 text-sm font-semibold text-signal-soft">
                                Browse events
                                <Icon name="arrowRight" size={16}/>
                            </Link>
                        </div>
                    ):null}

                    {clashCount>0?(
                        <p role="status" className="mb-5 rounded-xl border border-few/30 bg-few/[0.06] px-4 py-3 text-sm text-bone">
                            {clashCount} of your events overlap. You can still keep them, just pick which one you’ll be at.
                        </p>
                    ):null}

                    {days.map((day)=>{
                        const parts=getDateParts(day.start);
                        return (
                            <section key={day.key} className="mb-7" aria-label={parts?parts.weekday+' '+parts.day+' '+parts.month:'Date to be announced'}>
                                <h3 className="label-mono mb-3 flex items-baseline gap-2 text-ash">
                                    {parts?(
                                        <span className="condensed tabular text-2xl font-bold tracking-normal text-bone">{parts.day}</span>
                                    ):null}
                                    {parts?parts.month+' · '+parts.weekday:'Date to be announced'}
                                </h3>
                                <ul className="space-y-2">
                                    {day.events.map((event)=>{
                                        const overlaps=event.isPast?[]:(clashes[event.id]||[]);
                                        return (
                                            <li key={event.id} className={overlaps.length>0?'rounded-xl border border-few/40 bg-ink/40 p-4':'rounded-xl border border-line bg-ink/40 p-4'}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="tabular text-xs text-ash">{formatSpan(event.start,event.end)}{event.isPast?' · Ended':''}</p>
                                                        <Link to={'/events/'+event.id} onClick={close} className="mt-1 block font-semibold leading-snug text-bone hover:underline">
                                                            {event.name}
                                                        </Link>
                                                        <p className="mt-1 text-xs text-ash">
                                                            {event.schedules.length>0?event.schedules[0].venue:(event.mode==='ONLINE'?'Online':'On campus')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={()=>{
                                                            plan.toggle(event.id);
                                                        }}
                                                        aria-label={'Remove '+event.name+' from your plan'}
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ash hover:bg-line hover:text-bone"
                                                    >
                                                        <Icon name="close" size={15}/>
                                                    </button>
                                                </div>
                                                {overlaps.length>0?(
                                                    <p className="mt-3 flex items-start gap-2 text-xs text-few">
                                                        <Icon name="alert" size={14} className="mt-px shrink-0"/>
                                                        <span>Overlaps with {overlaps.map((other)=>other.name.split(':')[0]).join(', ')}</span>
                                                    </p>
                                                ):null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        );
                    })}

                    {planned.missing.length>0?(
                        <div className="rounded-xl border border-line p-4 text-sm text-ash">
                            {planned.missing.length===1?'1 saved event is':planned.missing.length+' saved events are'} no longer on the programme.{' '}
                            <button
                                type="button"
                                onClick={()=>{
                                    for(let i=0;i<planned.missing.length;i++){
                                        plan.toggle(planned.missing[i]);
                                    }
                                }}
                                className="font-medium text-bone underline underline-offset-4"
                            >
                                Remove {planned.missing.length===1?'it':'them'}
                            </button>
                        </div>
                    ):null}
                </div>

                {plan.count>0?(
                    <div className="flex flex-wrap gap-3 border-t border-line px-6 py-4">
                        <button
                            type="button"
                            disabled={upcoming.length===0}
                            onClick={()=>{
                                downloadCalendarFile(upcoming,'render72-plan.ics');
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-signal px-5 py-3 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6] disabled:opacity-50"
                        >
                            <Icon name="calendar" size={16}/>
                            Add to calendar
                        </button>
                        <button
                            type="button"
                            onClick={()=>{
                                if(confirmClear){
                                    plan.clear();
                                    setConfirmClear(false);
                                }
                                else{
                                    setConfirmClear(true);
                                }
                            }}
                            onBlur={()=>{
                                setConfirmClear(false);
                            }}
                            className={confirmClear?'rounded-full border border-full px-5 py-3 text-sm font-semibold text-full':'rounded-full border border-line px-5 py-3 text-sm font-medium text-bone hover:border-ash'}
                        >
                            {confirmClear?'Tap again to clear':'Clear plan'}
                        </button>
                    </div>
                ):null}
            </div>
    );
};

export default PlanDrawer;
