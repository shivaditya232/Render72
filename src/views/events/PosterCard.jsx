import {useRef} from 'react';
import {Link} from 'react-router';
import PosterImage from './PosterImage';
import SaveButton from './SaveButton';
import SeatsMeter from './SeatsMeter';
import Highlight from './Highlight';
import {getAvailability} from '../../utils/availability';
import {getDateParts,formatSpan,formatPrice,formatTeamSize,formatPosterNumber,isMultiDay} from '../../utils/formatters';

const POSTER_SIZES='(min-width:1360px) 300px, (min-width:1024px) 28vw, (min-width:640px) 46vw, 92vw';

// One event as a poster: two-tone cover with the date set large,
// then the facts people scan for — time, place, team, fee, seats.
const PosterCard=({event,number,tokens,saved,onToggleSave,priority,now})=>{
    const date=getDateParts(event.start);
    const availability=getAvailability(event,now);
    const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
    const team=formatTeamSize(event.minTeam,event.maxTeam);
    const time=formatSpan(event.start,event.end);
    const spansDays=isMultiDay(event.start,event.end);
    const frameRef=useRef(null);
    const pending=useRef(false);

    // Track the mouse over the whole card (the link layer covers the image),
    // and move the colour spotlight. At most one update per frame.
    const onPointerMove=(pointerEvent)=>{
        if(pointerEvent.pointerType!=='mouse'||pending.current){
            return;
        }
        pending.current=true;
        const clientX=pointerEvent.clientX;
        const clientY=pointerEvent.clientY;
        requestAnimationFrame(()=>{
            pending.current=false;
            const frame=frameRef.current;
            if(!frame){
                return;
            }
            const rect=frame.getBoundingClientRect();
            frame.style.setProperty('--x',(clientX-rect.left)+'px');
            frame.style.setProperty('--y',(clientY-rect.top)+'px');
        });
    };

    return (
        <article className="poster-card group relative flex h-full flex-col" onPointerMove={onPointerMove}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <PosterImage
                    url={event.cover.url}
                    alt={event.cover.alt}
                    trackLabel={event.track.label}
                    sizes={POSTER_SIZES}
                    priority={priority}
                    frameRef={frameRef}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
                    <span className="label-mono rounded-md bg-ink/75 px-2 py-1 text-bone backdrop-blur-sm">{formatPosterNumber(number)}</span>
                </div>
                <div className="absolute right-3 top-3">
                    <SaveButton eventName={event.name} saved={saved} onToggle={onToggleSave}/>
                </div>
                {date?(
                    <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end gap-3 text-bone">
                        <span className="condensed tabular text-[4.25rem] font-extrabold leading-[0.78] tracking-tight">{date.day}</span>
                        <span className="label-mono pb-1 leading-tight">
                            {date.month}
                            <br/>
                            {date.weekday}{spansDays?' +':''}
                        </span>
                    </div>
                ):null}
            </div>

            <div className="flex flex-1 flex-col gap-3 pt-4">
                <p className="label-mono text-ash">{event.track.label} · {event.category}</p>
                <h3 className="condensed text-[1.5rem] font-bold leading-[1.05] tracking-tight text-bone">
                    {/* The whole card is clickable through this link's ::after layer. */}
                    <Link to={'/events/'+event.id} className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal-soft">
                        <Highlight text={event.name} tokens={tokens}/>
                    </Link>
                </h3>
                <p className="text-sm text-ash">
                    {time?time+' IST':'Time to be announced'}
                    <span aria-hidden="true"> · </span>
                    {event.mode==='ONLINE'?'Online':'On campus'}
                </p>
                <div className="mt-auto space-y-3 border-t border-line pt-3">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-ash">{team}</span>
                        <span className="tabular font-semibold text-bone">
                            {price.amount}
                            {price.unit?<span className="font-normal text-ash"> {price.unit}</span>:null}
                        </span>
                    </div>
                    <SeatsMeter event={event} availability={availability}/>
                </div>
            </div>
        </article>
    );
};

export default PosterCard;
