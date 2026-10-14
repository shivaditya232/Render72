import {WHEN_OPTIONS} from '../../config/filterOptions';

// Upcoming / Past, with counts. A segmented control, not two separate pages.
const WhenTabs=({value,counts,onChange})=>{
    return (
        <div role="group" aria-label="Upcoming or past events" className="inline-flex rounded-full border border-line p-1">
            {WHEN_OPTIONS.map((option)=>{
                const isOn=value===option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isOn}
                        onClick={()=>{
                            onChange(option.value);
                        }}
                        className={isOn?'rounded-full bg-bone px-4 py-1.5 text-sm font-semibold text-ink':'rounded-full px-4 py-1.5 text-sm font-medium text-ash transition-colors hover:text-bone'}
                    >
                        {option.label}
                        <span className={isOn?'tabular ml-1.5 text-ink/60':'tabular ml-1.5 text-ash/70'}>{counts[option.value]}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default WhenTabs;
