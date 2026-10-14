import DetailSection from './DetailSection';
import {splitParagraphs} from '../../utils/eventDetail';

const PointList=({title,items,color})=>{
    if(items.length===0){
        return null;
    }
    return (
        <div>
            <h3 className="label-mono text-ash">{title}</h3>
            <ul className="mt-4 space-y-3">
                {items.map((item,index)=>{
                    return (
                        <li key={index} className="flex gap-3 leading-relaxed text-bone/90">
                            <span aria-hidden="true" className="mt-[0.7em] h-[2px] w-3 shrink-0" style={{backgroundColor:color}}/>
                            {item}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// The story of the event, then the highlights and what the day looks like.
const AboutSection=({event,isLoadingMore,hideBlurb})=>{
    const paragraphs=splitParagraphs(event.description);
    return (
        <DetailSection id="about" eyebrow="The event" title="About">
            <div className="space-y-5">
                {event.blurb&&!hideBlurb?<p className="max-w-[65ch] text-xl leading-snug text-bone">{event.blurb}</p>:null}
                {paragraphs.map((paragraph,index)=>{
                    return <p key={index} className="max-w-[65ch] text-[1.0625rem] leading-relaxed text-bone/80">{paragraph}</p>;
                })}
                {isLoadingMore?(
                    <div className="max-w-[65ch] space-y-3" aria-hidden="true">
                        <div className="skeleton h-4 w-full rounded"/>
                        <div className="skeleton h-4 w-11/12 rounded"/>
                        <div className="skeleton h-4 w-4/5 rounded"/>
                    </div>
                ):null}
            </div>
            {event.highlights.length>0||event.whatToExpect.length>0?(
                <div className="mt-10 grid gap-10 sm:grid-cols-2">
                    <PointList title="Highlights" items={event.highlights} color={event.track.color}/>
                    <PointList title="What to expect" items={event.whatToExpect} color={event.track.color}/>
                </div>
            ):null}
        </DetailSection>
    );
};

export default AboutSection;
