import {Link} from 'react-router';
import Icon from '../components/Icon';
import Countdown from './Countdown';
import TrackDock from './TrackDock';
import {TRACKS} from '../../config/tracks';
import {formatDateRange} from '../../utils/formatters';
import {toHeadlineNumber} from '../../utils/landing';

// The first screen. The headline is built from the live data ("Three days. 27 events."),
// so it can never disagree with the programme below it. Without data it says nothing
// it can't back up ("Every track. Every event.").
const HeroSection=({festWindow,status,trackSummaries,hasClosingSoon,notice})=>{
    const hasData=status==='ready'&&festWindow;
    let dayLine='Every track.';
    let eventLine='Every event.';
    let dateLabel='The programme';
    if(hasData){
        dayLine=toHeadlineNumber(festWindow.days.length)+(festWindow.days.length===1?' day.':' days.');
        eventLine=festWindow.eventCount+' events.';
        dateLabel='The programme · '+formatDateRange(festWindow.start,festWindow.end);
    }

    return (
        <section className="page-gutter" aria-labelledby="hero-title">
            <div className="mx-auto max-w-[1440px]">
                <div className="grid gap-10 pb-10 pt-8 md:pt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div>
                        <p className="label-mono text-ash">{dateLabel}</p>
                        <h1 id="hero-title" className="condensed mt-5 text-[clamp(3.5rem,9.5vw,8.75rem)] font-extrabold leading-[0.84] tracking-[-0.02em]">
                            <span className="block">{dayLine}</span>
                            <span className="block">{eventLine}</span>
                            <span className="block">Find yours.</span>
                        </h1>
                        {/* Six segments, one per track colour: the site's mark in miniature. */}
                        <div aria-hidden="true" className="mt-6 flex h-1.5 w-full max-w-[18rem] overflow-hidden rounded-full">
                            {TRACKS.map((track)=>{
                                return <span key={track.id} className="flex-1" style={{backgroundColor:track.color}}/>;
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-7 lg:items-end lg:pb-3">
                        {hasData?(
                            <Countdown targetMs={festWindow.start} endMs={festWindow.end} label="The programme opens"/>
                        ):null}
                        <div className="flex flex-wrap gap-3">
                            <Link to="/events" className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3.5 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]">
                                Browse the programme
                                <Icon name="arrowRight" size={16}/>
                            </Link>
                            {hasClosingSoon?(
                                <a href="#closing-soon" className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-medium text-bone transition-colors hover:border-ash">
                                    Closing soon
                                </a>
                            ):null}
                        </div>
                    </div>
                </div>

                {status==='ready'?(
                    <TrackDock summaries={trackSummaries}/>
                ):null}
                {/* When there's nothing to show (error, empty programme), the explanation takes
                    the dock's place, right under the headline instead of below the fold. */}
                {status!=='ready'&&status!=='loading'?notice:null}
                {status==='loading'?(
                    <div aria-hidden="true" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:h-[clamp(20rem,44vh,28rem)]">
                        {TRACKS.map((track)=>{
                            return <div key={track.id} className="skeleton aspect-[6/5] rounded-2xl lg:aspect-auto lg:flex-1"/>;
                        })}
                    </div>
                ):null}
            </div>
        </section>
    );
};

export default HeroSection;
