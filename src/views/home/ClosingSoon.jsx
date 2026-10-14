import {Link} from 'react-router';
import SectionHeader from './SectionHeader';
import SeatsMeter from '../events/SeatsMeter';
import {getAvailability} from '../../utils/availability';
import {formatShortDate,formatTime,formatRelative,formatPrice} from '../../utils/formatters';

// "Registration closes first": the events you could miss soonest.
const ClosingSoon=({events,now})=>{
    if(events.length===0){
        return null;
    }
    return (
        <section id="closing-soon" className="page-gutter scroll-mt-24" aria-labelledby="closing-title">
            <div className="mx-auto max-w-[1440px] space-y-8">
                <SectionHeader
                    id="closing-title"
                    eyebrow="Don’t miss these"
                    title="Registration closes first"
                    linkTo="/events?open=yes&sort=closing"
                    linkLabel="Everything still open"
                />
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {events.map((event,index)=>{
                        const availability=getAvailability(event,now);
                        const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
                        return (
                            <li key={event.id}>
                                <Link
                                    to={'/events/'+event.id}
                                    className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-graphite p-5 transition-colors hover:border-ash"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="label-mono flex items-center gap-2" style={{color:event.track.color}}>
                                            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{backgroundColor:event.track.color}}/>
                                            {event.track.label}
                                        </span>
                                        <span className="label-mono text-ash">{String(index+1).padStart(2,'0')}</span>
                                    </div>
                                    <h3 className="condensed text-[1.625rem] font-bold leading-[1.02] tracking-tight text-bone">
                                        {event.name}
                                    </h3>
                                    <div className="mt-auto space-y-4">
                                        <div>
                                            <p className="label-mono text-ash">Registration closes</p>
                                            <p className="mt-1 text-sm text-bone">
                                                <span className="font-semibold">{formatShortDate(event.registrationDeadline)}, {formatTime(event.registrationDeadline)}</span>
                                                <span className="text-ash"> · {formatRelative(event.registrationDeadline,now)}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3 text-sm">
                                            <span className="text-ash">Fee</span>
                                            <span className="tabular font-semibold text-bone">
                                                {price.amount}
                                                {price.unit?<span className="font-normal text-ash"> {price.unit}</span>:null}
                                            </span>
                                        </div>
                                        <SeatsMeter event={event} availability={availability}/>
                                    </div>
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
