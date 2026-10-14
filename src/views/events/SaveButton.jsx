import Icon from '../components/Icon';

// Bookmark toggle. Sits above the card's main link, so it never opens the event by accident.
const SaveButton=({eventName,saved,onToggle,variant})=>{
    const label=saved?'Remove '+eventName+' from your plan':'Save '+eventName+' to your plan';
    const onClick=(event)=>{
        event.preventDefault();
        event.stopPropagation();
        onToggle();
    };
    if(variant==='plain'){
        return (
            <button
                type="button"
                onClick={onClick}
                aria-pressed={saved}
                aria-label={label}
                title={saved?'Saved to your plan':'Save to your plan'}
                className={saved?'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone text-ink transition-colors':'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-ash hover:text-bone'}
            >
                <Icon name="bookmark" size={16} className={saved?'fill-current':''}/>
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={saved}
            aria-label={label}
            title={saved?'Saved to your plan':'Save to your plan'}
            className={saved?'relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-bone text-ink shadow-lg shadow-black/40 transition-transform active:scale-90':'relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-bone backdrop-blur-sm transition-[transform,background-color] hover:bg-ink active:scale-90'}
        >
            <Icon name="bookmark" size={17} className={saved?'fill-current':''}/>
        </button>
    );
};

export default SaveButton;
