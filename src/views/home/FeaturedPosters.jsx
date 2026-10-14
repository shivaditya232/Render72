import SectionHeader from './SectionHeader';
import PosterCard from '../events/PosterCard';
import usePlan from '../../controllers/usePlan';

// The organisers' picks, as the same posters used on the events page
// (so saving to your plan works here too).
const FeaturedPosters=({events,posterNumbers,now})=>{
    const plan=usePlan();
    if(events.length===0){
        return null;
    }
    return (
        <section className="page-gutter" aria-labelledby="featured-title">
            <div className="mx-auto max-w-[1440px] space-y-8">
                <SectionHeader
                    id="featured-title"
                    eyebrow="Picked by the organisers"
                    title="Featured events"
                    linkTo="/events"
                    linkLabel="All events"
                />
                <ul className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event)=>{
                        return (
                            <li key={event.id}>
                                <PosterCard
                                    event={event}
                                    number={posterNumbers[event.id]}
                                    tokens={[]}
                                    saved={plan.isSaved(event.id)}
                                    onToggleSave={()=>{
                                        plan.toggle(event.id);
                                    }}
                                    priority={false}
                                    now={now}
                                    isFeatured={false}
                                    isWide={false}
                                    stamp="date"
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};

export default FeaturedPosters;
