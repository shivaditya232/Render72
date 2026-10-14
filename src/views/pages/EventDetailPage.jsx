import {useCallback,useMemo,useState} from 'react';
import {Link,useLoaderData} from 'react-router';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import DataSourceNotice from '../components/DataSourceNotice';
import NotOnProgramme from '../components/NotOnProgramme';
import SectionBoundary from '../components/SectionBoundary';
import EventHero from '../detail/EventHero';
import BookingCard from '../detail/BookingCard';
import MobileBookingBar from '../detail/MobileBookingBar';
import RegisterDialog from '../detail/RegisterDialog';
import SectionNav from '../detail/SectionNav';
import AboutSection from '../detail/AboutSection';
import ScheduleSection from '../detail/ScheduleSection';
import PrizeSection from '../detail/PrizeSection';
import EntrySection from '../detail/EntrySection';
import RulesSection from '../detail/RulesSection';
import GallerySection from '../detail/GallerySection';
import FaqSection from '../detail/FaqSection';
import PeopleSection from '../detail/PeopleSection';
import RelatedEvents from '../detail/RelatedEvents';
import DetailSkeleton from '../detail/DetailSkeleton';
import useEventDetail from '../../controllers/useEventDetail';
import useEventExtras from '../../controllers/useEventExtras';
import useDocumentTitle from '../../controllers/useDocumentTitle';
import useScrollSpy from '../../controllers/useScrollSpy';
import useShare from '../../controllers/useShare';
import {getAvailability} from '../../utils/availability';
import {getDetailSections,getVenueText,getTimeSummary} from '../../utils/eventDetail';
import {formatDateRange,formatTeamSize} from '../../utils/formatters';

// Which component draws which section (the order comes from getDetailSections).
const SECTION_VIEWS={
    schedule:ScheduleSection,
    prizes:PrizeSection,
    entry:EntrySection,
    rules:RulesSection,
    gallery:GallerySection,
    faq:FaqSection,
    people:PeopleSection
};

// One event, fully drawn. Only mounted once there is an event to show
// (the full version, or the short summary while the rest loads).
const EventView=({event,partial,source,savedAt,error,retry,isRefreshing})=>{
    const extras=useEventExtras(event);
    const share=useShare();
    const [registerOpen,setRegisterOpen]=useState(false);

    // One "now" per data load keeps every status on the page consistent.
    const now=useMemo(()=>{
        return Date.now();
    },[event]);

    const availability=getAvailability(event,now);
    const sections=useMemo(()=>{
        return getDetailSections(event);
    },[event]);

    const sectionIds=[];
    for(let i=0;i<sections.length;i++){
        sectionIds.push(sections[i].id);
    }
    const activeId=useScrollSpy(sectionIds);

    const openRegister=useCallback(()=>{
        setRegisterOpen(true);
    },[]);

    const closeRegister=useCallback(()=>{
        setRegisterOpen(false);
    },[]);

    const time=getTimeSummary(event);
    const team=formatTeamSize(event.minTeam,event.maxTeam);
    const facts=[{icon:'calendar',text:formatDateRange(event.start,event.end)}];
    if(time){
        facts.push({icon:'clock',text:time});
    }
    facts.push({icon:event.mode==='ONLINE'?'wifi':'pin',text:getVenueText(event)});
    if(team){
        facts.push({icon:'users',text:team});
    }

    let noticeSource=source;
    if(partial){
        noticeSource='summary';
    }

    return (
        <>
            <article className="space-y-8">
                <DataSourceNotice source={noticeSource} savedAt={savedAt} error={error} onRetry={retry} isRefreshing={isRefreshing}/>

                <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="lg:col-start-2 lg:row-start-1">
                        <EventHero event={event} posterNumber={extras.posterNumber}/>
                    </div>

                    <header className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
                        <p className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-ash">
                            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{backgroundColor:event.track.color}}/>
                            <span style={{color:event.track.color}}>{event.track.label}</span>
                            <span aria-hidden="true">·</span>
                            {event.category}
                            {event.type==='WORKSHOP'?<span>· Workshop</span>:null}
                        </p>
                        <h1 className="condensed mt-4 text-[clamp(2.75rem,7.5vw,5.75rem)] font-extrabold leading-[0.88] tracking-tight [overflow-wrap:anywhere]">{event.name}</h1>
                        <ul className="mt-6 grid gap-x-6 gap-y-2.5 text-[0.9375rem] text-bone/85 sm:grid-cols-2">
                            {facts.map((fact,index)=>{
                                return (
                                    <li key={index} className="flex min-w-0 items-start gap-2.5">
                                        <Icon name={fact.icon} size={17} className="mt-0.5 shrink-0 text-ash"/>
                                        <span>{fact.text}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        {event.tags.length>0?(
                            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                                {event.tags.map((tag)=>{
                                    return (
                                        <li key={tag}>
                                            <Link
                                                to={'/events?q='+encodeURIComponent(tag)}
                                                className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[0.8125rem] text-ash transition-colors hover:border-ash hover:text-bone"
                                            >
                                                {tag}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        ):null}
                    </header>

                    <aside aria-label="Booking" className="lg:col-start-2 lg:row-start-2">
                        <div className="lg:sticky lg:top-24">
                            <SectionBoundary label="The booking panel">
                                <BookingCard
                                    event={event}
                                    availability={availability}
                                    now={now}
                                    isSaved={extras.isSaved}
                                    onToggleSave={extras.toggleSave}
                                    clashes={extras.clashes}
                                    onRegister={openRegister}
                                    share={share}
                                    isPartial={partial}
                                />
                            </SectionBoundary>
                        </div>
                    </aside>

                    <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                        <SectionNav sections={sections} activeId={activeId}/>
                        <div className="space-y-16 pt-6">
                            <SectionBoundary label="About">
                                <AboutSection event={event} isLoadingMore={partial&&isRefreshing}/>
                            </SectionBoundary>
                            {sections.map((section)=>{
                                const View=SECTION_VIEWS[section.id];
                                if(!View){
                                    return null;
                                }
                                return (
                                    <SectionBoundary key={section.id} label={section.label}>
                                        <View event={event}/>
                                    </SectionBoundary>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <SectionBoundary label="Related events">
                    <RelatedEvents
                        events={extras.related}
                        current={event}
                        posterNumbers={extras.posterNumbers}
                        isSaved={extras.isPlanSaved}
                        onToggleSave={extras.togglePlan}
                        now={now}
                    />
                </SectionBoundary>
            </article>

            {/* Outside the article so its spacing rules don't push the fixed bar up. */}
            <MobileBookingBar
                event={event}
                availability={availability}
                canRegister={event.canRegister}
                onRegister={openRegister}
                isSaved={extras.isSaved}
                onToggleSave={extras.toggleSave}
            />
            <RegisterDialog
                open={registerOpen}
                onClose={closeRegister}
                event={event}
                isSaved={extras.isSaved}
                onToggleSave={extras.toggleSave}
            />
        </>
    );
};

// The event page. Draws instantly from cache or the list summary when it can,
// and explains clearly when it can't (404, offline, server down).
const EventDetailPage=()=>{
    const loaderData=useLoaderData()||{};
    const id=loaderData.id;
    const {status,event,partial,source,savedAt,error,retry,isRefreshing}=useEventDetail(id,loaderData.initial);

    let title='Event';
    if(event){
        title=event.name;
    }
    else if(status==='not_found'){
        title='Not on the programme';
    }
    useDocumentTitle(title);

    if(status==='not_found'){
        return <NotOnProgramme/>;
    }

    return (
        <section className="page-gutter">
            <div className="mx-auto max-w-[1440px] pb-8 pt-6 sm:pt-8">
                <Link to="/events" className="label-mono mb-6 inline-flex min-h-11 items-center gap-1.5 text-ash transition-colors hover:text-bone">
                    <Icon name="arrowLeft" size={14}/>
                    All events
                </Link>

                {status==='loading'?<DetailSkeleton/>:null}

                {status==='error'&&!event?(
                    <ErrorState error={error} onRetry={retry} isRetrying={isRefreshing}/>
                ):null}

                {event?(
                    <EventView
                        key={event.id}
                        event={event}
                        partial={partial}
                        source={source}
                        savedAt={savedAt}
                        error={error}
                        retry={retry}
                        isRefreshing={isRefreshing}
                    />
                ):null}
            </div>
        </section>
    );
};

export default EventDetailPage;
