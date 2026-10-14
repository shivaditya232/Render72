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
import {compareByStart} from '../../models/eventModel';

const EventsPage=()=>{
    useDocumentTitle('All events');
    const {status,events,source,savedAt,error,retry,isRefreshing}=useEvents();
    const filters=useEventFilters(events);
    const plan=usePlan();
    const [view,setView]=useViewMode();
    const [filtersOpen,setFiltersOpen]=useState(false);

    // Poster numbers follow the full programme order, so "No. 07" never changes while filtering.
    const posterNumbers=useMemo(()=>{
        const ordered=events.slice().sort(compareByStart);
        const numbers={};
        for(let i=0;i<ordered.length;i++){
            numbers[ordered[i].id]=i+1;
        }
        return numbers;
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

    const closeFilters=useCallback(()=>{
        setFiltersOpen(false);
    },[]);

    const hasFilters=filters.activeFilters.length>0;
    const tabTotal=filters.whenCounts[filters.state.when];
    const whenWord=filters.state.when==='past'?'past':'upcoming';
    let summary=results.length+' '+whenWord+' '+(results.length===1?'event':'events');
    if(hasFilters){
        summary=results.length+' of '+tabTotal+' '+whenWord+' events';
    }

    return (
        <section className="page-gutter">
            <div className="mx-auto max-w-[1440px] pb-8 pt-10 md:pt-14">
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
                        <button
                            type="button"
                            onClick={()=>{
                                setFiltersOpen(true);
                            }}
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-bone transition-colors hover:border-ash lg:hidden"
                        >
                            Filters
                            {filters.activeFacetCount>0?(
                                <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-xs font-semibold text-bone">{filters.activeFacetCount}</span>
                            ):null}
                        </button>
                        <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
                            <SortSelect value={filters.state.sort} onChange={filters.setSort}/>
                        </div>
                        <ViewToggle value={view} onChange={setView}/>
                    </div>
                </div>

                {status==='ready'?(
                    <div className="mt-5">
                        <DateStrip
                            buckets={filters.dateBuckets}
                            selected={filters.state.date}
                            onSelect={filters.setDate}
                            totalCount={tabTotal}
                        />
                    </div>
                ):null}

                <div className="mt-8 lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12">
                    <aside aria-label="Filters" className="hidden lg:block">
                        <div className="sticky top-24">
                            {status==='ready'?(
                                <FilterPanel facets={filters.state.facets} counts={filters.facetCounts} onToggle={filters.toggleOption} idPrefix="side" layout="list"/>
                            ):null}
                        </div>
                    </aside>

                    <div className="min-w-0 space-y-6">
                        {status==='ready'?(
                            <div className="space-y-4">
                                <DataSourceNotice source={source} savedAt={savedAt} error={error} onRetry={retry} isRefreshing={isRefreshing}/>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="tabular text-sm text-ash" role="status" aria-live="polite">{summary}</p>
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
                                    <ul className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                                        {results.map((event,index)=>{
                                            return (
                                                <li key={event.id} ref={registerFlip(event.id)}>
                                                    <PosterCard
                                                        event={event}
                                                        number={posterNumbers[event.id]}
                                                        tokens={tokens}
                                                        saved={plan.isSaved(event.id)}
                                                        onToggleSave={()=>{
                                                            plan.toggle(event.id);
                                                        }}
                                                        priority={index===0}
                                                        now={now}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </SectionBoundary>
                        ):null}
                    </div>
                </div>
            </div>

            <Dialog open={filtersOpen} onClose={closeFilters} labelledBy="filter-sheet-title" variant="sheet">
                <div className="flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-line bg-graphite">
                    <div className="flex items-center justify-between px-5 pb-3 pt-5">
                        <h2 id="filter-sheet-title" className="text-lg font-semibold">Filters</h2>
                        <button
                            type="button"
                            onClick={closeFilters}
                            aria-label="Close filters"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-ash hover:text-bone"
                        >
                            <Icon name="close" size={20}/>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 pb-6">
                        <FilterPanel facets={filters.state.facets} counts={filters.facetCounts} onToggle={filters.toggleOption} idPrefix="sheet"/>
                    </div>
                    <div className="flex gap-3 border-t border-line px-5 py-4">
                        {filters.activeFacetCount>0?(
                            <button
                                type="button"
                                onClick={filters.clearAll}
                                className="rounded-full border border-line px-5 py-3 text-sm font-medium text-bone"
                            >
                                Clear
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
