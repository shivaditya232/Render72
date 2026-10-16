import {buildSrcSet,getSizedImageUrl} from '../../utils/images';
import useImageLoad from '../../controllers/useImageLoad';
import PhotoUnavailable from '../components/PhotoUnavailable';

const TALL_WIDTHS=[360,540,720];
const TALL_RATIO=1.25;
const WIDE_WIDTHS=[640,960,1280];
const WIDE_RATIO=0.625;
const WIDE_MEDIA='(min-width: 640px)';

// One photo layer. Featured posters are wide from 640px up and tall on phones,
// so they ask Pexels for the matching crop instead of zooming a wrong-shaped one.
const PhotoLayer=({url,className,alt,sizes,wideSizes,isWide,priority,onLoad,onError,isDecorative,imgRef})=>{
    const tallSrc=getSizedImageUrl(url,TALL_WIDTHS[1],Math.round(TALL_WIDTHS[1]*TALL_RATIO));
    const tallSet=buildSrcSet(url,TALL_WIDTHS,TALL_RATIO);
    const img=(
        <img
            ref={imgRef}
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
            onLoad={onLoad}
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
// The colour copy sits on top and is only revealed inside a circle under the mouse
// (the card tracks the mouse and writes --x/--y onto frameRef).
// Photos further down the page load only when they come near the screen; until a photo
// arrives a shimmer holds its place, and if it can't load a calm panel replaces it.
const PosterImage=({url,alt,trackLabel,tint,sizes,wideSizes,isWide,priority,frameRef})=>{
    const photo=useImageLoad(url);
    const tintStyle={'--tint':tint};
    const hasUrl=Boolean(getSizedImageUrl(url,TALL_WIDTHS[1],null));

    if(!hasUrl||photo.status==='failed'){
        return (
            <div className="duotone h-full w-full" style={tintStyle} role={hasUrl?'img':undefined} aria-label={hasUrl?(alt||trackLabel)+' (photo unavailable)':undefined}>
                <PhotoUnavailable tint={tint}/>
            </div>
        );
    }

    const isLoading=photo.status!=='loaded';
    // Priority photos (the first poster) are never hidden while loading, so the page's
    // main image is painted as early as possible.
    const fadeClass=priority?'duo-base':'duo-base transition-opacity duration-300 '+(isLoading?'opacity-0':'opacity-100');

    return (
        <div ref={frameRef} className="duotone h-full w-full" style={tintStyle}>
            <PhotoLayer
                key={'base-'+photo.attempt}
                url={url}
                className={fadeClass}
                alt={alt}
                sizes={sizes}
                wideSizes={wideSizes}
                isWide={isWide}
                priority={priority}
                imgRef={photo.imgRef}
                onLoad={photo.onLoad}
                onError={photo.onError}
            />
            <div className="duo-tint" aria-hidden="true"/>
            <div className="duo-lift" aria-hidden="true"/>
            {isLoading?null:(
                <PhotoLayer
                    url={url}
                    className="duo-reveal"
                    sizes={sizes}
                    wideSizes={wideSizes}
                    isWide={isWide}
                    priority={priority}
                    isDecorative={true}
                />
            )}
            <div className="duo-shade" aria-hidden="true"/>
            {isLoading?<div className="skeleton absolute inset-0" aria-hidden="true"/>:null}
        </div>
    );
};

export default PosterImage;
