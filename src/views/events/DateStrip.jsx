import {getDateParts} from '../../utils/formatters';

// Compact day pills: "All days 28 · Fri 13 8 · Sat 14 10 …".
// Each shows how many events match right now; a day with none is dimmed.
// Scrolls sideways on small screens instead of wrapping into a wall of chips.
const DateStrip=({buckets,selected,onSelect,totalCount})=>{
    if(buckets.length<=1){
        return null;
    }
    const baseClass='relative inline-flex shrink-0 items-baseline gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors';
    const onClass=' border-bone bg-bone text-ink';
    const offClass=' border-line text-bone hover:border-ash';

    return (
        <div role="group" aria-label="Filter by day" className="scroll-row -mx-4 flex gap-2 px-4 sm:mx-0 sm:px-0">
            <button
                type="button"
                aria-pressed={selected===''}
                onClick={()=>{
                    onSelect('');
                }}
                className={baseClass+(selected===''?onClass:offClass)}
            >
                <span className="font-medium">All days</span>
                <span className={selected===''?'tabular text-xs text-ink/60':'tabular text-xs text-ash'}>{totalCount}</span>
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
                        {/* Read as "Fri 13, 8 events, Nov": the visible words stay in order inside that name. */}
                        <span className={isOn?'text-ink/70':'text-ash'}>{parts?parts.weekday:bucket.key}</span>
                        <span className="tabular font-semibold">{parts?parts.day:''}</span>
                        <span className="sr-only">, </span>
                        <span className={isOn?'tabular text-xs text-ink/60':'tabular text-xs text-ash'}>{bucket.count}</span>
                        <span className="sr-only">{bucket.count===1?' event':' events'}{parts?', '+parts.month:''}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default DateStrip;
