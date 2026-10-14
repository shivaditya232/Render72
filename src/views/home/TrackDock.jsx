import {useCallback,useEffect,useRef} from 'react';
import {Link} from 'react-router';
import Icon from '../components/Icon';
import {getSizedImageUrl} from '../../utils/images';

// The six tracks as colour bands, like the macOS dock: bands near the cursor
// swell, the one under it opens up and shows what's inside. Click to browse that track.
//
// How it works: on pointermove we give every band a target "weight" from its distance
// to the cursor (a bell curve), then ease each band's flex-grow towards it, one
// requestAnimationFrame at a time. Nothing re-renders in React; we only write
// flex-grow and a --w variable (used by CSS to fade the details in).
// The loop stops as soon as everything has settled, so an idle page costs nothing.

const SPREAD_PX=190;      // how far the swell reaches either side of the cursor
const MAX_BOOST=2.4;      // extra weight for the band right under the cursor
const EASE=0.16;          // how quickly bands follow (0..1 per frame)

const prefersReducedMotion=()=>{
    try{
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    catch(error){
        return false;
    }
};

// One clean name for screen readers, instead of "01 5 events Browse Code & AI".
const getLinkLabel=(summary)=>{
    const noun=summary.count===1?'event':'events';
    return summary.track.label+', '+summary.count+' upcoming '+noun;
};

const TrackDock=({summaries})=>{
    const bandRefs=useRef([]);
    const current=useRef([]);
    const target=useRef([]);
    const frame=useRef(0);

    const step=useCallback(()=>{
        frame.current=0;
        let moving=false;
        for(let i=0;i<bandRefs.current.length;i++){
            const band=bandRefs.current[i];
            if(!band){
                continue;
            }
            const from=current.current[i]||1;
            const to=target.current[i]||1;
            let next=from+(to-from)*EASE;
            if(Math.abs(to-next)<0.002){
                next=to;
            }
            else{
                moving=true;
            }
            current.current[i]=next;
            band.style.flexGrow=String(next);
            band.style.setProperty('--w',next.toFixed(3));
        }
        if(moving){
            frame.current=requestAnimationFrame(step);
        }
    },[]);

    const run=useCallback(()=>{
        if(!frame.current){
            frame.current=requestAnimationFrame(step);
        }
    },[step]);

    // Weights from a point on the x axis (cursor, or the centre of a focused band).
    const aimAt=useCallback((x)=>{
        for(let i=0;i<bandRefs.current.length;i++){
            const band=bandRefs.current[i];
            if(!band){
                continue;
            }
            const rect=band.getBoundingClientRect();
            const centre=rect.left+rect.width/2;
            const distance=(centre-x)/SPREAD_PX;
            target.current[i]=1+MAX_BOOST*Math.exp(-distance*distance);
        }
        run();
    },[run]);

    const relax=useCallback(()=>{
        for(let i=0;i<bandRefs.current.length;i++){
            target.current[i]=1;
        }
        run();
    },[run]);

    const onPointerMove=(event)=>{
        if(event.pointerType!=='mouse'||prefersReducedMotion()){
            return;
        }
        aimAt(event.clientX);
    };

    const onFocusBand=(index)=>{
        const band=bandRefs.current[index];
        if(!band||prefersReducedMotion()){
            return;
        }
        // Aim at the band's resting centre so keyboard users get the same reveal.
        const rect=band.getBoundingClientRect();
        aimAt(rect.left+rect.width/2);
    };

    useEffect(()=>{
        return ()=>{
            cancelAnimationFrame(frame.current);
        };
    },[]);

    return (
        <nav aria-label="Browse by track">
            {/* Wide screens: the dock */}
            <ul
                className="track-dock hidden h-[clamp(20rem,44vh,28rem)] gap-2 lg:flex"
                onPointerMove={onPointerMove}
                onPointerLeave={relax}
                onBlur={(event)=>{
                    if(!event.currentTarget.contains(event.relatedTarget)){
                        relax();
                    }
                }}
            >
                {summaries.map((summary,index)=>{
                    const track=summary.track;
                    const image=summary.cover?getSizedImageUrl(summary.cover.cover.url,640,800):null;
                    return (
                        <li
                            key={track.id}
                            ref={(node)=>{
                                bandRefs.current[index]=node;
                            }}
                            className="dock-band @container relative isolate min-w-[5.75rem] flex-1 overflow-hidden rounded-2xl"
                            style={{'--tint':track.color}}
                        >
                            <Link
                                to={'/events?track='+track.id}
                                aria-label={getLinkLabel(summary)}
                                onFocus={()=>{
                                    onFocusBand(index);
                                }}
                                className="group absolute inset-0 flex flex-col justify-between p-4 outline-none xl:p-5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bone"
                            >
                                <span className="absolute inset-0 -z-10" aria-hidden="true">
                                    <span className="duotone block h-full w-full">
                                        {image?<img className="duo-base" src={image} alt="" loading="eager" fetchPriority="low" decoding="async" width="640" height="800"/>:null}
                                        <span className="duo-tint"/>
                                        <span className="duo-lift"/>
                                        <span className="dock-shade"/>
                                    </span>
                                </span>
                                <span className="flex items-start justify-between gap-3">
                                    <span className="label-mono text-bone/80">{String(index+1).padStart(2,'0')}</span>
                                    <span className="dock-detail label-mono rounded-full bg-ink/70 px-2.5 py-1 text-bone backdrop-blur-sm">
                                        {summary.count} {summary.count===1?'event':'events'}
                                    </span>
                                </span>
                                {/* "Browse" sits above the label, so every label keeps the same baseline. */}
                                <span className="flex flex-col items-start gap-2.5">
                                    <span className="dock-detail inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold" style={{color:track.color}}>
                                        Browse
                                        <Icon name="arrowRight" size={15}/>
                                    </span>
                                    {/* Sized from the band's own width (container units), so a squeezed band
                                        shrinks its label instead of cutting "Engineering" in half. */}
                                    <span className="condensed block text-[length:clamp(0.8rem,calc((100cqi_-_2.5rem)/4.7),2.25rem)] font-extrabold leading-[0.95] tracking-tight text-bone">
                                        {track.label}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* Phones and tablets (touch, no hover to swell): a grid of tiles */}
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
                {summaries.map((summary)=>{
                    const track=summary.track;
                    const image=summary.cover?getSizedImageUrl(summary.cover.cover.url,360,300):null;
                    return (
                        <li key={track.id} className="relative isolate aspect-[6/5] overflow-hidden rounded-2xl" style={{'--tint':track.color}}>
                            <Link to={'/events?track='+track.id} aria-label={getLinkLabel(summary)} className="absolute inset-0 flex flex-col justify-end p-3.5">
                                <span className="absolute inset-0 -z-10" aria-hidden="true">
                                    <span className="duotone block h-full w-full">
                                        {image?<img className="duo-base" src={image} alt="" loading="lazy" decoding="async" width="360" height="300"/>:null}
                                        <span className="duo-tint"/>
                                        <span className="duo-lift"/>
                                        <span className="dock-shade"/>
                                    </span>
                                </span>
                                <span className="condensed text-xl font-extrabold leading-[0.95] tracking-tight text-bone">{track.label}</span>
                                <span className="label-mono mt-1 text-bone/80">{summary.count} {summary.count===1?'event':'events'}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default TrackDock;
