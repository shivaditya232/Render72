import {Link} from 'react-router';
import Icon from '../components/Icon';
import SeatsMeter from '../events/SeatsMeter';
import {formatPrice,formatTeamSize,formatShortDate,formatTime,formatRelative} from '../../utils/formatters';
import {getCalendarFileName} from '../../utils/eventDetail';
import {downloadCalendarFile} from '../../utils/calendarFile';

// What the main button area says for each state of the event.
const getBookingState=(event,availability)=>{
    if(availability.key==='ended'){
        return {canRegister:false,title:'This event has ended',text:'Registration is over. The rest of the programme is still open.'};
    }
    if(availability.key==='closed'){
        return {canRegister:false,title:'Closed by organisers',text:'The organisers have closed this event. Nothing to book here.'};
    }
    if(availability.key==='sold_out'){
        return {canRegister:false,title:'Sold out',text:'Every place is taken. Save it to your plan and check back: cancelled places come back here.'};
    }
    if(availability.key==='reg_closed'){
        let text='Registration has closed.';
        if(event.registrationDeadline!==null){
            text='Registration closed on '+formatShortDate(event.registrationDeadline)+'.';
        }
        return {canRegister:false,title:'Registration closed',text};
    }
    return {canRegister:event.canRegister,title:'',text:''};
};

const ActionButton=({onClick,icon,label,pressed,children})=>{
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={pressed}
            className={pressed?'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-bone px-3 text-sm font-medium text-ink transition-colors':'fx-fill inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm font-medium text-bone'}
        >
            <Icon name={icon} size={16} className={pressed&&icon==='bookmark'?'fill-current':''}/>
            {children||label}
        </button>
    );
};

// The booking panel: fee, team, seats, deadline, then one clear action for the event's state.
// Sticky beside the content on desktop; first thing under the title on phones.
const BookingCard=({event,availability,now,isSaved,onToggleSave,clashes,onRegister,share,isPartial})=>{
    const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
    const team=formatTeamSize(event.minTeam,event.maxTeam);
    const state=getBookingState(event,availability);
    const showDeadline=event.registrationDeadline!==null&&!event.isPast&&!event.deadlinePassed&&event.status==='ACTIVE';
    const canExport=event.start!==null&&!event.isPast;

    let shareLabel='Share';
    if(share.status==='copied'){
        shareLabel='Link copied';
    }
    else if(share.status==='shared'){
        shareLabel='Shared';
    }

    const onShare=()=>{
        share.share({title:event.name+' · Render72',text:event.blurb,url:window.location.origin+'/events/'+event.id});
    };

    const onCalendar=()=>{
        downloadCalendarFile([event],getCalendarFileName(event.name));
    };

    return (
        <div id="booking" className="scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-graphite">
            <div className="h-1" style={{backgroundColor:event.track.color}} aria-hidden="true"/>
            <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="label-mono text-ash">Fee</p>
                        <p className="tabular mt-1.5 text-[2rem] font-bold leading-none text-bone">{price.amount}</p>
                    </div>
                    <p className="pb-0.5 text-right text-sm text-ash">
                        {price.unit?<span className="block">{price.unit}</span>:null}
                        {team?<span className="block text-bone">{team}</span>:null}
                    </p>
                </div>

                <SeatsMeter event={event} availability={availability}/>

                {showDeadline?(
                    <div className="border-t border-line pt-4">
                        <p className="label-mono text-ash">Registration closes</p>
                        <p className="mt-1.5 text-sm text-bone">
                            <span className="font-semibold">{formatShortDate(event.registrationDeadline)}, {formatTime(event.registrationDeadline)}</span>
                            <span className="text-ash"> · {formatRelative(event.registrationDeadline,now)}</span>
                        </p>
                    </div>
                ):null}

                {clashes.length>0?(
                    <div role="note" className="flex gap-2.5 rounded-xl border border-few/30 bg-few/[0.06] px-3.5 py-3 text-sm text-bone">
                        <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-few"/>
                        <p>
                            Clashes with{' '}
                            {clashes.map((other,index)=>{
                                return (
                                    <span key={other.id}>
                                        {index>0?(index===clashes.length-1?' and ':', '):''}
                                        <Link to={'/events/'+other.id} className="font-semibold text-few transition-colors hover:text-bone">{other.name}</Link>
                                    </span>
                                );
                            })}
                            {' '}in your plan.
                        </p>
                    </div>
                ):null}

                {state.canRegister?(
                    <button
                        type="button"
                        onClick={onRegister}
                        className="fx-magnet inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-signal px-6 text-[0.9375rem] font-semibold text-bone hover:bg-[#2747E6]"
                    >
                        <Icon name="ticket" size={18}/>
                        Register
                    </button>
                ):null}

                {!state.canRegister&&state.title?(
                    <div className="rounded-xl border border-line bg-ink/60 px-4 py-3.5">
                        <p className="font-semibold text-bone">{state.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ash">{state.text}</p>
                    </div>
                ):null}

                {isPartial?(
                    <p className="text-xs text-ash">Seats and dates are from the programme list. Full details are still loading.</p>
                ):null}

                <div className="flex gap-2">
                    <ActionButton onClick={onToggleSave} icon="bookmark" pressed={isSaved} label={isSaved?'Saved':'Save'}/>
                    {canExport?(
                        <ActionButton onClick={onCalendar} icon="calendar" label="Calendar"/>
                    ):null}
                    <ActionButton onClick={onShare} icon={share.status==='copied'?'check':'share'} label={shareLabel}/>
                </div>

                <p role="status" aria-live="polite" className="sr-only">
                    {share.status==='copied'?'Link copied to the clipboard.':''}
                </p>

                {share.status==='failed'?(
                    <div className="space-y-2">
                        <label htmlFor="share-link" className="text-sm text-ash">Copy this link to share it:</label>
                        <div className="flex gap-2">
                            <input
                                id="share-link"
                                readOnly
                                value={window.location.origin+'/events/'+event.id}
                                onFocus={(focusEvent)=>{
                                    focusEvent.target.select();
                                }}
                                className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 text-sm text-bone"
                            />
                            <button type="button" onClick={share.dismiss} className="rounded-lg border border-line px-3 text-sm text-ash hover:text-bone">Done</button>
                        </div>
                    </div>
                ):null}
            </div>
        </div>
    );
};

export default BookingCard;
