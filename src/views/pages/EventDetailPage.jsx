import {Link,useLoaderData} from 'react-router';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import DataSourceNotice from '../components/DataSourceNotice';
import LoadingPhrase from '../components/LoadingPhrase';
import NotOnProgramme from '../components/NotOnProgramme';
import useEventDetail from '../../controllers/useEventDetail';
import useDocumentTitle from '../../controllers/useDocumentTitle';
import {formatDateRange} from '../../utils/formatters';

// Session 1: plain version to prove loading, partial data and 404 handling.
// The real event page is built in Session 4.
const EventDetailPage=()=>{
    const loaderData=useLoaderData()||{};
    const id=loaderData.id;
    const {status,event,partial,source,savedAt,error,retry,isRefreshing}=useEventDetail(id,loaderData.initial);
    useDocumentTitle(event?event.name:(status==='not_found'?'Not on the programme':'Event'));

    if(status==='not_found'){
        return <NotOnProgramme/>;
    }

    return (
        <section className="page-gutter">
            <div className="mx-auto max-w-[1440px] py-16">
                <Link to="/events" className="label-mono inline-flex items-center gap-1.5 text-ash hover:text-bone"><Icon name="arrowLeft" size={14}/>All events</Link>

                {status==='loading'?(
                    <div className="mt-8 space-y-4" aria-busy="true">
                        <LoadingPhrase active={true}/>
                        <div className="skeleton h-12 w-2/3 rounded-xl"/>
                        <div className="skeleton h-40 rounded-xl"/>
                    </div>
                ):null}

                {status==='error'?<ErrorState error={error} onRetry={retry} isRetrying={isRefreshing}/>:null}

                {event?(
                    <article className="mt-8 space-y-6">
                        <DataSourceNotice source={partial?'summary':source} savedAt={savedAt} error={error} onRetry={retry} isRefreshing={isRefreshing}/>
                        <p className="label-mono text-ash">{event.category} · {formatDateRange(event.start,event.end)}</p>
                        <h1 className="text-5xl font-bold leading-tight">{event.name}</h1>
                        <p className="max-w-2xl text-lg text-ash">{event.blurb}</p>
                        {event.description?(
                            <p className="max-w-2xl whitespace-pre-line leading-relaxed">{event.description}</p>
                        ):null}
                        {partial&&isRefreshing?<LoadingPhrase active={true} category={event.category}/>:null}
                    </article>
                ):null}
            </div>
        </section>
    );
};

export default EventDetailPage;
