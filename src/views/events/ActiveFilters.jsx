import Icon from '../components/Icon';
import {formatShortDate} from '../../utils/formatters';
import {toIstTime} from '../../models/eventModel';

// What's switched on, as removable pills, plus one "Clear all".
const ActiveFilters=({filters,onRemove,onClearAll})=>{
    if(filters.length===0){
        return null;
    }
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono mr-1 text-ash">Showing</span>
            {filters.map((filter)=>{
                let label=filter.label;
                if(filter.type==='date'){
                    label=formatShortDate(toIstTime(filter.label,'12:00'));
                }
                return (
                    <button
                        key={filter.type+':'+(filter.key||'')+':'+(filter.value||filter.label)}
                        type="button"
                        onClick={()=>{
                            onRemove(filter);
                        }}
                        aria-label={'Remove filter: '+label}
                        className="inline-flex items-center gap-1.5 rounded-full bg-raised px-3 py-1.5 text-[0.8125rem] font-medium text-bone transition-colors hover:bg-line"
                    >
                        {label}
                        <Icon name="close" size={13} className="text-ash"/>
                    </button>
                );
            })}
            <button
                type="button"
                onClick={onClearAll}
                className="px-2 py-1.5 text-[0.8125rem] font-medium text-signal-soft transition-colors hover:text-bone"
            >
                Clear all
            </button>
        </div>
    );
};

export default ActiveFilters;
