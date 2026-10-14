import {Link,NavLink} from 'react-router';
import Wordmark from '../components/Wordmark';
import Icon from '../components/Icon';
import usePlan from '../../controllers/usePlan';

const getNavClass=({isActive})=>{
    if(isActive){
        return 'relative py-1 text-sm font-medium text-bone after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-bone';
    }
    return 'relative py-1 text-sm font-medium text-ash transition-colors hover:text-bone';
};

const Header=({onOpenPlan})=>{
    const plan=usePlan();
    return (
        <header className="page-gutter sticky top-0 z-40 border-b border-line/60 bg-ink/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4">
                <Link to="/" className="shrink-0 rounded-md" aria-label="Render72, back to the programme">
                    <Wordmark/>
                </Link>
                <nav aria-label="Main" className="flex items-center gap-5 sm:gap-7">
                    <ul className="flex items-center gap-5 sm:gap-7">
                        <li className="hidden sm:block">
                            <NavLink to="/" end className={getNavClass}>Programme</NavLink>
                        </li>
                        <li>
                            <NavLink to="/events" className={getNavClass}>
                                <span className="sm:hidden">Events</span>
                                <span className="hidden sm:inline">All events</span>
                            </NavLink>
                        </li>
                    </ul>
                    {onOpenPlan?(
                        <button
                            type="button"
                            onClick={onOpenPlan}
                            className="inline-flex items-center gap-2 rounded-full border border-line py-1.5 pl-3 pr-1.5 text-sm font-medium text-bone transition-colors hover:border-ash"
                        >
                            {/* Named by its own text ("Your plan 2 events saved"), so what you see is what a screen reader says. */}
                            <Icon name="bookmark" size={15} className={plan.count>0?'fill-current':''}/>
                            <span className="sr-only sm:not-sr-only">Your plan</span>
                            {' '}
                            <span
                                key={plan.count}
                                className={plan.count>0?'tabular flex h-6 min-w-6 animate-[bump_0.35s_ease-out] items-center justify-center rounded-full bg-signal px-1.5 text-xs font-semibold text-bone':'tabular flex h-6 min-w-6 items-center justify-center rounded-full bg-line px-1.5 text-xs font-semibold text-ash'}
                            >
                                {plan.count}
                            </span>
                            <span className="sr-only">{plan.count===1?' event saved':' events saved'}</span>
                        </button>
                    ):null}
                </nav>
            </div>
        </header>
    );
};

export default Header;
