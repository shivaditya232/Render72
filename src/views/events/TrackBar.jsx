import {TRACKS} from '../../config/tracks';

// The track filter is the site's six-colour mark, made usable: one bar split into six
// segments, each as wide as its share of the programme (so the bar itself says where
// the events are). Each segment rests as a thin stripe of its colour; under the cursor
// the colour rises to fill it, and a chosen track stays filled. Several can be on at once.
// A segment that would give zero results is dimmed (unless it's already on).
// On narrow screens the bar keeps the same look and scrolls sideways.
const TrackBar=({selected,counts,onToggle})=>{
    return (
        <div role="group" aria-label="Filter by track" className="scroll-row -mx-4 min-w-0 flex-1 px-4 pb-1 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-[3px] overflow-hidden rounded-2xl">
                {TRACKS.map((track)=>{
                    const isOn=selected.includes(track.id);
                    const count=counts&&counts[track.id]!==undefined?counts[track.id]:0;
                    const isDead=count===0&&!isOn;
                    // Width follows the share of events; a floor keeps tiny tracks clickable.
                    const grow=Math.max(count,2);
                    let fillClass='scale-y-[0.08] group-hover:scale-y-100';
                    if(isOn){
                        fillClass='scale-y-100';
                    }
                    else if(isDead){
                        fillClass='scale-y-[0.08]';
                    }
                    let textClass='text-bone group-hover:text-ink';
                    if(isOn){
                        textClass='text-ink';
                    }
                    else if(isDead){
                        textClass='text-ash';
                    }
                    return (
                        <button
                            key={track.id}
                            type="button"
                            aria-pressed={isOn}
                            disabled={isDead}
                            onClick={()=>{
                                onToggle('track',track.id);
                            }}
                            style={{'--g':grow}}
                            className={'group relative isolate flex h-14 min-w-max basis-0 items-end justify-between gap-4 overflow-hidden bg-graphite px-4 pb-3 text-left [flex-grow:var(--g)] transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-40'+(isDead?'':' hover:[flex-grow:calc(var(--g)*1.35)]')}
                        >
                            <span
                                aria-hidden="true"
                                className={'absolute inset-0 -z-10 origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] '+fillClass}
                                style={{backgroundColor:track.color}}
                            />
                            <span className={'text-sm font-semibold leading-none transition-colors duration-300 '+textClass}>
                                {track.label}
                            </span>
                            <span className={'tabular text-sm leading-none transition-colors duration-300 '+(isOn?'text-ink/70':(isDead?'text-ash':'text-ash group-hover:text-ink/70'))}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackBar;
