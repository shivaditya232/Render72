import {Link} from 'react-router';
import ErrorState from '../components/ErrorState';
import DataSourceNotice from '../components/DataSourceNotice';
import LoadingPhrase from '../components/LoadingPhrase';
import useEvents from '../../controllers/useEvents';
import useDocumentTitle from '../../controllers/useDocumentTitle';
import {formatDateRange,formatPrice} from '../../utils/formatters';

// Session 1: a plain list to prove loading, caching and every failure state.
// The real events page (posters, filters, plan) is built in Session 2.
const EventsPage=()=>{
    useDocumentTitle('All events');
    const {status,events,source,savedAt,error,retry,isRefreshing}=useEvents();

    return (
        <section className="page-gutter">
            <div className="mx-auto max-w-[1440px] py-16">
                <h1 className="text-4xl font-bold">All events</h1>
                {status==='ready'?(
                    <div className="mt-6">
                        <DataSourceNotice source={source} savedAt={savedAt} error={error} onRetry={retry} isRefreshing={isRefreshing}/>
                    </div>
                ):null}

                {status==='loading'?(
                    <div className="mt-8 space-y-3" aria-busy="true">
                        <LoadingPhrase active={true}/>
                        <div className="skeleton h-14 rounded-xl"/>
                        <div className="skeleton h-14 rounded-xl"/>
                        <div className="skeleton h-14 rounded-xl"/>
                    </div>
                ):null}

                {status==='error'?<ErrorState error={error} onRetry={retry} isRetrying={isRefreshing}/>:null}

                {status==='ready'&&events.length===0?(
                    <p className="mt-10 text-ash">No events are on the programme right now.</p>
                ):null}

                {status==='ready'&&events.length>0?(
                    <ul className="mt-8 divide-y divide-line border-y border-line">
                        {events.map((event)=>{
                            const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
                            return (
                                <li key={event.id}>
                                    <Link to={'/events/'+event.id} className="flex flex-wrap items-baseline justify-between gap-2 py-4 hover:bg-graphite">
                                        <span className="font-medium">{event.name}</span>
                                        <span className="label-mono text-ash">{formatDateRange(event.start,event.end)} · {event.registrationStatus}</span>
                                        <span className="text-sm">{price.amount} {price.unit}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ):null}
            </div>
        </section>
    );
};

export default EventsPage;
