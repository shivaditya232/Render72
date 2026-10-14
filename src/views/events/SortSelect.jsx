import {SORTS} from '../../config/filterOptions';

// A real <select>: works with keyboard, screen readers and the phone's native picker.
const SortSelect=({value,onChange})=>{
    return (
        <div className="relative w-full">
            <label htmlFor="event-sort" className="sr-only">Sort events by</label>
            <select
                id="event-sort"
                value={value}
                onChange={(event)=>{
                    onChange(event.target.value);
                }}
                className="h-12 w-full appearance-none truncate rounded-full border border-line bg-graphite pl-4 pr-10 text-sm font-medium text-bone focus:border-ash focus:outline-none"
            >
                {SORTS.map((sort)=>{
                    return <option key={sort.value} value={sort.value}>{sort.label}</option>;
                })}
            </select>
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ash">
                <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
};

export default SortSelect;
