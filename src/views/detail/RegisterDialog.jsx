import Dialog from '../components/Dialog';
import Icon from '../components/Icon';
import {formatPrice,formatTeamSize,formatShortDate,formatTime} from '../../utils/formatters';

// "Before you register": everything a team needs to have ready, in one place.
// This site is the programme, so it doesn't take bookings or payments itself (said plainly in the dialog).
const RegisterDialog=({open,onClose,event,isSaved,onToggleSave})=>{
    return (
        <Dialog open={open} onClose={onClose} labelledBy="register-title" variant="modal">
            {event?<RegisterContent event={event} onClose={onClose} isSaved={isSaved} onToggleSave={onToggleSave}/>:null}
        </Dialog>
    );
};

const Row=({label,children})=>{
    return (
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-t border-line py-3 text-sm">
            <dt className="text-ash">{label}</dt>
            <dd className="text-bone">{children}</dd>
        </div>
    );
};

const RegisterContent=({event,onClose,isSaved,onToggleSave})=>{
    const price=formatPrice(event.price,event.isPerHead,event.maxTeam);
    const team=formatTeamSize(event.minTeam,event.maxTeam);
    return (
        <div className="flex max-h-[88dvh] flex-col rounded-t-2xl border border-line bg-graphite sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 p-5 pb-3 sm:p-6 sm:pb-3">
                <div>
                    <p className="label-mono" style={{color:event.track.color}}>Before you register</p>
                    <h2 id="register-title" className="condensed mt-2 text-[1.75rem] font-bold leading-[1.02] tracking-tight">{event.name}</h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ash transition-colors hover:text-bone"
                >
                    <Icon name="close" size={18}/>
                </button>
            </div>
            <div className="overflow-y-auto px-5 sm:px-6">
                <dl>
                    {team?<Row label="Team">{team}</Row>:null}
                    <Row label="Fee">
                        {price.amount}
                        {price.unit?<span className="text-ash"> {price.unit}</span>:null}
                    </Row>
                    {event.registrationDeadline!==null?(
                        <Row label="Closes">{formatShortDate(event.registrationDeadline)}, {formatTime(event.registrationDeadline)} IST</Row>
                    ):null}
                    {event.eligibility.length>0?(
                        <Row label="Who can enter">
                            <ul className="space-y-1.5">
                                {event.eligibility.map((item,index)=>{
                                    return <li key={index}>{item}</li>;
                                })}
                            </ul>
                        </Row>
                    ):null}
                    {event.prerequisites.length>0?(
                        <Row label="Bring">
                            <ul className="space-y-1.5">
                                {event.prerequisites.map((item,index)=>{
                                    return <li key={index}>{item}</li>;
                                })}
                            </ul>
                        </Row>
                    ):null}
                </dl>
                <p className="mt-2 rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm leading-relaxed text-ash">
                    This site is the programme: it doesn’t take bookings or payments. Save the event to your plan so the deadline doesn’t slip past you.
                </p>
            </div>
            <div className="flex gap-2 p-5 sm:p-6">
                <button
                    type="button"
                    onClick={onToggleSave}
                    aria-pressed={isSaved}
                    className={isSaved?'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-bone px-4 text-sm font-semibold text-ink':'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-signal px-4 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]'}
                >
                    <Icon name="bookmark" size={16} className={isSaved?'fill-current':''}/>
                    {isSaved?'Saved to your plan':'Save to your plan'}
                </button>
                <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-medium text-bone transition-colors hover:border-ash">
                    Close
                </button>
            </div>
        </div>
    );
};

export default RegisterDialog;
