import {useCallback,useMemo,useState} from 'react';
import ErrorState from '../components/ErrorState';
import DataSourceNotice from '../components/DataSourceNotice';
import LoadingPhrase from '../components/LoadingPhrase';
import SectionBoundary from '../components/SectionBoundary';
import Dialog from '../components/Dialog';
import Icon from '../components/Icon';
import PosterCard from '../events/PosterCard';
import IndexRow from '../events/IndexRow';
import DateStrip from '../events/DateStrip';
import TrackBar from '../events/TrackBar';
import DayHeading from '../events/DayHeading';
import WhenTabs from '../events/WhenTabs';
import FilterPanel from '../events/FilterPanel';
import SearchField from '../events/SearchField';
import SortSelect from '../events/SortSelect';
import ViewToggle from '../events/ViewToggle';
import ActiveFilters from '../events/ActiveFilters';
import EmptyResults from '../events/EmptyResults';
import ResultsSkeleton from '../events/ResultsSkeleton';
import useEvents from '../../controllers/useEvents';
import useEventFilters from '../../controllers/useEventFilters';
import usePlan from '../../controllers/usePlan';
import useViewMode from '../../controllers/useViewMode';
import useFlipAnimation from '../../controllers/useFlipAnimation';
import useDocumentTitle from '../../controllers/useDocumentTitle';
import {getQueryTokens} from '../../utils/filterEvents';
import {splitIntoDays} from '../../utils/schedule';
import {getPosterNumbers} from '../../utils/landing';

const EventsPage=()=>{
    useDocumentTitle('All events');
    const {status,events,source,savedAt,error,retry,isRefreshing}=useEvents();
    const filters=useEventFilters(events);
    const plan=usePlan();
    const [view,setView]=useViewMode();
    const [filtersOpen,setFiltersOpen]=useState(false);
    const [filtersVariant,setFiltersVariant]=useState('sheet');

    // Poster numbers follow the full programme order, so "No. 07" never changes while filtering.
    const posterNumbers=useMemo(()=>{
        return getPosterNumbers(events);
    },[events]);

    // One "now" per data load keeps every card's status consistent with each other.
    const now=useMemo(()=>{
        return Date.now();
    },[events]);

    const tokens=useMemo(()=>{
        return getQueryTokens(filters.state.q);
    },[filters.state.q]);

    const results=filters.results;
    let signature=view;
    for(let i=0;i<results.length;i++){
        signature=signature+'|'+results[i].id;
    }
    const registerFlip=useFlipAnimation(signature,view);

    const openFilters=useCallback(()=>{
        let isWide=false;
        try{
            isWide=window.matchMedia('(min-width: 1024px)').matches;
        }
        catch(error){
            isWide=false;
        }
        setFiltersVariant(isWide?'drawer':'sheet');
        setFiltersOpen(true);
    },[]);

    const closeFilters=useCallback(()=>{
        setFiltersOpen(false);
    },[]);

    // Tracks live in the bar on the page; everything else is in the "More filters" panel.
    const moreFilterCount=filters.activeFacetCount-filters.state.facets.track.length;

    // Day headings only make sense when the list is in date order.
    const sections=useMemo(()=>{
        if(filters.state.sort==='soonest'){
            return splitIntoDays(results);
        }
        return [{key:'all',start:null,events:results,hideHeading:true}];
    },[results,filters.state.sort]);

    const hasFilters=filters.activeFilters.length>0;
    const tabTotal=filters.whenCounts[filters.state.when];
    const whenWord=filters.state.when==='past'?'past':'upcoming';
    let summary=results.length+' '+whenWord+' '+(results.length===1?'event':'events');
    if(hasFilters){
        summary=results.length+' of '+tabTotal+' '+whenWord+' events';
    }

    return (
        <section className="page-gutter">
            <div className="mx-auto max-w-[1440px] pb-8 pt-8 md:pt-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="label-mono text-ash">The programme</p>
                        <h1 className="condensed mt-3 text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold leading-[0.9] tracking-tight">
                            All events
                        </h1>
                    </div>
                    {status==='ready'?(
                        <WhenTabs value={filters.state.when} counts={filters.whenCounts} onChange={filters.setWhen}/>
                    ):null}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchField value={filters.queryInput} onChange={filters.setQuery}/>
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
                            <SortSelect value={filters.state.sort} onChange={filters.setSort}/>
                        </div>
                        <ViewToggle value={view} onChange={setView}/>
                    </div>
                </div>

                {status==='ready'?(
                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <TrackBar selected={filters.state.facets.track} counts={filters.facetCounts.track} onToggle={filters.toggleOption}/>
                        <button
                            type="button"
                            onClick={openFilters}
                            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-bone transition-colors hover:border-ash"
                        >
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                            More filters
                            {moreFilterCount>0?(
                                <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-xs font-semibold text-bone">{moreFilterCount}</span>
                            ):null}
                        </button>
                    </div>
                ):null}

                <div className="mt-6">
                    <div className="min-w-0 space-y-6">
                        {status==='ready'?(
                            <div className="space-y-4">
                                <DataSourceNotice source={source} savedAt={savedAt} error={error} onRetry={retry} isRefreshing={isRefreshing}/>
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <p className="tabular shrink-0 text-sm text-ash" role="status" aria-live="polite">{summary}</p>
                                    <DateStrip
                                        buckets={filters.dateBuckets}
                                        selected={filters.state.date}
                                        onSelect={filters.setDate}
                                        totalCount={tabTotal}
                                    />
                                </div>
                                <ActiveFilters filters={filters.activeFilters} onRemove={filters.removeFilter} onClearAll={filters.clearAll}/>
                            </div>
                        ):null}

                        {status==='loading'?(
                            <div aria-busy="true" className="space-y-4">
                                <LoadingPhrase active={true}/>
                                <ResultsSkeleton view={view}/>
                            </div>
                        ):null}

                        {status==='error'?<ErrorState error={error} onRetry={retry} isRetrying={isRefreshing}/>:null}

                        {status==='ready'&&events.length===0?(
                            <div className="border-y border-line py-16">
                                <p className="label-mono text-ash">Programme</p>
                                <h2 className="condensed mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
                                    No events are on the programme right now.
                                </h2>
                                <p className="mt-3 text-ash">The organisers are still putting it together. Check back soon.</p>
                            </div>
                        ):null}

                        {status==='ready'&&events.length>0&&results.length===0?(
                            <EmptyResults
                                suggestion={filters.suggestion}
                                onApplySuggestion={filters.applyState}
                                onClearAll={filters.clearAll}
                                hasFilters={hasFilters}
                                when={filters.state.when}
                                isProgrammeEmpty={events.length===0}
                            />
                        ):null}

                        {status==='ready'&&results.length>0?(
                            <SectionBoundary label="The event list">
                                {view==='index'?(
                                    <ul className="border-t border-line">
                                        {results.map((event)=>{
                                            return (
                                                <li key={event.id} ref={registerFlip(event.id)}>
                                                    <IndexRow
                                                        event={event}
                                                        number={posterNumbers[event.id]}
                                                        tokens={tokens}
                                                        saved={plan.isSaved(event.id)}
                                                        onToggleSave={()=>{
                                                            plan.toggle(event.id);
                                                        }}
                                                        now={now}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ):(
                                    <div className="space-y-14">
                                        {sections.map((section,sectionIndex)=>{
                                            const headingId='day-'+section.key;
                                            return (
                                                <section key={section.key} aria-labelledby={section.hideHeading?undefined:headingId} className="space-y-8">
                                                    {section.hideHeading?null:(
                                                        <DayHeading start={section.start} count={section.events.length} headingId={headingId}/>
                                                    )}
                                                    <ul className="grid grid-flow-dense grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                                        {section.events.map((event,index)=>{
                                                            // Featured events, and a day's only event, get a wide two-column poster.
                                                            const isWide=event.isFeatured||section.events.length===1;
                                                            return (
                                                                <li key={event.id} ref={registerFlip(event.id)} className={isWide?'sm:col-span-2':undefined}>
                                                                    <PosterCard
                                                                        event={event}
                                                                        number={posterNumbers[event.id]}
                                                                        tokens={tokens}
                                                                        saved={plan.isSaved(event.id)}
                                                                        onToggleSave={()=>{
                                                                            plan.toggle(event.id);
                                                                        }}
                                                                        priority={sectionIndex===0&&index===0}
                                                                        now={now}
                                                                        isFeatured={event.isFeatured}
                                                                        isWide={isWide}
                                                                        stamp={section.hideHeading?'date':'time'}
                                                                    />
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </section>
                                            );
                                        })}
                                    </div>
                                )}
                            </SectionBoundary>
                        ):null}
                    </div>
                </div>
            </div>

            <Dialog open={filtersOpen} onClose={closeFilters} labelledBy="filter-sheet-title" variant={filtersVariant}>
                <div className={filtersVariant==='drawer'?'flex h-full flex-col border-l border-line bg-graphite':'flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-line bg-graphite'}>
                    <div className="flex items-center justify-between px-6 pb-3 pt-6">
                        <h2 id="filter-sheet-title" className="condensed text-3xl font-extrabold tracking-tight">More filters</h2>
                        <button
                            type="button"
                            onClick={closeFilters}
                            aria-label="Close filters"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-ash hover:text-bone"
                        >
                            <Icon name="close" size={20}/>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <FilterPanel facets={filters.state.facets} counts={filters.facetCounts} onToggle={filters.toggleOption} idPrefix="sheet" excludeKeys={['track']}/>
                    </div>
                    <div className="flex gap-3 border-t border-line px-6 py-4">
                        {filters.activeFacetCount>0?(
                            <button
                                type="button"
                                onClick={filters.clearAll}
                                className="rounded-full border border-line px-5 py-3 text-sm font-medium text-bone"
                            >
                                Clear all
                            </button>
                        ):null}
                        <button
                            type="button"
                            onClick={closeFilters}
                            className="flex-1 rounded-full bg-signal px-5 py-3 text-sm font-semibold text-bone"
                        >
                            Show {results.length} {results.length===1?'event':'events'}
                        </button>
                    </div>
                </div>
            </Dialog>
        </section>
    );
};

export default EventsPage;
