import {Link} from 'react-router';
import SectionHeader from './SectionHeader';
import {formatShortDate,formatTime,formatPrice} from '../../utils/formatters';

const DAY=24*60*60*1000;

// A slight tilt per ticket, so the fan looks dropped by hand rather than laid on a grid.
const TILTS=['-4deg','-1.5deg','2deg','4.5deg','-2.5deg','1deg'];

// How long until registration closes, as the big number on the stub.
const getCloseIn=(deadline,now)=>{
    const left=deadline-now;
    if(left<=0){
        return {value:'0',unit:'days'};
    }
    if(left<DAY){
        const hours=Math.max(1,Math.round(left/(60*60*1000)));
        return {value:String(hours),unit:hours===1?'hour':'hours'};
    }
    const days=Math.round(left/DAY);
    return {value:String(days),unit:days===1?'day':'days'};
};

// "Registration closes first": the events you could miss soonest, as admission tickets
// printed in their track colour. The stub carries the countdown.
const ClosingSoon=({events,now})=>{
    if(events.length===0){
        return null;
    }
    return (
        <section id="closing-soon" className="page-gutter scroll-mt-24" aria-labelledby="closing-title">
            <div className="mx-auto max-w-[1440px] space-y-10">
                <SectionHeader
                    id="closing-title"
                    eyebrow="Don’t miss these"
                    title="Registration closes first"
                    linkTo="/events?open=yes&sort=closing"
                    linkLabel="Everything still open"
                />
                <ol className="ticket-fan scroll-row -mx-4 flex snap-x snap-mandatory gap-4 px-4 pb-6 pt-4 lg:mx-0 lg:justify-center lg:gap-0 lg:overflow-visible lg:px-0">
                    {events.map((event,index)=>{
                        const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
                        const closeIn=getCloseIn(event.registrationDeadline,now);
                        let seats='';
                        if(event.seatsLeft!==null&&event.totalSeats){
                            seats=event.seatsLeft+' of '+event.totalSeats+(event.seatsLeft===1?' place left':' places left');
                        }
                        return (
                            <li key={event.id} className="relative w-[19rem] shrink-0 snap-center lg:w-[18.5rem] xl:w-[20rem]">
                                <Link
                                    to={'/events/'+event.id}
                                    className="ticket relative flex h-[13.5rem] text-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] outline-none focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
                                    style={{'--r':TILTS[index%TILTS.length]}}
                                >
                                    {/* Main part of the ticket */}
                                    <span className="relative flex min-w-0 flex-1 flex-col justify-between rounded-l-xl p-5" style={{backgroundColor:event.track.color}}>
                                        <span aria-hidden="true" className="absolute right-4 top-4 h-3 w-3 rounded-full bg-ink"/>
                                        <span className="label-mono text-ink/70">Admit {event.maxTeam===1?'one':'one team'} · {event.track.label}</span>
                                        <span className="condensed line-clamp-3 text-[1.625rem] font-extrabold leading-[0.95] tracking-tight">{event.name}</span>
                                        <span className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1 text-[0.8125rem]">
                                            <span className="tabular font-semibold">
                                                {price.amount}
                                                {price.unit?<span className="font-normal text-ink/70"> {price.unit}</span>:null}
                                            </span>
                                            {seats?<span className="tabular text-ink/70">{seats}</span>:null}
                                        </span>
                                    </span>
                                    {/* The stub, behind a perforated line. Tears half off under the cursor. */}
                                    <span
                                        className="ticket-stub relative flex w-[6.25rem] shrink-0 flex-col items-center justify-center rounded-r-xl border-l-2 border-dashed border-ink/35 px-2 text-center"
                                        style={{backgroundColor:event.track.color}}
                                    >
                                        <span aria-hidden="true" className="absolute -left-[9px] -top-[9px] h-4 w-4 rounded-full bg-ink"/>
                                        <span aria-hidden="true" className="absolute -bottom-[9px] -left-[9px] h-4 w-4 rounded-full bg-ink"/>
                                        <span className="label-mono text-ink/70">Closes in</span>
                                        <span className="condensed tabular my-1 text-[3.25rem] font-extrabold leading-[0.85]">{closeIn.value}</span>
                                        <span className="label-mono text-ink/70">{closeIn.unit}</span>
                                        <span className="mt-3 text-[0.6875rem] font-semibold leading-tight">
                                            {formatShortDate(event.registrationDeadline)}
                                            <br/>
                                            {formatTime(event.registrationDeadline)}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
};

export default ClosingSoon;
