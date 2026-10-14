import {useEffect} from 'react';
import Icon from '../components/Icon';
import {formatPrice} from '../../utils/formatters';
import {TONE_DOT,TONE_TEXT} from '../../utils/availability';

// Phones and tablets: the fee, seat status and main action stay at thumb's reach
// while reading. Hidden from 1024px, where the booking card sticks beside the content.
const MobileBookingBar=({event,availability,canRegister,onRegister,isSaved,onToggleSave})=>{
    const price=formatPrice(event.price,event.isPerHead,event.maxTeam);

    // Make room at the bottom of the page so the bar never covers the footer.
    useEffect(()=>{
        document.body.classList.add('has-action-bar');
        return ()=>{
            document.body.classList.remove('has-action-bar');
        };
    },[]);

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
            <div className="page-gutter mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="tabular truncate font-semibold text-bone">
                        {price.amount}
                        {price.unit?<span className="font-normal text-ash"> {price.unit}</span>:null}
                    </p>
                    <p className={'mt-0.5 flex items-center gap-1.5 text-[0.8125rem] font-medium '+TONE_TEXT[availability.tone]}>
                        <span aria-hidden="true" className={'h-1.5 w-1.5 shrink-0 rounded-full '+TONE_DOT[availability.tone]}/>
                        <span className="truncate">{availability.label}</span>
                    </p>
                </div>
                {canRegister?(
                    <button
                        type="button"
                        onClick={onRegister}
                        className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-signal px-6 text-[0.9375rem] font-semibold text-bone transition-colors hover:bg-[#2747E6]"
                    >
                        <Icon name="ticket" size={18}/>
                        Register
                    </button>
                ):(
                    <button
                        type="button"
                        onClick={onToggleSave}
                        aria-pressed={isSaved}
                        aria-label={isSaved?'Remove '+event.name+' from your plan':'Save '+event.name+' to your plan'}
                        className={isSaved?'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-bone px-5 text-sm font-semibold text-ink':'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-bone'}
                    >
                        <Icon name="bookmark" size={16} className={isSaved?'fill-current':''}/>
                        {isSaved?'Saved':'Save'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MobileBookingBar;
