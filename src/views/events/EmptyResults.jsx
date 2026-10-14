import {formatShortDate} from '../../utils/formatters';
import {toIstTime} from '../../models/eventModel';

// No matches: say so plainly, then offer the single change that helps most.
const EmptyResults=({suggestion,onApplySuggestion,onClearAll,hasFilters,when,isProgrammeEmpty})=>{
    // The API itself returned nothing: there is nothing to "match", so say that instead.
    if(isProgrammeEmpty){
        return (
            <div className="flex flex-col items-start gap-4 border-y border-line py-16">
                <p className="label-mono text-ash">Programme</p>
                <h2 className="condensed text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
                    No events are on
                    <br/>
                    the programme yet.
                </h2>
                <p className="text-ash">New events will show up here as soon as the organisers publish them.</p>
            </div>
        );
    }
    let suggestionLabel='';
    if(suggestion){
        suggestionLabel=suggestion.filter.label;
        if(suggestion.filter.type==='date'){
            suggestionLabel=formatShortDate(toIstTime(suggestion.filter.label,'12:00'));
        }
    }
    return (
        <div className="flex flex-col items-start gap-4 border-y border-line py-16">
            <p className="label-mono text-ash">0 results</p>
            <h2 className="condensed text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
                Nothing on the programme
                <br/>
                matches that.
            </h2>
            {!hasFilters&&when==='past'?(
                <p className="text-ash">No events have finished yet.</p>
            ):null}
            <div className="flex flex-wrap gap-3 pt-2">
                {suggestion?(
                    <button
                        type="button"
                        onClick={()=>{
                            onApplySuggestion(suggestion.nextState);
                        }}
                        className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]"
                    >
                        Remove “{suggestionLabel}” to see {suggestion.count} {suggestion.count===1?'event':'events'}
                    </button>
                ):null}
                {hasFilters?(
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-ash"
                    >
                        Clear all filters
                    </button>
                ):null}
            </div>
        </div>
    );
};

export default EmptyResults;
