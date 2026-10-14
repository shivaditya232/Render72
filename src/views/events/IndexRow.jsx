import {Link} from 'react-router';
import SaveButton from './SaveButton';
import Highlight from './Highlight';
import {getAvailability,TONE_DOT,TONE_TEXT} from '../../utils/availability';
import {getDateParts,formatTimeRange,formatShortDate,formatPrice,formatTeamSize,formatPosterNumber,isMultiDay} from '../../utils/formatters';

// The dense view: one line per event, built for scanning and comparing.
// Columns appear as space allows, so the event name always gets room:
//   phone:  No. | name (+ date, track) | save, with status · fee underneath
//   md/lg:  No. | date | name (+ team · fee) | status | save
//   xl:     + its own fee column
//   2xl:    + its own team column
const IndexRow=({event,number,tokens,saved,onToggleSave,now})=>{
    const date=getDateParts(event.start);
    const availability=getAvailability(event,now);
    const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
    const priceText=price.amount+(price.unit?' '+price.unit:'');
    const team=formatTeamSize(event.minTeam,event.maxTeam);
    // Multi-day events get "Until Sun 15 Nov" instead of a squeezed time range.
    const time=isMultiDay(event.start,event.end)?'Until '+formatShortDate(event.end):formatTimeRange(event.start,event.end);

    return (
        <article className="group relative grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-line py-4 transition-colors hover:bg-graphite/60 md:grid-cols-[2.5rem_7.5rem_minmax(0,1fr)_9.5rem_auto] md:gap-x-6 md:px-2 xl:grid-cols-[2.5rem_7.5rem_minmax(0,1fr)_8rem_9.5rem_auto] 2xl:grid-cols-[2.5rem_7.5rem_minmax(0,1fr)_8.5rem_8rem_9.5rem_auto]">
            <span className="label-mono row-span-2 self-start pt-1 text-ash md:row-span-1 md:self-center md:pt-0">{formatPosterNumber(number).replace('No. ','')}</span>

            <div className="hidden md:block">
                {date?(
                    <p className="tabular text-sm font-semibold text-bone">{date.weekday} {date.day} {date.month}</p>
                ):<p className="text-sm text-ash">TBA</p>}
                <p className="tabular whitespace-nowrap text-xs text-ash">{time}</p>
            </div>

            <div className="min-w-0">
                <h3 className="line-clamp-3 text-base font-semibold leading-snug text-bone">
                    <Link to={'/events/'+event.id} className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-signal-soft">
                        <Highlight text={event.name} tokens={tokens}/>
                    </Link>
                </h3>
                <p className="mt-0.5 truncate text-xs text-ash">
                    <span className="md:hidden">{date?date.weekday+' '+date.day+' '+date.month+' · ':''}</span>
                    {event.track.label}
                    <span className="hidden md:inline 2xl:hidden"> · {team}</span>
                    <span className="hidden md:inline xl:hidden"> · {priceText}</span>
                    {event.mode==='ONLINE'?' · Online':''}
                </p>
            </div>

            <p className="hidden truncate text-sm text-ash 2xl:block">{team}</p>

            <p className="hidden text-sm leading-tight xl:block">
                <span className="tabular font-semibold text-bone">{price.amount}</span>
                {price.unit?<span className="block text-xs text-ash">{price.unit}</span>:null}
            </p>

            <p className={'col-start-2 flex min-w-0 items-center gap-2 text-xs font-medium md:col-start-auto md:text-sm '+TONE_TEXT[availability.tone]}>
                <span aria-hidden="true" className={'h-1.5 w-1.5 shrink-0 rounded-full '+TONE_DOT[availability.tone]}/>
                <span className="truncate">{availability.label}</span>
                <span className="shrink-0 text-ash md:hidden">· {price.amount}</span>
            </p>

            <div className="col-start-3 row-span-2 row-start-1 md:col-start-auto md:row-span-1 md:row-start-auto">
                <SaveButton eventName={event.name} saved={saved} onToggle={onToggleSave} variant="plain"/>
            </div>
        </article>
    );
};

export default IndexRow;
