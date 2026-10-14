import {getDateParts} from '../../utils/formatters';

// One chip per day that has events, with how many match right now.
// Scrolls sideways on small screens instead of wrapping into a wall of chips.
const DateStrip=({buckets,selected,onSelect,totalCount})=>{
    if(buckets.length<=1){
        return null;
    }
    const baseClass='flex shrink-0 flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-colors';
    const onClass=' border-bone bg-bone text-ink';
    const offClass=' border-line text-bone hover:border-ash';

    return (
        <div role="group" aria-label="Filter by day" className="scroll-row -mx-4 flex gap-2 px-4 pb-1 sm:mx-0 sm:px-0">
            <button
                type="button"
                aria-pressed={selected===''}
                onClick={()=>{
                    onSelect('');
                }}
                className={baseClass+(selected===''?onClass:offClass)}
            >
                <span className="label-mono opacity-70">Every day</span>
                <span className="tabular text-sm font-semibold">{totalCount} events</span>
            </button>
            {buckets.map((bucket)=>{
                const parts=getDateParts(bucket.start);
                const isOn=selected===bucket.key;
                const isEmpty=bucket.count===0&&!isOn;
                return (
                    <button
                        key={bucket.key}
                        type="button"
                        aria-pressed={isOn}
                        disabled={isEmpty}
                        onClick={()=>{
                            onSelect(bucket.key);
                        }}
                        className={baseClass+(isOn?onClass:offClass)+(isEmpty?' cursor-not-allowed opacity-35 hover:border-line':'')}
                    >
                        <span className="label-mono opacity-70">{parts?parts.weekday+' · '+parts.month:''}</span>
                        <span className="flex items-baseline gap-2">
                            <span className="condensed tabular text-xl font-bold leading-none">{parts?parts.day:''}</span>
                            <span className="tabular text-xs opacity-70">{bucket.count} {bucket.count===1?'event':'events'}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default DateStrip;
