import {getSizedImageUrl} from '../../utils/images';

// The event's details as a set of tiles, each with one number worth knowing
// ("6 rules", "₹30,000 in prizes"). Nothing long is on the page itself:
// a tile opens its section in a panel.
// Hover: the track colour rises from the tile's bottom edge and fills it.
const WIDE_TILES=['prizes','gallery'];

const SectionTiles=({teasers,event,onOpen,isLoadingMore})=>{
    return (
        <div>
            <h2 className="label-mono text-ash">Everything about it</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                {teasers.map((teaser,index)=>{
                    const isWide=WIDE_TILES.includes(teaser.id);
                    const photo=teaser.id==='gallery'&&event.gallery.length>0?getSizedImageUrl(event.gallery[0],640,null):null;
                    return (
                        <li key={teaser.id} className={isWide?'col-span-2':''}>
                            <button
                                type="button"
                                onClick={()=>{
                                    onOpen(index);
                                }}
                                aria-haspopup="dialog"
                                className="group relative isolate flex h-40 w-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-graphite p-4 text-left transition-[border-color,transform] duration-300 hover:-translate-y-0.5 sm:h-44 sm:p-5"
                                style={{'--tint':event.track.color}}
                            >
                                {photo?(
                                    <>
                                        <img src={photo} alt="" loading="lazy" decoding="async" width="640" height="420" className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                                        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10"/>
                                    </>
                                ):(
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 -z-10 origin-bottom scale-y-[0.025] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
                                        style={{backgroundColor:event.track.color}}
                                    />
                                )}
                                <span className={'flex items-center justify-between gap-2 '+(photo?'text-bone':'text-ash transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink')}>
                                    <span className="label-mono">{teaser.label}</span>
                                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-300 group-hover:rotate-90">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                </span>
                                <span className={photo?'text-bone':'transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink'}>
                                    <span className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="condensed tabular text-[2.5rem] font-extrabold leading-[0.85] tracking-tight sm:text-5xl">{teaser.value}</span>
                                        <span className="text-sm font-medium">{teaser.unit}</span>
                                    </span>
                                    {teaser.note?(
                                        <span className={'mt-2 line-clamp-1 text-[0.8125rem] '+(photo?'text-bone/80':'text-ash transition-colors duration-300 group-hover:text-ink/75 group-focus-visible:text-ink/75')}>{teaser.note}</span>
                                    ):null}
                                </span>
                            </button>
                        </li>
                    );
                })}
                {isLoadingMore?(
                    <>
                        <li aria-hidden="true" className="skeleton h-40 rounded-2xl sm:h-44"/>
                        <li aria-hidden="true" className="skeleton h-40 rounded-2xl sm:h-44"/>
                        <li aria-hidden="true" className="skeleton col-span-2 h-40 rounded-2xl sm:h-44"/>
                    </>
                ):null}
            </ul>
        </div>
    );
};

export default SectionTiles;
