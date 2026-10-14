import {useState} from 'react';
import {buildSrcSet,getSizedImageUrl} from '../../utils/images';

const WIDTHS=[360,540,720];
const RATIO=1.25;

// The two-tone cover. Both <img> tags use the same URLs, so the browser downloads once.
// The colour copy sits on top and is only revealed inside a soft circle under the mouse
// (the card tracks the mouse and writes --x/--y onto frameRef).
const PosterImage=({url,alt,trackLabel,sizes,priority,frameRef})=>{
    const [failed,setFailed]=useState(false);

    const src=getSizedImageUrl(url,WIDTHS[1],Math.round(WIDTHS[1]*RATIO));
    const srcSet=buildSrcSet(url,WIDTHS,RATIO);

    if(!src||failed){
        // No image (or it failed): a typographic poster instead of a broken icon.
        return (
            <div className="duotone flex items-end p-5" aria-hidden="true">
                <span className="condensed text-5xl font-extrabold uppercase leading-[0.85] text-line">
                    {trackLabel}
                </span>
            </div>
        );
    }

    return (
        <div ref={frameRef} className="duotone h-full w-full">
            <img
                className="duo-base"
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                width={WIDTHS[1]}
                height={Math.round(WIDTHS[1]*RATIO)}
                loading={priority?'eager':'lazy'}
                fetchPriority={priority?'high':'auto'}
                decoding="async"
                onError={()=>{
                    setFailed(true);
                }}
            />
            <div className="duo-tint" aria-hidden="true"/>
            <img
                className="duo-reveal"
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                alt=""
                aria-hidden="true"
                loading={priority?'eager':'lazy'}
                decoding="async"
            />
            <div className="duo-shade" aria-hidden="true"/>
        </div>
    );
};

export default PosterImage;
