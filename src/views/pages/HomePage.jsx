import {useMemo} from 'react';
import {Link} from 'react-router';
import Icon from '../components/Icon';
import ErrorState from '../components/ErrorState';
import DataSourceNotice from '../components/DataSourceNotice';
import SectionBoundary from '../components/SectionBoundary';
import HeroSection from '../home/HeroSection';
import StatsStrip from '../home/StatsStrip';
import ClosingSoon from '../home/ClosingSoon';
import FeaturedPosters from '../home/FeaturedPosters';
import DaysAtAGlance from '../home/DaysAtAGlance';
import useEvents from '../../controllers/useEvents';
import useDocumentTitle from '../../controllers/useDocumentTitle';
import {getFestWindow,getTrackSummaries,getClosingSoon,getFeatured,getProgrammeStats,getPosterNumbers} from '../../utils/landing';

const CLOSING_SOON_COUNT=4;

// The landing page. Every section is worked out from the live event list,
// and each is wrapped so one failing section can't take the page down.
const HomePage=()=>{
    useDocumentTitle(null);
    const {status,events,source,savedAt,error,retry,isRefreshing}=useEvents();

    // One "now" per data load keeps every status on the page consistent.
    const now=useMemo(()=>{
        return Date.now();
    },[events]);

    const derived=useMemo(()=>{
        const festWindow=getFestWindow(events);
        return {
            festWindow,
            trackSummaries:getTrackSummaries(events),
            closingSoon:getClosingSoon(events,CLOSING_SOON_COUNT),
            featured:getFeatured(events),
            stats:getProgrammeStats(events,festWindow),
            posterNumbers:getPosterNumbers(events)
        };
    },[events]);

    const isReady=status==='ready'&&events.length>0;
    // What the hero should show: the dock, skeleton bands while loading, or nothing.
    let heroStatus=status;
    if(status==='ready'&&!isReady){
        heroStatus='empty';
    }

    return (
        <div className="space-y-20 pb-8 md:space-y-28">
            <HeroSection
                festWindow={derived.festWindow}
                status={heroStatus}
                trackSummaries={derived.trackSummaries}
                hasClosingSoon={isReady&&derived.closingSoon.length>0}
                notice={status==='error'?(
                    <ErrorState error={error} onRetry={retry} isRetrying={isRefreshing} compact/>
                ):(
                    <p className="max-w-xl border-t border-line pt-6 text-ash">The programme hasn’t been published yet. Check back soon.</p>
                )}
            />

            {status==='ready'&&source!=='network'&&error?(
                <div className="page-gutter -mt-12 md:-mt-20">
                    <div className="mx-auto max-w-[1440px]">
                        <DataSourceNotice source={source} savedAt={savedAt} error={error} onRetry={retry} isRefreshing={isRefreshing}/>
                    </div>
                </div>
            ):null}

            {isReady?(
                <>
                    <SectionBoundary label="The numbers">
                        <StatsStrip stats={derived.stats}/>
                    </SectionBoundary>
                    <SectionBoundary label="Closing soon">
                        <ClosingSoon events={derived.closingSoon} now={now}/>
                    </SectionBoundary>
                    <SectionBoundary label="Featured events">
                        <FeaturedPosters events={derived.featured} posterNumbers={derived.posterNumbers} now={now}/>
                    </SectionBoundary>
                    <SectionBoundary label="The timetable">
                        <DaysAtAGlance festWindow={derived.festWindow} now={now}/>
                    </SectionBoundary>

                    <section className="page-gutter" aria-labelledby="cta-title">
                        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 border-t border-line pt-16 md:flex-row md:items-end md:justify-between">
                            <h2 id="cta-title" className="condensed max-w-3xl text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.9] tracking-tight">
                                Save what you like. We’ll flag the clashes.
                            </h2>
                            <Link to="/events" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-signal px-6 py-3.5 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]">
                                Start planning
                                <Icon name="arrowRight" size={16}/>
                            </Link>
                        </div>
                    </section>
                </>
            ):null}
        </div>
    );
};

export default HomePage;
