import {Link} from 'react-router';
import PosterCard from '../events/PosterCard';
import Icon from '../components/Icon';

// "More like this": same track first, then whatever's coming up soonest.
const RelatedEvents=({events,current,posterNumbers,isSaved,onToggleSave,now})=>{
    if(events.length===0){
        return null;
    }
    let sameTrack=0;
    for(let i=0;i<events.length;i++){
        if(events[i].track.id===current.track.id){
            sameTrack=sameTrack+1;
        }
    }
    let title='Coming up next';
    if(sameTrack===events.length){
        title='More in '+current.track.label;
    }
    return (
        <section aria-labelledby="related-title" className="border-t border-line pt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="label-mono text-ash">Keep exploring</p>
                    <h2 id="related-title" className="condensed mt-2 text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-[0.95] tracking-tight">{title}</h2>
                </div>
                <Link to="/events" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-signal-soft underline-offset-4 hover:underline">
                    All events
                    <Icon name="arrowRight" size={16}/>
                </Link>
            </div>
            <ul className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event)=>{
                    return (
                        <li key={event.id}>
                            <PosterCard
                                event={event}
                                number={posterNumbers[event.id]||0}
                                saved={isSaved(event.id)}
                                onToggleSave={()=>{
                                    onToggleSave(event.id);
                                }}
                                now={now}
                            />
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default RelatedEvents;
