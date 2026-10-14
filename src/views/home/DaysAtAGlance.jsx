import {Link} from 'react-router';
import SectionHeader from './SectionHeader';
import {getAvailability,TONE_TEXT} from '../../utils/availability';
import {getDateParts,getLongDateParts,formatTime} from '../../utils/formatters';

// The whole fest as a printed timetable: one column per day, one line per event.
// Built for scanning — "what's on Saturday afternoon?" — without opening anything.
const DaysAtAGlance=({festWindow,now})=>{
    if(!festWindow){
        return null;
    }
    return (
        <section className="page-gutter" aria-labelledby="glance-title">
            <div className="mx-auto max-w-[1440px] space-y-8">
                <SectionHeader
                    id="glance-title"
                    eyebrow="The timetable"
                    title={festWindow.days.length===1?'The day at a glance':festWindow.days.length+' days at a glance'}
                    linkTo="/events"
                    linkLabel="Open the full programme"
                />
                <div className="grid gap-10 lg:grid-cols-3 lg:gap-6">
                    {festWindow.days.map((day)=>{
                        const parts=getDateParts(day.start);
                        const longParts=getLongDateParts(day.start);
                        const headingId='glance-'+day.key;
                        return (
                            <section key={day.key} aria-labelledby={headingId} className="min-w-0">
                                <h3 id={headingId} className="flex items-end gap-3 border-b border-bone pb-3">
                                    <span className="condensed tabular text-6xl font-extrabold leading-[0.8] tracking-tight">{parts.day}</span>
                                    <span className="flex flex-col pb-0.5">
                                        <span className="label-mono text-bone">{longParts.weekday}</span>
                                        <span className="label-mono text-ash">{day.events.length} events</span>
                                    </span>
                                </h3>
                                <ol>
                                    {day.events.map((event)=>{
                                        const availability=getAvailability(event,now);
                                        const showStatus=availability.key==='sold_out'||availability.key==='few'||availability.key==='closed'||availability.key==='reg_closed';
                                        return (
                                            <li key={event.id}>
                                                <Link
                                                    to={'/events/'+event.id}
                                                    title={event.name}
                                                    className="group grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-3 border-b border-line py-3 transition-colors hover:bg-graphite/60"
                                                >
                                                    <span className="tabular text-xs font-medium text-ash">{formatTime(event.start)}</span>
                                                    <span className="min-w-0">
                                                        <span className="flex items-center gap-2">
                                                            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{backgroundColor:event.track.color}}/>
                                                            <span className="truncate text-[0.9375rem] font-medium text-bone group-hover:underline group-hover:underline-offset-4">{event.name}</span>
                                                        </span>
                                                        <span className="mt-0.5 flex items-center gap-2 pl-4 text-xs text-ash">
                                                            <span>{event.track.label}</span>
                                                            {showStatus?<span className={TONE_TEXT[availability.tone]}>· {availability.label}</span>:null}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </section>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default DaysAtAGlance;
