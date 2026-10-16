import {useRef} from 'react';
import {buildSrcSet,getSizedImageUrl} from '../../utils/images';
import {getDateParts,formatPosterNumber,isMultiDay} from '../../utils/formatters';
import {POSTER_TRANSITION_NAME} from '../../utils/posterTransition';
import useImageLoad from '../../controllers/useImageLoad';
import PhotoUnavailable from '../components/PhotoUnavailable';

// Each screen size gets a photo cropped to the shape it's shown in.
// Phones 4:3, tablets 16:9 across the page, desktops a 4:5 poster beside the title.
const PHONE={widths:[480,720,960],ratio:0.75};
const TABLET={widths:[768,1024,1280],ratio:0.5625,media:'(min-width: 640px)'};
const DESKTOP={widths:[400,600,800],ratio:1.25,media:'(min-width: 1024px)'};

const HeroPhoto=({url,alt,className,isDecorative,onLoad,onError,imgRef})=>{
    return (
        <picture>
            <source media={DESKTOP.media} srcSet={buildSrcSet(url,DESKTOP.widths,DESKTOP.ratio)} sizes="380px"/>
            <source media={TABLET.media} srcSet={buildSrcSet(url,TABLET.widths,TABLET.ratio)} sizes="94vw"/>
            <img
                ref={imgRef}
                className={className}
                src={getSizedImageUrl(url,PHONE.widths[1],Math.round(PHONE.widths[1]*PHONE.ratio))}
                srcSet={buildSrcSet(url,PHONE.widths,PHONE.ratio)}
                sizes="94vw"
                alt={isDecorative?'':alt}
                aria-hidden={isDecorative?'true':undefined}
                width={PHONE.widths[1]}
                height={Math.round(PHONE.widths[1]*PHONE.ratio)}
                loading="eager"
                fetchPriority={isDecorative?'auto':'high'}
                decoding="async"
                onLoad={onLoad}
                onError={onError}
            />
        </picture>
    );
};

// The event's photo printed in its track colour, the date set large in the corner
// like the posters: a wide banner on phones and tablets, a tall poster on desktop. The real colours come through under the mouse.
const EventHero=({event,posterNumber})=>{
    const photo=useImageLoad(event.banner.url);
    const frameRef=useRef(null);
    const pending=useRef(false);
    const date=getDateParts(event.start);
    const spansDays=isMultiDay(event.start,event.end);
    const url=event.banner.url;
    const hasUrl=Boolean(getSizedImageUrl(url,PHONE.widths[0],null));
    const hasPhoto=hasUrl&&photo.status!=='failed';
    const isLoading=photo.status!=='loaded';

    const onPointerMove=(pointerEvent)=>{
        if(pointerEvent.pointerType!=='mouse'||pending.current){
            return;
        }
        pending.current=true;
        const clientX=pointerEvent.clientX;
        const clientY=pointerEvent.clientY;
        requestAnimationFrame(()=>{
            pending.current=false;
            const frame=frameRef.current;
            if(!frame){
                return;
            }
            const rect=frame.getBoundingClientRect();
            frame.style.setProperty('--x',(clientX-rect.left)+'px');
            frame.style.setProperty('--y',(clientY-rect.top)+'px');
        });
    };

    return (
        <div className="poster-card vt-poster relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/9] lg:aspect-[4/5]" style={{viewTransitionName:POSTER_TRANSITION_NAME}} onPointerMove={onPointerMove}>
            {hasPhoto?(
                <div ref={frameRef} className="duotone h-full w-full" style={{'--tint':event.track.color,'--reveal-size':'200px'}}>
                    <HeroPhoto
                        key={'hero-'+photo.attempt}
                        url={url}
                        alt={event.banner.alt}
                        className="duo-base"
                        imgRef={photo.imgRef}
                        onLoad={photo.onLoad}
                        onError={photo.onError}
                    />
                    <div className="duo-tint" aria-hidden="true"/>
                    <div className="duo-lift" aria-hidden="true"/>
                    {isLoading?null:<HeroPhoto url={url} className="duo-reveal" isDecorative={true}/>}
                    <div className="duo-shade" aria-hidden="true"/>
                    {isLoading?<div className="skeleton absolute inset-0" aria-hidden="true"/>:null}
                </div>
            ):(
                <div className="duotone h-full w-full" style={{'--tint':event.track.color}} role={hasUrl?'img':undefined} aria-label={hasUrl?event.banner.alt+' (photo unavailable)':undefined}>
                    <PhotoUnavailable tint={event.track.color}/>
                </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start gap-2 p-4 sm:p-5">
                {posterNumber?(
                    <span className="label-mono rounded-md bg-ink/75 px-2 py-1 text-bone backdrop-blur-sm">{formatPosterNumber(posterNumber)}</span>
                ):null}
                {event.isFeatured?(
                    <span className="label-mono rounded-md px-2 py-1 font-semibold text-ink" style={{backgroundColor:event.track.color}}>Featured</span>
                ):null}
                {event.isPast?(
                    <span className="label-mono rounded-md bg-ink/75 px-2 py-1 text-ash backdrop-blur-sm">Ended</span>
                ):null}
            </div>

            {date?(
                <div className="pointer-events-none absolute bottom-4 left-4 flex items-end gap-3 text-bone sm:bottom-6 sm:left-6">
                    <span className="condensed tabular text-[clamp(4.5rem,11vw,9rem)] lg:text-[6.5rem] font-extrabold leading-[0.78] tracking-tight">{date.day}</span>
                    <span className="label-mono pb-1 leading-tight sm:text-xs">
                        {date.month} {date.year}
                        <br/>
                        {date.weekday}{spansDays?' + more days':''}
                    </span>
                </div>
            ):null}
        </div>
    );
};

export default EventHero;
