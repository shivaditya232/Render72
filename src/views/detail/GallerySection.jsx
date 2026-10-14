import {useState} from 'react';
import DetailSection from './DetailSection';
import {buildSrcSet,getSizedImageUrl} from '../../utils/images';
import {getGalleryFacts} from '../../utils/eventDetail';

const PHOTO_WIDTHS=[480,800,1200];

// One gallery photo in full colour (the posters are two-tone; this is the real thing).
// A broken photo hides itself instead of showing a broken icon.
const BentoPhoto=({url,alt,className,sizes})=>{
    const [failed,setFailed]=useState(false);
    if(failed){
        return null;
    }
    return (
        <div className={'bento-photo relative overflow-hidden rounded-2xl bg-graphite '+className}>
            <img
                src={getSizedImageUrl(url,PHOTO_WIDTHS[1],null)}
                srcSet={buildSrcSet(url,PHOTO_WIDTHS,null)}
                sizes={sizes}
                alt={alt}
                width={PHOTO_WIDTHS[1]}
                height={Math.round(PHOTO_WIDTHS[1]*0.66)}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                onError={()=>{
                    setFailed(true);
                }}
            />
        </div>
    );
};

const FactTile=({fact,className,color,isAccent})=>{
    return (
        <div
            className={'flex flex-col justify-end rounded-2xl p-5 '+className}
            style={isAccent?{backgroundColor:color}:{backgroundColor:'var(--color-graphite)'}}
        >
            <p className={'condensed text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.9] tracking-tight '+(isAccent?'text-ink':'text-bone')}>{fact.value}</p>
            <p className={'label-mono mt-2 '+(isAccent?'text-ink/75':'text-ash')}>{fact.label}</p>
        </div>
    );
};

// Bento grid: a big photo, a wide photo, and the event's numbers set as tiles.
// Works with one or two photos, and with one or two fact tiles.
const GallerySection=({event})=>{
    const photos=event.gallery.slice(0,2);
    const facts=getGalleryFacts(event);
    const altBase='Photo from '+event.name;
    const hasSecond=photos.length>1;
    let factClass='col-span-1 aspect-square lg:aspect-auto';
    if(!hasSecond||facts.length===1){
        factClass='col-span-2 aspect-[2/1] lg:aspect-auto';
    }
    return (
        <DetailSection id="gallery" eyebrow={event.isPast?'From the day':'From past editions'} title="Gallery">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-[15rem_15rem]">
                <BentoPhoto url={photos[0]} alt={altBase+', 1 of '+photos.length} className="col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto" sizes="(min-width:1024px) 34vw, 92vw"/>
                {hasSecond?(
                    <BentoPhoto url={photos[1]} alt={altBase+', 2 of '+photos.length} className="col-span-2 aspect-[16/9] lg:aspect-auto" sizes="(min-width:1024px) 34vw, 92vw"/>
                ):null}
                {facts.map((fact,index)=>{
                    let className=factClass;
                    if(!hasSecond&&facts.length===2){
                        className='col-span-2 aspect-[2/1] lg:aspect-auto';
                    }
                    if(!hasSecond&&facts.length===1){
                        className='col-span-2 aspect-[2/1] lg:row-span-2 lg:aspect-auto';
                    }
                    return <FactTile key={index} fact={fact} className={className} color={event.track.color} isAccent={index===0}/>;
                })}
            </div>
        </DetailSection>
    );
};

export default GallerySection;
