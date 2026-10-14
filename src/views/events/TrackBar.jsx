import {TRACKS} from '../../config/tracks';

// The six tracks as coloured chips — the main way people narrow the programme,
// so they stay visible instead of hiding in a panel. Several can be on at once.
// A chip that would give zero results is dimmed (unless it's already on).
const TrackBar=({selected,counts,onToggle})=>{
    return (
        <div role="group" aria-label="Filter by track" className="scroll-row -mx-4 flex gap-2 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {TRACKS.map((track)=>{
                const isOn=selected.includes(track.id);
                const count=counts&&counts[track.id]!==undefined?counts[track.id]:0;
                const isDead=count===0&&!isOn;
                return (
                    <button
                        key={track.id}
                        type="button"
                        aria-pressed={isOn}
                        disabled={isDead}
                        onClick={()=>{
                            onToggle('track',track.id);
                        }}
                        style={isOn?{backgroundColor:track.color,borderColor:track.color}:undefined}
                        className={
                            isOn
                                ?'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-ink transition-colors'
                                :'inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-bone transition-colors hover:border-ash disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line'
                        }
                    >
                        <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{backgroundColor:isOn?'#0B0B0D':track.color}}/>
                        {track.label}
                        <span className={isOn?'tabular text-ink/60':'tabular text-ash'}>{count}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default TrackBar;
