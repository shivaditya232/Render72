import {useState} from 'react';
import {buildSrcSet,getSizedImageUrl} from '../../utils/images';

const TALL_WIDTHS=[360,540,720];
const TALL_RATIO=1.25;
const WIDE_WIDTHS=[640,960,1280];
const WIDE_RATIO=0.625;
const WIDE_MEDIA='(min-width: 640px)';

// One photo layer. Featured posters are wide from 640px up and tall on phones,
// so they ask Pexels for the matching crop instead of zooming a wrong-shaped one.
const PhotoLayer=({url,className,alt,sizes,wideSizes,isWide,priority,onError,isDecorative})=>{
    const tallSrc=getSizedImageUrl(url,TALL_WIDTHS[1],Math.round(TALL_WIDTHS[1]*TALL_RATIO));
    const tallSet=buildSrcSet(url,TALL_WIDTHS,TALL_RATIO);
    const img=(
        <img
            className={className}
            src={tallSrc}
            srcSet={tallSet}
            sizes={sizes}
            alt={isDecorative?'':alt}
            aria-hidden={isDecorative?'true':undefined}
            width={TALL_WIDTHS[1]}
            height={Math.round(TALL_WIDTHS[1]*TALL_RATIO)}
            loading={priority?'eager':'lazy'}
            fetchPriority={priority&&!isDecorative?'high':'auto'}
            decoding="async"
            onError={onError}
        />
    );
    if(!isWide){
        return img;
    }
    return (
        <picture>
            <source media={WIDE_MEDIA} srcSet={buildSrcSet(url,WIDE_WIDTHS,WIDE_RATIO)} sizes={wideSizes}/>
            {img}
        </picture>
    );
};

// The two-tone cover, printed in the event's track colour (tint).
// Both photo layers use the same URLs, so the browser downloads each image once.
// The colour copy sits on top and is only revealed inside a soft circle under the mouse
// (the card tracks the mouse and writes --x/--y onto frameRef).
const PosterImage=({url,alt,trackLabel,tint,sizes,wideSizes,isWide,priority,frameRef})=>{
    const [failed,setFailed]=useState(false);
    const tintStyle={'--tint':tint};

    if(!getSizedImageUrl(url,TALL_WIDTHS[1],null)||failed){
        // No image (or it failed): a typographic poster in the track colour instead of a broken icon.
        return (
            <div className="duotone flex h-full w-full items-end p-5" style={tintStyle} aria-hidden="true">
                <div className="duo-lift"/>
                <span className="condensed relative text-5xl font-extrabold uppercase leading-[0.85]" style={{color:tint}}>
                    {trackLabel}
                </span>
            </div>
        );
    }

    return (
        <div ref={frameRef} className="duotone h-full w-full" style={tintStyle}>
            <PhotoLayer
                url={url}
                className="duo-base"
                alt={alt}
                sizes={sizes}
                wideSizes={wideSizes}
                isWide={isWide}
                priority={priority}
                onError={()=>{
                    setFailed(true);
                }}
            />
            <div className="duo-tint" aria-hidden="true"/>
            <div className="duo-lift" aria-hidden="true"/>
            <PhotoLayer
                url={url}
                className="duo-reveal"
                sizes={sizes}
                wideSizes={wideSizes}
                isWide={isWide}
                priority={priority}
                isDecorative={true}
            />
            <div className="duo-shade" aria-hidden="true"/>
        </div>
    );
};

export default PosterImage;
